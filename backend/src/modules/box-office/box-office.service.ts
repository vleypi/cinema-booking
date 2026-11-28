import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, type Repository } from 'typeorm';
import { RedisClient } from '@/common/redis/redis.client.js';
import { fieldError } from '@/common/validation/validation-errors.js';
import { BOX_OFFICE_MESSAGES, BOX_OFFICE_SEARCH_LIMIT } from '@/modules/box-office/box-office.constant.js';
import type { BoxOfficeOrderDto } from '@/modules/box-office/dto/box-office-order.dto.js';
import type { CreateBoxOfficeOrderDto } from '@/modules/box-office/dto/create-box-office-order.dto.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import type { SessionSeatsDto } from '@/modules/orders/dto/session-seats.dto.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { OCCUPIED_TICKET_STATUSES, seatHoldKey } from '@/modules/orders/orders.constant.js';
import { OrdersService } from '@/modules/orders/orders.service.js';
import { generateOrderNumber, generateTicketCode } from '@/modules/orders/ticket-code.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { calculateSessionSeatPrice } from '@/modules/sessions/session-price.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

const UNIQUE_VIOLATION_CODE = '23505';

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError && (error.driverError as { code?: string }).code === UNIQUE_VIOLATION_CODE;

const toBoxOfficeOrderDto = (order: Order, signQr: (code: string) => string): BoxOfficeOrderDto => ({
  id: order.id,
  number: order.number,
  cinemaId: order.cinemaId,
  channel: order.channel,
  status: order.status,
  totalAmount: order.totalAmount,
  contactEmail: order.contactEmail,
  customerName: order.customer?.name ?? null,
  customerPhone: order.customer?.phone ?? null,
  cashierId: order.cashierId,
  createdAt: order.createdAt,
  session: {
    id: order.session.id,
    startsAt: order.session.startsAt,
    endsAt: order.session.endsAt,
    format: order.session.format,
    filmTitle: order.session.film.title,
    hallName: order.session.hall.name,
  },
  tickets: order.tickets
    .toSorted((first, second) => first.seat.row - second.seat.row || first.seat.number - second.seat.number)
    .map((ticket) => ({
      id: ticket.id,
      seatId: ticket.seatId,
      code: ticket.code,
      price: ticket.price,
      status: ticket.status,
      row: ticket.seat.row,
      number: ticket.seat.number,
      seatType: ticket.seat.type,
      qrPayload: ticket.status === TicketStatus.Active ? signQr(ticket.code) : null,
    })),
});

