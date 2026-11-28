import { BadRequestException, ConflictException, Injectable, NotFoundException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { DataSource, In, LessThanOrEqual, QueryFailedError, type Repository } from 'typeorm';
import { RedisClient } from '@/common/redis/redis.client.js';
import { MINUTE_MS } from '@/common/time/zoned-time.js';
import { fieldError } from '@/common/validation/validation-errors.js';
import { ONLINE_SALE_CLOSES_BEFORE_MINUTES } from '@/modules/catalog/catalog.constant.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import type { CreateOrderDto } from '@/modules/orders/dto/create-order.dto.js';
import type { OrderDto } from '@/modules/orders/dto/order.dto.js';
import type { SessionSeatsDto } from '@/modules/orders/dto/session-seats.dto.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import {
  EXPIRED_HOLDS_SWEEP_MS,
  HOLD_DURATION_MINUTES,
  HOLD_TTL_SECONDS,
  OCCUPIED_TICKET_STATUSES,
  ORDER_MESSAGES,
  seatHoldKey,
} from '@/modules/orders/orders.constant.js';
import { generateOrderNumber, generateTicketCode } from '@/modules/orders/ticket-code.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { calculateSessionSeatPrice } from '@/modules/sessions/session-price.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

const UNIQUE_VIOLATION_CODE = '23505';

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError && (error.driverError as { code?: string }).code === UNIQUE_VIOLATION_CODE;

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  #sweepTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisClient,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
    @InjectRepository(TimeBand) private readonly timeBands: Repository<TimeBand>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
  ) {}

  onModuleInit(): void {
    this.#sweepTimer = setInterval(() => {
      void this.releaseExpiredHolds().catch(() => undefined);
    }, EXPIRED_HOLDS_SWEEP_MS);
    this.#sweepTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.#sweepTimer) {
      clearInterval(this.#sweepTimer);
      this.#sweepTimer = null;
    }
  }

  async getSessionSeats(sessionId: string): Promise<SessionSeatsDto> {
    await this.releaseExpiredHolds(sessionId);
    const session = await this.#loadOnlineSession(sessionId);
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

  async createOnlineOrder(dto: CreateOrderDto): Promise<OrderDto> {
    await this.releaseExpiredHolds(dto.sessionId);
    const session = await this.#loadOnlineSession(dto.sessionId);
    const cinema = session.hall.cinema;

    if (session.film.ageRating === AgeRating.Eighteen && !dto.ageConfirmed) {
      throw new BadRequestException(fieldError('ageConfirmed', ORDER_MESSAGES.ageConfirmationRequired));
    }

    const [selectedSeats, bands] = await Promise.all([
      this.seats.find({
        where: { id: In(dto.seatIds), layoutId: session.layoutId },
        relations: { priceZone: true },
      }),
      this.timeBands.findBy({ cinemaId: cinema.id }),
    ]);

    if (selectedSeats.length !== dto.seatIds.length) {
      throw new BadRequestException(fieldError('seatIds', ORDER_MESSAGES.seatNotInLayout));
    }

    const lockToken = randomUUID();
    const acquiredKeys = await this.#acquireRedisHolds(session.id, dto.seatIds, lockToken);

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * MINUTE_MS);
    const pricedSeats = selectedSeats.map((seat) => ({
      seat,
      price: calculateSessionSeatPrice(session, bands, cinema.timezone, seat.priceZone.multiplier),
    }));
    const totalAmount = pricedSeats.reduce((sum, item) => sum + item.price, 0);

    try {
      const savedOrder = await this.dataSource.transaction(async (manager) => {
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

        const orderRepo = manager.getRepository(Order);
        const order = await orderRepo.save(
          orderRepo.create({
            number: generateOrderNumber(),
            cinemaId: cinema.id,
            sessionId: session.id,
            customerId: customer.id,
            contactEmail: dto.email,
            channel: OrderChannel.Online,
            cashierId: null,
            status: OrderStatus.PendingPayment,
            totalAmount,
            holdExpiresAt,
            ageConfirmed: Boolean(dto.ageConfirmed),
          }),
        );

        const ticketRepo = manager.getRepository(Ticket);
        const tickets = await ticketRepo.save(
          pricedSeats.map(({ seat, price }) =>
            ticketRepo.create({
              orderId: order.id,
              sessionId: session.id,
              seatId: seat.id,
              code: generateTicketCode(),
              price,
              status: TicketStatus.Reserved,
              usedAt: null,
              usedById: null,
            }),
          ),
        );

        return { order, tickets };
      });

      const pipeline = this.redis.pipeline();
      for (const key of acquiredKeys) {
        pipeline.set(key, savedOrder.order.id, 'EX', HOLD_TTL_SECONDS);
      }
      await pipeline.exec();

      return {
        id: savedOrder.order.id,
        number: savedOrder.order.number,
        cinemaId: savedOrder.order.cinemaId,
        sessionId: savedOrder.order.sessionId,
        contactEmail: savedOrder.order.contactEmail,
        channel: savedOrder.order.channel,
        status: savedOrder.order.status,
        totalAmount: savedOrder.order.totalAmount,
        holdExpiresAt: savedOrder.order.holdExpiresAt,
        ageConfirmed: savedOrder.order.ageConfirmed,
        tickets: savedOrder.tickets.map(({ id, seatId, code, price, status }) => ({ id, seatId, code, price, status })),
      };
    } catch (error) {
      await this.#releaseRedisHolds(acquiredKeys);
      if (isUniqueViolation(error)) {
        throw new ConflictException(fieldError('seatIds', ORDER_MESSAGES.seatsAlreadyTaken));
      }
      throw error;
    }
  }

  async releaseExpiredHolds(sessionId?: string): Promise<number> {
    const expiredOrders = await this.orders.find({
      select: { id: true, sessionId: true },
      where: {
        status: OrderStatus.PendingPayment,
        holdExpiresAt: LessThanOrEqual(new Date()),
        ...(sessionId && { sessionId }),
      },
    });
    if (expiredOrders.length === 0) return 0;

    const orderIds = expiredOrders.map(({ id }) => id);
    const releasedTickets = await this.dataSource.transaction(async (manager) => {
      const tickets = await manager.getRepository(Ticket).find({
        select: { id: true, sessionId: true, seatId: true },
        where: { orderId: In(orderIds), status: TicketStatus.Reserved },
      });

      await manager.getRepository(Order).update({ id: In(orderIds), status: OrderStatus.PendingPayment }, { status: OrderStatus.Expired });
      if (tickets.length > 0) {
        await manager.getRepository(Ticket).update({ id: In(tickets.map(({ id }) => id)), status: TicketStatus.Reserved }, { status: TicketStatus.Released });
      }

      return tickets;
    });

    if (releasedTickets.length > 0) {
      await this.#releaseRedisHolds(releasedTickets.map((ticket) => seatHoldKey(ticket.sessionId, ticket.seatId)));
    }

    return expiredOrders.length;
  }

  async #loadOnlineSession(sessionId: string): Promise<Session> {
    const session = await this.sessions.findOne({
      where: { id: sessionId, status: SessionStatus.Scheduled },
      relations: { film: true, hall: { cinema: true } },
    });
    if (!session || !session.hall.cinema.isPublished) {
      throw new NotFoundException(ORDER_MESSAGES.sessionNotFound);
    }

    const saleCloseTime = new Date(Date.now() + ONLINE_SALE_CLOSES_BEFORE_MINUTES * MINUTE_MS);
    if (session.startsAt < saleCloseTime) {
      throw new ConflictException(ORDER_MESSAGES.saleClosed);
    }

    return session;
  }

  async #acquireRedisHolds(sessionId: string, seatIds: readonly string[], lockToken: string): Promise<string[]> {
    const acquired: string[] = [];
    for (const seatId of seatIds) {
      const key = seatHoldKey(sessionId, seatId);
      const result = await this.redis.set(key, lockToken, 'EX', HOLD_TTL_SECONDS, 'NX');
      if (result !== 'OK') {
        await this.#releaseRedisHolds(acquired);
        throw new ConflictException(fieldError('seatIds', ORDER_MESSAGES.seatsAlreadyTaken));
      }
      acquired.push(key);
    }

    return acquired;
  }

  async #releaseRedisHolds(keys: readonly string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.redis.del(...keys);
  }
}
