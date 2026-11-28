import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

describe('Session Cancellation, Revenue Reports & Audit Log (4.4)', () => {
  let app: INestApplication;
  let cinemaId: string;
  let otherCinemaId: string;
  let admin: StaffAgent;
  let manager: StaffAgent;
  let managerId: string;
  let cashier: StaffAgent;
  let foreignAdmin: StaffAgent;
  let sessionToCancelId: string;
  let reportSessionId: string;
  let seatIds: string[];

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });

    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const managerStaff = await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] });
    managerId = managerStaff.id;
    manager = await loginAs(app, managerStaff);
    cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));
    foreignAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [otherCinemaId] }));

    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);
    const hall = await createHallWithLayout(admin, cinemaId);

    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Отчетный фильм', ageRating: AgeRating.Twelve }).expect(201)).body.id;
    const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);

    sessionToCancelId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '12:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;

    reportSessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '16:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('previews and cancels a session with mass refunds, emails customers, and records audit log entries', async () => {
    const server = app.getHttpServer();
    const yooKassa = app.get(YooKassaClient);
    const mailService = app.get(MailService);

    const { body: onlineOrder } = await request(server)
      .post(`/${API_PREFIX}/orders`)
      .send({ sessionId: sessionToCancelId, seatIds: [seatIds[0], seatIds[1]], email: 'cancel-online@example.com', privacyAccepted: true })
      .expect(201);

    vi.spyOn(yooKassa, 'createPayment').mockResolvedValueOnce({
      id: 'yk-cancel-pay-1',
      status: 'pending',
      amount: { value: formatKopecksToRubles(onlineOrder.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/cancel' },
    });
    await request(server).post(`/${API_PREFIX}/orders/${onlineOrder.id}/payments`).expect(201);

    vi.spyOn(yooKassa, 'getPayment').mockResolvedValueOnce({
      id: 'yk-cancel-pay-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(onlineOrder.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T16:10:00.000Z',
    });
    await request(server)
      .post(`/${API_PREFIX}/payments/yookassa/webhook`)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: 'yk-cancel-pay-1' } })
      .expect(200);

    const { body: boxOrder } = await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders`)
      .send({ sessionId: sessionToCancelId, seatIds: [seatIds[2]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    const { body: preview } = await manager.get(`/${API_PREFIX}/sessions/${sessionToCancelId}/cancel-preview`).expect(200);
    expect(preview).toMatchObject({
      sessionId: sessionToCancelId,
      status: SessionStatus.Scheduled,
      activeTicketsCount: 3,
      affectedOrdersCount: 2,
      refundAmount: onlineOrder.totalAmount + boxOrder.totalAmount,
    });

    const refundSpy = vi.spyOn(yooKassa, 'createRefund').mockResolvedValueOnce({
      id: 'yk-cancel-ref-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(onlineOrder.totalAmount), currency: PAYMENT_CURRENCY },
    });
    const mailSpy = vi.spyOn(mailService, 'sendMail');

    const { body: cancelled } = await manager
      .post(`/${API_PREFIX}/sessions/${sessionToCancelId}/cancel`)
      .send({ reason: 'Техническая неисправность проектора' })
      .expect(200);

    expect(cancelled).toMatchObject({
      sessionId: sessionToCancelId,
      status: SessionStatus.Cancelled,
      cancelReason: 'Техническая неисправность проектора',
      refundedOrdersCount: 2,
      refundedTicketsCount: 3,
      refundedAmount: onlineOrder.totalAmount + boxOrder.totalAmount,
    });
    expect(refundSpy).toHaveBeenCalledTimes(1);
    expect(mailSpy).toHaveBeenCalledTimes(1);

    const dataSource = app.get(DataSource);
    const updatedOnlineOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: onlineOrder.id });
    const updatedTickets = await dataSource.getRepository(Ticket).findBy({ sessionId: sessionToCancelId });
    expect(updatedOnlineOrder.status).toBe(OrderStatus.Refunded);
    expect(updatedTickets.every((ticket) => ticket.status === TicketStatus.Refunded)).toBe(true);

    const { body: logs } = await admin
      .get(`/${API_PREFIX}/cinemas/${cinemaId}/audit-logs`)
      .query({ staffUserId: managerId, entityType: 'Session' })
      .expect(200);
    expect(logs.some((entry: { action: string; entityId: string }) => entry.action === 'SESSION_CANCELLED' && entry.entityId === sessionToCancelId)).toBe(true);

    await manager.get(`/${API_PREFIX}/cinemas/${cinemaId}/audit-logs`).expect(403);
    await foreignAdmin.get(`/${API_PREFIX}/cinemas/${cinemaId}/audit-logs`).expect(403);
  });

  it('builds revenue report accounting for refunds and occupancy report per session', async () => {
    const { body: soldOrder } = await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders`)
      .send({ sessionId: reportSessionId, seatIds: [seatIds[0], seatIds[1]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${soldOrder.id}/refunds`)
      .send({ ticketIds: [soldOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(201);

    const { body: revenue } = await manager.get(`/${API_PREFIX}/cinemas/${cinemaId}/reports/revenue`).expect(200);
    expect(revenue.totals.netRevenue).toBe(soldOrder.tickets[1].price);
    expect(revenue.totals.grossAmount).toBeGreaterThan(revenue.totals.netRevenue);
    expect(revenue.totals.refundedAmount).toBeGreaterThan(0);
    expect(revenue.byFilm.length).toBeGreaterThan(0);
    expect(revenue.byHall.length).toBeGreaterThan(0);
    expect(revenue.byChannel.some((item: { channel: string }) => item.channel === OrderChannel.BoxOffice)).toBe(true);

    const { body: occupancy } = await manager.get(`/${API_PREFIX}/cinemas/${cinemaId}/reports/occupancy`).expect(200);
    const reportRow = occupancy.find((item: { sessionId: string }) => item.sessionId === reportSessionId);
    expect(reportRow).toBeDefined();
    expect(reportRow.soldTickets).toBe(1);
    expect(reportRow.totalSeats).toBe(seatIds.length);
    expect(reportRow.occupancyPercent).toBeGreaterThan(0);

    await cashier.get(`/${API_PREFIX}/cinemas/${cinemaId}/reports/revenue`).expect(403);
    await foreignAdmin.get(`/${API_PREFIX}/cinemas/${cinemaId}/reports/occupancy`).expect(403);
  });
});
