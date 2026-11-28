import { createHmac } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { type ISendMailOptions, MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, todayIn } from '@/common/time/zoned-time.js';
import type { EnvironmentVariables } from '@/config/environment.js';
import { AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import { TokenOwnerType } from '@/modules/auth/entities/refresh-token.entity.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { CUSTOMER_COOKIE_NAMES, CUSTOMER_MESSAGES, OTP_MAX_ATTEMPTS } from '@/modules/customers/customers.constant.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { verifyTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { AUTH_URL, loginAs, readSetCookies } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const ORDERS_URL = `/${API_PREFIX}/orders`;
const CUSTOMER_URL = `/${API_PREFIX}/customer`;
const WEBHOOK_URL = `/${API_PREFIX}/payments/yookassa/webhook`;
const FOREIGN_SECRET = 'foreign-secret-unknown-to-the-server-32';

const encodeJwtPart = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('Stage 3 Security & Concurrency', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let yooKassaClient: YooKassaClient;
  let mailService: MailService;
  let cinemaId: string;
  let sessionId: string;
  let seatIds: string[];
  let seatCursor = 0;

  const takeSeats = (count: number): string[] => {
    const picked = seatIds.slice(seatCursor, seatCursor + count);
    seatCursor += count;

    return picked;
  };

  const loginCustomer = async (email: string) => {
    const spy = vi.spyOn(mailService, 'sendMail');
    await request(server).post(`${CUSTOMER_URL}/auth/request-otp`).send({ email }).expect(204);
    const mail = spy.mock.calls.at(-1)?.[0] as ISendMailOptions;
    const match = mail.text.match(/\b(\d{6})\b/);
    if (!match) throw new Error('OTP code was not found in email');
    spy.mockRestore();

    const agent = request.agent(server);
    const response = await agent.post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email, code: match[1] }).expect(200);

    return { agent, response };
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    yooKassaClient = app.get(YooKassaClient);
    mailService = app.get(MailService);
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });

    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    const hall = await createHallWithLayout(admin, cinemaId);
    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Тест безопасности', ageRating: AgeRating.Twelve }).expect(201)).body.id;
    const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);
    sessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '20:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows strictly one winner when ten clients book the same seat concurrently and rolls back partial overlaps', async () => {
    const [contestedSeat, seatA, seatB, seatC] = takeSeats(4);

    const stormResponses = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        request(server)
          .post(ORDERS_URL)
          .send({ sessionId, seatIds: [contestedSeat], email: `race-${index}@example.com`, privacyAccepted: true }),
      ),
    );

    const statuses = stormResponses.map((response) => response.status);
    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 409)).toHaveLength(9);

    const ticketsForSeat = await app.get(DataSource).getRepository(Ticket).findBy({ sessionId, seatId: contestedSeat });
    expect(ticketsForSeat).toHaveLength(1);

    const [firstOverlap, secondOverlap] = await Promise.all([
      request(server).post(ORDERS_URL).send({ sessionId, seatIds: [seatA, seatB], email: 'overlap-1@example.com', privacyAccepted: true }),
      request(server).post(ORDERS_URL).send({ sessionId, seatIds: [seatB, seatC], email: 'overlap-2@example.com', privacyAccepted: true }),
    ]);

    expect([firstOverlap.status, secondOverlap.status].toSorted((a, b) => a - b)).toEqual([201, 409]);

    const releasedSeat = firstOverlap.status === 201 ? seatC : seatA;
    await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [releasedSeat], email: 'after-rollback@example.com', privacyAccepted: true })
      .expect(201);
  });

  it('handles concurrent duplicate succeeded webhooks idempotently and dispatches tickets email only once', async () => {
    const [seatId] = takeSeats(1);
    const { body: order } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatId], email: 'webhook-storm@example.com', privacyAccepted: true })
      .expect(201);

    const externalId = 'yk-storm-pay-1';
    vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/storm' },
    });
    await request(server).post(`${ORDERS_URL}/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValue({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T15:00:00.000Z',
    });

    const mailSpy = vi.spyOn(mailService, 'sendMail');

    const webhookResponses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(server)
          .post(WEBHOOK_URL)
          .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } }),
      ),
    );

    expect(webhookResponses.every((response) => response.status === 200)).toBe(true);
    expect(mailSpy).toHaveBeenCalledTimes(1);

    const dataSource = app.get(DataSource);
    const paidOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: order.id });
    const tickets = await dataSource.getRepository(Ticket).findBy({ orderId: order.id });
    expect(paidOrder.status).toBe(OrderStatus.Paid);
    expect(tickets).toHaveLength(1);
    expect(tickets[0].status).toBe(TicketStatus.Active);
  });

  it('rejects forged webhooks with wrong currency, unconfirmed status, or malformed payload', async () => {
    const [seatId] = takeSeats(1);
    const { body: order } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatId], email: 'webhook-forged@example.com', privacyAccepted: true })
      .expect(201);

    const externalId = 'yk-forged-pay-1';
    vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/forged' },
    });
    await request(server).post(`${ORDERS_URL}/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: 'USD' },
    });
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(400);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'waiting_for_capture',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
    });
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(400);

    await request(server).post(WEBHOOK_URL).send({ event: '', object: {} }).expect(400);

    const untouched = await app.get(DataSource).getRepository(Order).findOneByOrFail({ id: order.id });
    expect(untouched.status).toBe(OrderStatus.PendingPayment);
  });

  it('rejects forged customer JWTs, staff JWTs in customer cookies, and unverified customer tokens', async () => {
    const { response: victimLogin } = await loginCustomer('jwt-victim@example.com');
    const { response: attackerLogin } = await loginCustomer('jwt-attacker@example.com');
    const attackerToken = readSetCookies(attackerLogin)[CUSTOMER_COOKIE_NAMES.access];
    const [header, payload, signature] = attackerToken.split('.');
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Record<string, unknown>;
    const resign = (body: string) => createHmac('sha256', FOREIGN_SECRET).update(`${header}.${body}`).digest('base64url');

    const staff = await createStaff(app, { role: StaffRole.Admin });
    const staffRes = await request(server).post(`${AUTH_URL}/login`).send({ login: staff.login, password: staff.password }).expect(200);
    const staffToken = readSetCookies(staffRes)[AUTH_COOKIE_NAMES.access];

    const unverifiedCustomer = await app.get(DataSource).getRepository(Customer).save(
      app.get(DataSource).getRepository(Customer).create({
        email: 'unverified-guest@example.com',
        emailVerifiedAt: null,
        name: null,
        phone: null,
        passwordHash: null,
      }),
    );
    const unverifiedToken = await app.get(JwtService).signAsync({ sub: unverifiedCustomer.id, ownerType: TokenOwnerType.Customer });

    const invalidTokens = [
      `${header}.${payload}.${signature.slice(0, -4)}AAAA`,
      `${header}.${payload}.${resign(payload)}`,
      `${encodeJwtPart({ alg: 'none', typ: 'JWT' })}.${payload}.`,
      `${header}.${encodeJwtPart({ ...claims, sub: victimLogin.body.id })}.${signature}`,
      staffToken,
      unverifiedToken,
    ];

    for (const token of invalidTokens) {
      await request(server).get(`${CUSTOMER_URL}/me`).set('Cookie', `${CUSTOMER_COOKIE_NAMES.access}=${token}`).expect(401);
      await request(server).get(`${CUSTOMER_URL}/orders`).set('Cookie', `${CUSTOMER_COOKIE_NAMES.access}=${token}`).expect(401);
    }
  });

  it('prevents OTP user enumeration, enforces attempt limits, verifies QR forgery protection, and resists SQL injection without leaking secrets', async () => {
    const existingEmail = 'otp-enum-real@example.com';
    await loginCustomer(existingEmail);
    await app.get(RedisClient).flushdb();

    const realWrong = await request(server).post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email: existingEmail, code: '123456' }).expect(401);
    const ghostWrong = await request(server)
      .post(`${CUSTOMER_URL}/auth/verify-otp`)
      .send({ email: 'never-registered@example.com', code: '123456' })
      .expect(401);
    expect(realWrong.body.message).toBe(CUSTOMER_MESSAGES.invalidOtp);
    expect(ghostWrong.body.message).toBe(CUSTOMER_MESSAGES.invalidOtp);

    const spy = vi.spyOn(mailService, 'sendMail');
    await request(server).post(`${CUSTOMER_URL}/auth/request-otp`).send({ email: existingEmail }).expect(204);
    const lastMail = spy.mock.calls.at(-1)?.[0] as ISendMailOptions | undefined;
    const validCode = lastMail?.text.match(/\b(\d{6})\b/)?.[1] ?? '';
    const wrongCode = validCode === '999999' ? '888888' : '999999';
    spy.mockRestore();

    for (let attempt = 0; attempt < OTP_MAX_ATTEMPTS; attempt++) {
      await request(server).post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email: existingEmail, code: wrongCode }).expect(401);
    }
    await request(server).post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email: existingEmail, code: validCode }).expect(401);

    const [seatId] = takeSeats(1);
    const { body: order } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatId], email: existingEmail, privacyAccepted: true })
      .expect(201);

    const externalId = 'yk-sec-qr-1';
    vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/sec-qr' },
    });
    await request(server).post(`${ORDERS_URL}/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T15:10:00.000Z',
    });
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(200);

    await app.get(RedisClient).flushdb();
    const { agent: ownerAgent, response: ownerLogin } = await loginCustomer(existingEmail);
    const { agent: intruderAgent } = await loginCustomer('intruder@example.com');

    const { body: ownerOrder } = await ownerAgent.get(`${CUSTOMER_URL}/orders/${order.id}`).expect(200);
    const ticket = ownerOrder.tickets[0] as { id: string; code: string; qrPayload: string };
    const secret = app.get(ConfigService<EnvironmentVariables, true>).get('JWT_ACCESS_SECRET', { infer: true });

    expect(verifyTicketQrPayload(ticket.qrPayload, secret)).toBe(ticket.code);
    expect(verifyTicketQrPayload(`${ticket.qrPayload.slice(0, -1)}X`, secret)).toBeNull();

    await intruderAgent.get(`${CUSTOMER_URL}/orders/${order.id}`).expect(404);
    await intruderAgent.get(`${CUSTOMER_URL}/orders/${order.id}/pdf`).expect(404);
    await intruderAgent.get(`${CUSTOMER_URL}/orders/${order.id}/tickets/${ticket.id}/qr`).expect(404);

    const sqliSearch = await request(server)
      .get(`/${API_PREFIX}/catalog/cinemas/${cinemaId}/films`)
      .query({ search: "' OR '1'='1; DROP TABLE film;--" })
      .expect(200);
    expect(Array.isArray(sqliSearch.body)).toBe(true);

    const serializedResponses = JSON.stringify([ownerLogin.body, ownerOrder, order]);
    expect(serializedResponses).not.toContain('passwordHash');
    expect(serializedResponses).not.toContain('tokenHash');
    expect(serializedResponses).not.toContain(secret);
  });
});
