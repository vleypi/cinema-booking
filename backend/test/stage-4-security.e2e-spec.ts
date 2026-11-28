import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { type ISendMailOptions, MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout, type IHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const boxOfficeUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/box-office`;
const ticketsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/tickets`;
const reportsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/reports`;
const auditUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/audit-logs`;

describe('Stage 4 Security, Concurrency & Edge Cases (4.8)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let yooKassa: YooKassaClient;
  let mailService: MailService;
  let cinemaId: string;
  let otherCinemaId: string;
  let admin: StaffAgent;
  let manager: StaffAgent;
  let cashier: StaffAgent;
  let controller: StaffAgent;
  let tempPasswordAdmin: StaffAgent;
  let foreignManager: StaffAgent;
  let foreignCashier: StaffAgent;
  let hall: IHallWithLayout;
  let otherHall: IHallWithLayout;
  let filmId: string;
  let tomorrow: string;
  let sessionId: string;
  let otherCinemaSessionId: string;
  let seatIds: string[];
  let otherCinemaSeatIds: string[];

  const buyAndPayOnlineOrder = async (
    email: string,
    chosenSeats: string[],
    externalId: string,
    targetSessionId = sessionId,
  ): Promise<{ order: { id: string; totalAmount: number; tickets: Array<{ id: string; price: number }> }; refundToken: string }> => {
    const { body: order } = await request(server)
      .post(`/${API_PREFIX}/orders`)
      .send({ sessionId: targetSessionId, seatIds: chosenSeats, email, privacyAccepted: true })
      .expect(201);

    vi.spyOn(yooKassa, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/stage4-sec' },
    });
    await request(server).post(`/${API_PREFIX}/orders/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassa, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T16:30:00.000Z',
    });

    const mailSpy = vi.spyOn(mailService, 'sendMail');
    await request(server)
      .post(`/${API_PREFIX}/payments/yookassa/webhook`)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(200);

    const ticketMail = mailSpy.mock.calls.at(-1)?.[0] as ISendMailOptions;
    const tokenMatch = ticketMail.text.match(/\/refund\?token=([^\s]+)/);
    mailSpy.mockRestore();

    return { order, refundToken: decodeURIComponent(tokenMatch?.[1] ?? '') };
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    yooKassa = app.get(YooKassaClient);
    mailService = app.get(MailService);
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });
    await dataSource.getRepository(Cinema).update({ id: otherCinemaId }, { isPublished: true });

    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));
    controller = await loginAs(app, await createStaff(app, { role: StaffRole.Controller, cinemaIds: [cinemaId] }));
    tempPasswordAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId], mustChangePassword: true }));

    const foreignAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [otherCinemaId] }));
    foreignManager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [otherCinemaId] }));
    foreignCashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [otherCinemaId] }));

    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);
    await foreignAdmin.put(`/${API_PREFIX}/cinemas/${otherCinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    hall = await createHallWithLayout(admin, cinemaId);
    otherHall = await createHallWithLayout(foreignAdmin, otherCinemaId);

    const seatRepo = dataSource.getRepository(Seat);
    seatIds = (await seatRepo.find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } })).map(({ id }) => id);
    otherCinemaSeatIds = (await seatRepo.find({ where: { layoutId: otherHall.layoutId }, order: { id: 'ASC' } })).map(({ id }) => id);

    filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Тест безопасности 4', ageRating: AgeRating.Twelve }).expect(201)).body.id;
    tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);

    sessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '14:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;

    otherCinemaSessionId = (
      await foreignManager
        .post(`/${API_PREFIX}/cinemas/${otherCinemaId}/sessions`)
        .send({ filmId, hallId: otherHall.hallId, date: tomorrow, time: '14:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('prevents double sale under 6-way concurrent box-office requests for the same seat', async () => {
    const contestedSeat = seatIds[0];

    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        cashier.post(`${boxOfficeUrl(cinemaId)}/orders`).send({
          sessionId,
          seatIds: [contestedSeat],
          paymentMethod: PaymentProvider.Cash,
        }),
      ),
    );

    const statuses = responses.map((res) => res.status).toSorted((a, b) => a - b);
    expect(statuses).toEqual([201, 409, 409, 409, 409, 409]);
  });

  it('prevents double refund under concurrent box-office refund and concurrent one-time token refund', async () => {
    const { body: boxOrder } = await cashier
      .post(`${boxOfficeUrl(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[1]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    const ticketId = boxOrder.tickets[0].id as string;
    const boxRefundResponses = await Promise.all([
      cashier
        .post(`${boxOfficeUrl(cinemaId)}/orders/${boxOrder.id}/refunds`)
        .send({ ticketIds: [ticketId], refundMethod: PaymentProvider.Cash }),
      cashier
        .post(`${boxOfficeUrl(cinemaId)}/orders/${boxOrder.id}/refunds`)
        .send({ ticketIds: [ticketId], refundMethod: PaymentProvider.Cash }),
    ]);

    expect(boxRefundResponses.map((res) => res.status).toSorted((a, b) => a - b)).toEqual([201, 409]);

    const { order: onlineOrder, refundToken } = await buyAndPayOnlineOrder('race-token@example.com', [seatIds[2]], 'yk-race-tok-1');
    vi.spyOn(yooKassa, 'createRefund').mockResolvedValue({
      id: 'yk-race-ref-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(onlineOrder.tickets[0].price), currency: PAYMENT_CURRENCY },
    });

    const tokenResponses = await Promise.all(
      Array.from({ length: 3 }, () =>
        request(server)
          .post(`/${API_PREFIX}/refunds/by-token`)
          .send({ token: refundToken, ticketIds: [onlineOrder.tickets[0].id] }),
      ),
    );

    expect(tokenResponses.map((res) => res.status).toSorted((a, b) => a - b)).toEqual([201, 409, 409]);
  });

  it('rejects duplicate session cancellation and blocks foreign-cinema IDOR across PDF, sessions, and cancellation', async () => {
    const cancelTargetSessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '17:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;

    await foreignManager.get(`/${API_PREFIX}/sessions/${cancelTargetSessionId}/cancel-preview`).expect(403);
    await foreignManager.post(`/${API_PREFIX}/sessions/${cancelTargetSessionId}/cancel`).send({ reason: 'Чужая отмена' }).expect(403);

    await manager.post(`/${API_PREFIX}/sessions/${cancelTargetSessionId}/cancel`).send({ reason: 'Первая отмена' }).expect(200);
    await manager.post(`/${API_PREFIX}/sessions/${cancelTargetSessionId}/cancel`).send({ reason: 'Повторная отмена' }).expect(409);

    const { body: foreignOrder } = await foreignCashier
      .post(`${boxOfficeUrl(otherCinemaId)}/orders`)
      .send({ sessionId: otherCinemaSessionId, seatIds: [otherCinemaSeatIds[0]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier.get(`${boxOfficeUrl(cinemaId)}/orders/${foreignOrder.id}/pdf`).expect(404);
    await foreignCashier.get(`${boxOfficeUrl(cinemaId)}/sessions`).query({ date: tomorrow }).expect(403);
    await foreignCashier.get(`${boxOfficeUrl(cinemaId)}/orders/${foreignOrder.id}/pdf`).expect(403);
  });

  it('enforces temporary-password lockout and RBAC boundaries across all Stage 4 endpoints', async () => {
    await tempPasswordAdmin.get(`${boxOfficeUrl(cinemaId)}/sessions`).query({ date: tomorrow }).expect(403);
    await tempPasswordAdmin.get(`${boxOfficeUrl(cinemaId)}/orders`).expect(403);
    await tempPasswordAdmin.get(`${ticketsUrl(cinemaId)}/halls`).expect(403);
    await tempPasswordAdmin.post(`${ticketsUrl(cinemaId)}/check-in`).send({ code: 'AAAAAAAAAA' }).expect(403);
    await tempPasswordAdmin.get(`/${API_PREFIX}/sessions/${sessionId}/cancel-preview`).expect(403);
    await tempPasswordAdmin.get(`${reportsUrl(cinemaId)}/revenue`).expect(403);
    await tempPasswordAdmin.get(`${reportsUrl(cinemaId)}/occupancy`).expect(403);
    await tempPasswordAdmin.get(auditUrl(cinemaId)).expect(403);

    await controller.get(`${boxOfficeUrl(cinemaId)}/sessions`).query({ date: tomorrow }).expect(403);
    await controller.get(`${reportsUrl(cinemaId)}/revenue`).expect(403);
    await controller.get(auditUrl(cinemaId)).expect(403);
    await controller.get(`/${API_PREFIX}/sessions/${sessionId}/cancel-preview`).expect(403);

    await cashier.get(`/${API_PREFIX}/sessions/${sessionId}/cancel-preview`).expect(403);
    await cashier.get(`${reportsUrl(cinemaId)}/occupancy`).expect(403);
    await cashier.get(auditUrl(cinemaId)).expect(403);

    await manager.get(auditUrl(cinemaId)).expect(403);
  });

  it('validates DTO whitelisting, handles SQLi payloads safely, rejects cross-order ticket refunds, and filters box-office sessions', async () => {
    const { body: firstOrder } = await cashier
      .post(`${boxOfficeUrl(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[3]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    const { body: secondOrder } = await cashier
      .post(`${boxOfficeUrl(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[4]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier
      .post(`${boxOfficeUrl(cinemaId)}/orders/${firstOrder.id}/refunds`)
      .send({ ticketIds: [secondOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(409);

    await cashier
      .post(`${boxOfficeUrl(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[5]], paymentMethod: PaymentProvider.Cash, extraField: true })
      .expect(400);

    await controller.post(`${ticketsUrl(cinemaId)}/check-in`).send({ code: 'AAAAAAAAAA', forged: true }).expect(400);
    await manager.post(`/${API_PREFIX}/sessions/${sessionId}/cancel`).send({ reason: 'Причина', extra: 1 }).expect(400);

    const sqliOrders = await cashier
      .get(`${boxOfficeUrl(cinemaId)}/orders`)
      .query({ query: "' OR 1=1 --" })
      .expect(200);
    expect(sqliOrders.body).toEqual([]);

    const sqliAudit = await admin
      .get(auditUrl(cinemaId))
      .query({ entityType: "'; DROP TABLE audit_logs; --" })
      .expect(200);
    expect(sqliAudit.body).toEqual([]);

    const sessionRepo = app.get(DataSource).getRepository(Session);
    const cancelledSession = await sessionRepo.save(
      sessionRepo.create({
        hallId: hall.hallId,
        layoutId: hall.layoutId,
        filmId,
        startsAt: new Date(Date.now() + 2 * 60 * MINUTE_MS),
        endsAt: new Date(Date.now() + 4 * 60 * MINUTE_MS),
        format: SessionFormat.TwoD,
        status: SessionStatus.Cancelled,
      }),
    );

    const { body: boxSessions } = await cashier.get(`${boxOfficeUrl(cinemaId)}/sessions`).query({ date: tomorrow }).expect(200);
    expect(boxSessions.some((item: { id: string }) => item.id === sessionId)).toBe(true);
    expect(boxSessions.some((item: { id: string }) => item.id === cancelledSession.id)).toBe(false);
  });
});
