import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import type { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import type {
  OccupancySessionItemDto,
  ReportPeriodQueryDto,
  RevenueByChannelDto,
  RevenueByFilmDto,
  RevenueByHallDto,
  RevenueReportDto,
} from '@/modules/reports/dto/report.dto.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';

const PAID_ORDER_STATUSES = [OrderStatus.Paid, OrderStatus.PartiallyRefunded, OrderStatus.Refunded] as const;

interface IRevenueTotals {
  grossAmount: number;
  refundedAmount: number;
  netRevenue: number;
  ticketsSold: number;
  ticketsRefunded: number;
}

const createEmptyTotals = (): IRevenueTotals => ({
  grossAmount: 0,
  refundedAmount: 0,
  netRevenue: 0,
  ticketsSold: 0,
  ticketsRefunded: 0,
});

const applyTicketToTotals = (bucket: IRevenueTotals, ticket: Ticket): void => {
  if (ticket.status === TicketStatus.Active || ticket.status === TicketStatus.Used || ticket.status === TicketStatus.Refunded) {
    bucket.grossAmount += ticket.price;
    bucket.ticketsSold += 1;
  }
  if (ticket.status === TicketStatus.Refunded) {
    bucket.refundedAmount += ticket.price;
    bucket.ticketsRefunded += 1;
  }
  bucket.netRevenue = bucket.grossAmount - bucket.refundedAmount;
};

const parsePeriodBounds = (query: ReportPeriodQueryDto): { from: Date | null; to: Date | null } => ({
  from: query.from ? new Date(query.from) : null,
  to: query.to ? new Date(query.to.length === 10 ? `${query.to}T23:59:59.999Z` : query.to) : null,
});

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
  ) {}

  async getRevenueReport(cinemaId: string, query: ReportPeriodQueryDto): Promise<RevenueReportDto> {
    const { from, to } = parsePeriodBounds(query);
    const qb = this.orders
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.session', 'session')
      .innerJoinAndSelect('session.film', 'film')
      .innerJoinAndSelect('session.hall', 'hall')
      .leftJoinAndSelect('order.tickets', 'ticket')
      .where('order.cinemaId = :cinemaId', { cinemaId })
      .andWhere('order.status IN (:...statuses)', { statuses: PAID_ORDER_STATUSES });

    if (from) qb.andWhere('order.createdAt >= :from', { from });
    if (to) qb.andWhere('order.createdAt <= :to', { to });

    const orders = await qb.getMany();

    const totals = createEmptyTotals();
    const filmMap = new Map<string, RevenueByFilmDto>();
    const hallMap = new Map<string, RevenueByHallDto>();
    const channelMap = new Map<OrderChannel, RevenueByChannelDto>();

    for (const order of orders) {
      const film = order.session.film;
      const hall = order.session.hall;

      let filmBucket = filmMap.get(film.id);
      if (!filmBucket) {
        filmBucket = { filmId: film.id, filmTitle: film.title, ...createEmptyTotals() };
        filmMap.set(film.id, filmBucket);
      }

      let hallBucket = hallMap.get(hall.id);
      if (!hallBucket) {
        hallBucket = { hallId: hall.id, hallName: hall.name, ...createEmptyTotals() };
        hallMap.set(hall.id, hallBucket);
      }

      let channelBucket = channelMap.get(order.channel);
      if (!channelBucket) {
        channelBucket = { channel: order.channel, ...createEmptyTotals() };
        channelMap.set(order.channel, channelBucket);
      }

      for (const ticket of order.tickets) {
        applyTicketToTotals(totals, ticket);
        applyTicketToTotals(filmBucket, ticket);
        applyTicketToTotals(hallBucket, ticket);
        applyTicketToTotals(channelBucket, ticket);
      }
    }

    return {
      totals,
      byFilm: [...filmMap.values()].toSorted((first, second) => second.netRevenue - first.netRevenue),
      byHall: [...hallMap.values()].toSorted((first, second) => second.netRevenue - first.netRevenue),
      byChannel: [...channelMap.values()].toSorted((first, second) => second.netRevenue - first.netRevenue),
    };
  }

  async getOccupancyReport(cinemaId: string, query: ReportPeriodQueryDto): Promise<OccupancySessionItemDto[]> {
    const { from, to } = parsePeriodBounds(query);
    const qb = this.sessions
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.film', 'film')
      .innerJoinAndSelect('session.hall', 'hall')
      .where('hall.cinemaId = :cinemaId', { cinemaId })
      .orderBy('session.startsAt', 'DESC');

    if (from) qb.andWhere('session.startsAt >= :from', { from });
    if (to) qb.andWhere('session.startsAt <= :to', { to });

    const sessions = await qb.getMany();
    if (sessions.length === 0) return [];

    const layoutIds = [...new Set(sessions.map((session) => session.layoutId))];
    const sessionIds = sessions.map((session) => session.id);

    const [seatRows, ticketRows] = await Promise.all([
      this.seats.find({ select: { id: true, layoutId: true }, where: { layoutId: In(layoutIds) } }),
      this.tickets.find({
        select: { id: true, sessionId: true },
        where: { sessionId: In(sessionIds), status: In([TicketStatus.Active, TicketStatus.Used]) },
      }),
    ]);

    const seatCounts = new Map<string, number>();
    for (const seat of seatRows) {
      seatCounts.set(seat.layoutId, (seatCounts.get(seat.layoutId) ?? 0) + 1);
    }

    const soldCounts = new Map<string, number>();
    for (const ticket of ticketRows) {
      soldCounts.set(ticket.sessionId, (soldCounts.get(ticket.sessionId) ?? 0) + 1);
    }

    return sessions.map((session) => {
      const totalSeats = seatCounts.get(session.layoutId) ?? 0;
      const soldTickets = soldCounts.get(session.id) ?? 0;
      const occupancyPercent = totalSeats > 0 ? Math.round((soldTickets / totalSeats) * 1000) / 10 : 0;

      return {
        sessionId: session.id,
        startsAt: session.startsAt,
        filmTitle: session.film.title,
        hallName: session.hall.name,
        status: session.status,
        totalSeats,
        soldTickets,
        occupancyPercent,
      };
    });
  }
}
