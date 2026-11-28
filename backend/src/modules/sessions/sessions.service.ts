import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, type EntityManager, In, LessThan, MoreThan, MoreThanOrEqual, type Repository } from 'typeorm';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, formatTime, MIDNIGHT, MINUTE_MS, toUtc } from '@/common/time/zoned-time.js';
import { invalidField } from '@/common/validation/validation-errors.js';
import { AuditService } from '@/modules/audit/audit.service.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { canAccessCinema } from '@/modules/auth/permissions.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { seatHoldKey } from '@/modules/orders/orders.constant.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { RefundsService } from '@/modules/refunds/refunds.service.js';
import type { CancelSessionDto, CancelSessionPreviewDto, CancelSessionResultDto } from '@/modules/sessions/dto/cancel-session.dto.js';
import type { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { fitsOpeningHours } from '@/modules/sessions/session-schedule.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { SESSION_MESSAGES } from '@/modules/sessions/sessions.constant.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Injectable()
export class SessionsService {
  constructor(
    private readonly redis: RedisClient,
    private readonly refunds: RefundsService,
    private readonly audit: AuditService,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
    @InjectRepository(Film) private readonly films: Repository<Film>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
  ) {}

  async findByCinemaDay(cinemaId: string, date: string): Promise<Session[]> {
    const { timezone } = await this.cinemas.findOneByOrFail({ id: cinemaId });
    const dayStart = toUtc(date, MIDNIGHT, timezone);
    const nextDayStart = toUtc(addDays(date, 1), MIDNIGHT, timezone);

    return this.sessions.find({
      where: { hall: { cinemaId }, startsAt: And(MoreThanOrEqual(dayStart), LessThan(nextDayStart)) },
      relations: { film: true },
      order: { startsAt: 'ASC' },
    });
  }

  async create(cinemaId: string, { filmId, hallId, date, time, format, basePriceOverride }: CreateSessionDto): Promise<Session> {
    const cinema = await this.cinemas.findOneByOrFail({ id: cinemaId });
    const film = await this.films.findOneBy({ id: filmId });
    if (!film || film.status === FilmStatus.Archived) throw invalidField('filmId', SESSION_MESSAGES.filmUnavailable);

    const startsAt = toUtc(date, time, cinema.timezone);
    const endsAt = new Date(startsAt.getTime() + film.durationMinutes * MINUTE_MS);
    if (startsAt.getTime() <= Date.now()) throw invalidField('time', SESSION_MESSAGES.inPast);
    if (!fitsOpeningHours(time, film.durationMinutes, cinema)) {
      throw invalidField('time', SESSION_MESSAGES.outsideOpeningHours(cinema.opensAt, cinema.closesAt));
    }

    const sessionId = await this.sessions.manager.transaction(async (manager) => {
      const hall = await manager.findOne(Hall, { where: { id: hallId, cinemaId, isActive: true }, lock: { mode: 'pessimistic_write' } });
      if (!hall) throw invalidField('hallId', SESSION_MESSAGES.hallUnavailable);
      const layout = await manager.findOneBy(HallLayout, { hallId, isCurrent: true });
      if (!layout) throw invalidField('hallId', SESSION_MESSAGES.hallWithoutLayout);
      await this.#assertHallIsFree(manager, cinema, hallId, startsAt, endsAt);

      const { id } = await manager.save(
        manager.create(Session, { filmId, hallId, layoutId: layout.id, startsAt, endsAt, format, basePriceOverride: basePriceOverride ?? null }),
      );
      return id;
    });

    return this.sessions.findOneOrFail({ where: { id: sessionId }, relations: { film: true } });
  }

  async getCancelPreview(actor: StaffUser, id: string): Promise<CancelSessionPreviewDto> {
    const session = await this.sessions.findOne({ where: { id }, relations: { hall: true } });
    if (!session) throw new NotFoundException(SESSION_MESSAGES.notFound);
    if (!canAccessCinema(actor, session.hall.cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);

    const activeTickets = await this.tickets.find({
      select: { id: true, orderId: true, price: true },
      where: { sessionId: id, status: TicketStatus.Active },
    });

    const affectedOrdersCount = new Set(activeTickets.map((ticket) => ticket.orderId)).size;
    const refundAmount = activeTickets.reduce((sum, ticket) => sum + ticket.price, 0);

    return {
      sessionId: session.id,
      status: session.status,
      activeTicketsCount: activeTickets.length,
      refundAmount,
      affectedOrdersCount,
    };
  }

  async cancel(actor: StaffUser, id: string, dto: CancelSessionDto): Promise<CancelSessionResultDto> {
    const session = await this.sessions.findOne({ where: { id }, relations: { hall: true } });
    if (!session) throw new NotFoundException(SESSION_MESSAGES.notFound);
    if (!canAccessCinema(actor, session.hall.cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);
    if (session.status === SessionStatus.Cancelled) {
      throw new ConflictException('Сеанс уже отменен');
    }

    await this.sessions.update({ id }, { status: SessionStatus.Cancelled, cancelReason: dto.reason });

    const reservedTickets = await this.tickets.find({
      select: { id: true, sessionId: true, seatId: true },
      where: { sessionId: id, status: TicketStatus.Reserved },
    });
    if (reservedTickets.length > 0) {
      await this.orders.update({ sessionId: id, status: OrderStatus.PendingPayment }, { status: OrderStatus.Expired });
      await this.tickets.update({ sessionId: id, status: TicketStatus.Reserved }, { status: TicketStatus.Released });
      await this.redis.del(...reservedTickets.map((ticket) => seatHoldKey(ticket.sessionId, ticket.seatId)));
    }

    const paidOrders = await this.orders.find({
      select: { id: true },
      where: { sessionId: id, status: In([OrderStatus.Paid, OrderStatus.PartiallyRefunded]) },
    });

    let refundedOrdersCount = 0;
    let refundedTicketsCount = 0;
    let refundedAmount = 0;

    for (const order of paidOrders) {
      const refund = await this.refunds.refundOrderForSessionCancellation(order.id, actor.id);
      if (refund) {
        refundedOrdersCount += 1;
        refundedTicketsCount += refund.ticketIds.length;
        refundedAmount += refund.amount;
      }
    }

    await this.audit.record({
      staffUserId: actor.id,
      cinemaId: session.hall.cinemaId,
      action: 'SESSION_CANCELLED',
      entityType: 'Session',
      entityId: session.id,
      before: { status: SessionStatus.Scheduled, cancelReason: null },
      after: { status: SessionStatus.Cancelled, cancelReason: dto.reason, refundedOrdersCount, refundedTicketsCount, refundedAmount },
    });

    return {
      sessionId: session.id,
      status: SessionStatus.Cancelled,
      cancelReason: dto.reason,
      refundedOrdersCount,
      refundedTicketsCount,
      refundedAmount,
    };
  }

  async remove(actor: StaffUser, id: string): Promise<void> {
    const session = await this.sessions.findOne({ where: { id }, relations: { hall: true } });
    if (!session) throw new NotFoundException(SESSION_MESSAGES.notFound);
    if (!canAccessCinema(actor, session.hall.cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);

    await this.sessions.delete({ id });
  }

  async #assertHallIsFree(manager: EntityManager, cinema: Cinema, hallId: string, startsAt: Date, endsAt: Date): Promise<void> {
    const breakMs = cinema.cleaningBreakMinutes * MINUTE_MS;
    const conflict = await manager.findOne(Session, {
      where: {
        hallId,
        status: SessionStatus.Scheduled,
        startsAt: LessThan(new Date(endsAt.getTime() + breakMs)),
        endsAt: MoreThan(new Date(startsAt.getTime() - breakMs)),
      },
      relations: { film: true },
    });
    if (!conflict) return;

    const [conflictStart, conflictEnd] = [conflict.startsAt, conflict.endsAt].map((instant) => formatTime(instant, cinema.timezone));
    throw invalidField('time', SESSION_MESSAGES.hallBusy(conflict.film.title, conflictStart, conflictEnd, cinema.cleaningBreakMinutes));
  }
}
