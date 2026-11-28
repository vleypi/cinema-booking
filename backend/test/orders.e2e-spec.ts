import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { HOLD_TTL_SECONDS, ORDER_MESSAGES, seatHoldKey } from '@/modules/orders/orders.constant.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout, type IHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const ORDERS_URL = `/${API_PREFIX}/orders`;
const sessionSeatsUrl = (sessionId: string) => `/${API_PREFIX}/sessions/${sessionId}/seats`;

describe('Orders & Seat Booking', () => {
  let app: INestApplication;
  let manager: StaffAgent;
  let cinemaId: string;
  let hall: IHallWithLayout;
  let otherHall: IHallWithLayout;
  let seatIds: string[];
  let otherHallSeatId: string;
  let sessionId: string;
  let adultSessionId: string;
  const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);

  const guest = () => request(app.getHttpServer());

  const createFilm = async (overrides: Record<string, unknown> = {}): Promise<string> =>
    (await manager.post(FILMS_URL).send({ ...filmBody(), ...overrides }).expect(201)).body.id;

  const schedule = async (date: string, time: string, filmId: string, hallId = hall.hallId): Promise<string> =>
    (await manager.post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`).send({ filmId, hallId, date, time, format: SessionFormat.TwoD }).expect(201)).body.id;

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    await app.get(DataSource).getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });
    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    hall = await createHallWithLayout(admin, cinemaId);
    otherHall = await createHallWithLayout(admin, cinemaId);

    const seatsRepo = app.get(DataSource).getRepository(Seat);
    const mainSeats = await seatsRepo.find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    const extraSeats = await seatsRepo.find({ where: { layoutId: otherHall.layoutId }, order: { id: 'ASC' } });
    seatIds = mainSeats.map(({ id }) => id);
    otherHallSeatId = extraSeats[0].id;

    const regularFilmId = await createFilm({ title: 'Обычный фильм', ageRating: AgeRating.Twelve });
    const adultFilmId = await createFilm({ title: 'Фильм 18+', ageRating: AgeRating.Eighteen });

    sessionId = await schedule(tomorrow, '13:00', regularFilmId);
    adultSessionId = await schedule(tomorrow, '19:00', adultFilmId);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns session seat map with prices and availability', async () => {
    const { body } = await guest().get(sessionSeatsUrl(sessionId)).expect(200);

    expect(body.sessionId).toBe(sessionId);
    expect(body.seats).toHaveLength(seatIds.length);
    expect(body.seats.every((seat: { isAvailable: boolean; price: number }) => seat.isAvailable && seat.price > 0)).toBe(true);
    expect(body.priceZones.length).toBeGreaterThan(0);
  });

  it('reserves seats in Redis and database, creates a customer, and marks seats unavailable', async () => {
    const chosen = [seatIds[0], seatIds[1]];
    const { body } = await guest()
      .post(ORDERS_URL)
      .send({
        sessionId,
        seatIds: chosen,
        email: '  Viewer@Example.COM ',
        name: 'Иван',
        privacyAccepted: true,
      })
      .expect(201);

    expect(body).toMatchObject({
      cinemaId,
      sessionId,
      contactEmail: 'viewer@example.com',
      channel: OrderChannel.Online,
      status: OrderStatus.PendingPayment,
      ageConfirmed: false,
    });
    expect(body.tickets).toHaveLength(2);
    expect(body.totalAmount).toBe(body.tickets[0].price + body.tickets[1].price);
    for (const ticket of body.tickets) {
      expect(ticket.status).toBe(TicketStatus.Reserved);
      expect(ticket.code).toHaveLength(10);
    }

    const redis = app.get(RedisClient);
    for (const seatId of chosen) {
      const holder = await redis.get(seatHoldKey(sessionId, seatId));
      const ttl = await redis.ttl(seatHoldKey(sessionId, seatId));
      expect(holder).toBe(body.id);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(HOLD_TTL_SECONDS);
    }

    const customer = await app.get(DataSource).getRepository(Customer).findOneBy({ email: 'viewer@example.com' });
    expect(customer).toMatchObject({ email: 'viewer@example.com', name: 'Иван', emailVerifiedAt: null });

    const seatMap = await guest().get(sessionSeatsUrl(sessionId)).expect(200);
    const unavailableIds = seatMap.body.seats.filter((seat: { isAvailable: boolean }) => !seat.isAvailable).map((seat: { id: string }) => seat.id);
    expect(unavailableIds).toEqual(expect.arrayContaining(chosen));
  });

  it('prevents double booking under concurrent requests and enforces the database unique index even if Redis is cleared', async () => {
    const contestedSeat = seatIds[2];
    const [first, second] = await Promise.all([
      guest().post(ORDERS_URL).send({ sessionId, seatIds: [contestedSeat], email: 'a@example.com', privacyAccepted: true }),
      guest().post(ORDERS_URL).send({ sessionId, seatIds: [contestedSeat], email: 'b@example.com', privacyAccepted: true }),
    ]);

    expect([first.status, second.status].toSorted((a, b) => a - b)).toEqual([201, 409]);

    await app.get(RedisClient).del(seatHoldKey(sessionId, contestedSeat));

    const afterRedisClear = await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [contestedSeat], email: 'c@example.com', privacyAccepted: true })
      .expect(409);

    expect(afterRedisClear.body.errors.seatIds).toContain(ORDER_MESSAGES.seatsAlreadyTaken);
  });

  it('releases expired holds and allows booking the freed seat again', async () => {
    const seatToExpire = seatIds[3];
    const created = await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatToExpire], email: 'expire@example.com', privacyAccepted: true })
      .expect(201);

    await app.get(DataSource).getRepository(Order).update({ id: created.body.id }, { holdExpiresAt: new Date(Date.now() - MINUTE_MS) });

    const seatMap = await guest().get(sessionSeatsUrl(sessionId)).expect(200);
    const seatState = seatMap.body.seats.find((seat: { id: string }) => seat.id === seatToExpire);
    expect(seatState.isAvailable).toBe(true);

    const expiredOrder = await app.get(DataSource).getRepository(Order).findOneByOrFail({ id: created.body.id });
    const releasedTicket = await app.get(DataSource).getRepository(Ticket).findOneByOrFail({ orderId: created.body.id });
    expect(expiredOrder.status).toBe(OrderStatus.Expired);
    expect(releasedTicket.status).toBe(TicketStatus.Released);

    await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatToExpire], email: 'newbuyer@example.com', privacyAccepted: true })
      .expect(201);
  });

  it('validates age confirmation for 18+ films, max 5 seats, privacy consent, layout seats, and closed online sales', async () => {
    await guest()
      .post(ORDERS_URL)
      .send({ sessionId: adultSessionId, seatIds: [seatIds[0]], email: 'adult@example.com', privacyAccepted: true })
      .expect(400);

    await guest()
      .post(ORDERS_URL)
      .send({ sessionId: adultSessionId, seatIds: [seatIds[0]], email: 'adult@example.com', ageConfirmed: true, privacyAccepted: true })
      .expect(201);

    await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: ['1', '2', '3', '4', '5', '6'], email: 'too-many@example.com', privacyAccepted: true })
      .expect(400);

    await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatIds[0]], email: 'no-privacy@example.com', privacyAccepted: false })
      .expect(400);

    await guest()
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [otherHallSeatId], email: 'wrong-hall@example.com', privacyAccepted: true })
      .expect(400);

    const startsAt = new Date(Date.now() + 5 * MINUTE_MS);
    const closingSession = await app.get(DataSource).getRepository(Session).save({
      filmId: (await app.get(DataSource).getRepository(Session).findOneByOrFail({ id: sessionId })).filmId,
      hallId: hall.hallId,
      layoutId: hall.layoutId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 120 * MINUTE_MS),
      format: SessionFormat.TwoD,
    });

    await guest().get(sessionSeatsUrl(closingSession.id)).expect(409);
    await guest()
      .post(ORDERS_URL)
      .send({ sessionId: closingSession.id, seatIds: [seatIds[0]], email: 'late@example.com', privacyAccepted: true })
      .expect(409);
  });
});