@Injectable()
export class BoxOfficeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisClient,
    private readonly ordersService: OrdersService,
    private readonly ticketsService: TicketsService,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
    @InjectRepository(TimeBand) private readonly timeBands: Repository<TimeBand>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
  ) {}

  async getSessionSeats(cinemaId: string, sessionId: string): Promise<SessionSeatsDto> {
    await this.ordersService.releaseExpiredHolds(sessionId);
    const session = await this.#loadBoxOfficeSession(cinemaId, sessionId);
    const cinema = session.hall.cinema;

    const [layoutSeats, bands, occupiedTickets] = await Promise.all([
      this.seats.find({
        where: { layoutId: session.layoutId },
        relations: { priceZone: true },
        order: { posY: 'ASC', posX: 'ASC' },
      }),
      this.timeBands.findBy({ cinemaId: cinema.id }),
      this.tickets.find({
        select: { seatId: true },
        where: { sessionId, status: In([...OCCUPIED_TICKET_STATUSES]) },
      }),
    ]);

    const occupiedSeatIds = new Set(occupiedTickets.map(({ seatId }) => seatId));
    if (layoutSeats.length > 0) {
      const redisValues = await this.redis.mget(layoutSeats.map(({ id }) => seatHoldKey(sessionId, id)));
      layoutSeats.forEach((seat, index) => {
        if (redisValues[index] !== null) occupiedSeatIds.add(seat.id);
      });
    }

    const zonePriceMap = new Map<string, { id: string; name: string; multiplier: number; price: number }>();
    const seats = layoutSeats.map((seat) => {
      const price = calculateSessionSeatPrice(session, bands, cinema.timezone, seat.priceZone.multiplier);
      if (!zonePriceMap.has(seat.priceZoneId)) {
        zonePriceMap.set(seat.priceZoneId, {
          id: seat.priceZone.id,
          name: seat.priceZone.name,
          multiplier: seat.priceZone.multiplier,
          price,
        });
      }

      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        posX: seat.posX,
        posY: seat.posY,
        type: seat.type,
        priceZoneId: seat.priceZoneId,
        price,
        isAvailable: !occupiedSeatIds.has(seat.id),
      };
    });

    return {
      sessionId: session.id,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      format: session.format,
      film: {
        id: session.film.id,
        title: session.film.title,
        ageRating: session.film.ageRating,
        durationMinutes: session.film.durationMinutes,
      },
      hall: {
        id: session.hall.id,
        name: session.hall.name,
        format: session.hall.format,
      },
      cinema: {
        id: cinema.id,
        name: cinema.name,
        timezone: cinema.timezone,
      },
      priceZones: [...zonePriceMap.values()].toSorted((first, second) => first.multiplier - second.multiplier),
      seats,
    };
  }

  async createOrder(cinemaId: string, cashierId: string, dto: CreateBoxOfficeOrderDto): Promise<BoxOfficeOrderDto> {
    await this.ordersService.releaseExpiredHolds(dto.sessionId);
    const session = await this.#loadBoxOfficeSession(cinemaId, dto.sessionId);
    const cinema = session.hall.cinema;

    const [selectedSeats, bands] = await Promise.all([
      this.seats.find({
        where: { id: In(dto.seatIds), layoutId: session.layoutId },
        relations: { priceZone: true },
      }),
      this.timeBands.findBy({ cinemaId: cinema.id }),
    ]);

    if (selectedSeats.length !== dto.seatIds.length) {
      throw new BadRequestException(fieldError('seatIds', BOX_OFFICE_MESSAGES.seatNotInLayout));
    }

    const holdValues = await this.redis.mget(dto.seatIds.map((seatId) => seatHoldKey(session.id, seatId)));
    if (holdValues.some((value) => value !== null)) {
      throw new ConflictException(fieldError('seatIds', BOX_OFFICE_MESSAGES.seatsAlreadyTaken));
    }

    const pricedSeats = selectedSeats.map((seat) => ({
      seat,
      price: calculateSessionSeatPrice(session, bands, cinema.timezone, seat.priceZone.multiplier),
    }));
    const totalAmount = pricedSeats.reduce((sum, item) => sum + item.price, 0);
    const now = new Date();

    let createdOrderId: string;
    try {
      createdOrderId = await this.dataSource.transaction(async (manager) => {
        let customerId: string | null = null;
        if (dto.email) {
          const customerRepo = manager.getRepository(Customer);
          let customer = await customerRepo.findOneBy({ email: dto.email });
          if (!customer) {
            customer = await customerRepo.save(
              customerRepo.create({
                email: dto.email,
                emailVerifiedAt: null,
                name: dto.name ?? null,
                phone: dto.phone ?? null,
                passwordHash: null,
              }),
            );
          } else if ((dto.name && !customer.name) || (dto.phone && !customer.phone)) {
            customer.name = customer.name ?? dto.name ?? null;
            customer.phone = customer.phone ?? dto.phone ?? null;
            customer = await customerRepo.save(customer);
          }
          customerId = customer.id;
        }

        const orderRepo = manager.getRepository(Order);
        const order = await orderRepo.save(
          orderRepo.create({
            number: generateOrderNumber(),
            cinemaId: cinema.id,
            sessionId: session.id,
            customerId,
            contactEmail: dto.email ?? null,
            channel: OrderChannel.BoxOffice,
            cashierId,
            status: OrderStatus.Paid,
            totalAmount,
            holdExpiresAt: null,
            ageConfirmed: false,
          }),
        );

        const ticketRepo = manager.getRepository(Ticket);
        await ticketRepo.save(
          pricedSeats.map(({ seat, price }) =>
            ticketRepo.create({
              orderId: order.id,
              sessionId: session.id,
              seatId: seat.id,
              code: generateTicketCode(),
              price,
              status: TicketStatus.Active,
              usedAt: null,
              usedById: null,
            }),
          ),
        );

        const paymentRepo = manager.getRepository(Payment);
        await paymentRepo.save(
          paymentRepo.create({
            orderId: order.id,
            provider: dto.paymentMethod,
            externalId: null,
            idempotenceKey: randomUUID(),
            amount: totalAmount,
            status: PaymentStatus.Succeeded,
            paidAt: now,
          }),
        );

        return order.id;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(fieldError('seatIds', BOX_OFFICE_MESSAGES.seatsAlreadyTaken));
      }
      throw error;
    }

    if (dto.email) {
      await this.ticketsService.enqueueOrderTicketsEmail(createdOrderId).catch(() => undefined);
    }

    const loaded = await this.orders.findOneOrFail({
      where: { id: createdOrderId },
      relations: { customer: true, session: { film: true, hall: true }, tickets: { seat: true } },
    });

    return toBoxOfficeOrderDto(loaded, (code) => this.ticketsService.signTicketQr(code));
  }

  async searchOrders(cinemaId: string, query?: string): Promise<BoxOfficeOrderDto[]> {
    const qb = this.orders
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .innerJoinAndSelect('order.session', 'session')
      .innerJoinAndSelect('session.film', 'film')
      .innerJoinAndSelect('session.hall', 'hall')
      .leftJoinAndSelect('order.tickets', 'ticket')
      .leftJoinAndSelect('ticket.seat', 'seat')
      .where('order.cinemaId = :cinemaId', { cinemaId })
      .orderBy('order.createdAt', 'DESC')
      .addOrderBy('order.id', 'DESC')
      .take(BOX_OFFICE_SEARCH_LIMIT);

    if (query) {
      const pattern = `%${query}%`;
      qb.andWhere(
        '(order.number ILIKE :pattern OR order.contactEmail ILIKE :pattern OR customer.email ILIKE :pattern OR customer.phone ILIKE :pattern OR ticket.code ILIKE :pattern)',
        { pattern },
      );
    }

    const found = await qb.getMany();

    return found.map((order) => toBoxOfficeOrderDto(order, (code) => this.ticketsService.signTicketQr(code)));
  }

  async #loadBoxOfficeSession(cinemaId: string, sessionId: string): Promise<Session> {
    const session = await this.sessions.findOne({
      where: { id: sessionId, status: SessionStatus.Scheduled },
      relations: { film: true, hall: { cinema: true } },
    });
    if (!session || session.hall.cinemaId !== cinemaId) {
      throw new NotFoundException(BOX_OFFICE_MESSAGES.sessionNotFound);
    }
    if (session.endsAt <= new Date()) {
      throw new ConflictException(BOX_OFFICE_MESSAGES.sessionEnded);
    }

    return session;
  }
}
