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
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { RefundStatus } from '@/modules/refunds/refund-status.enum.js';
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
const CUSTOMER_URL = `/${API_PREFIX}/customer`;
const WEBHOOK_URL = `/${API_PREFIX}/payments/yookassa/webhook`;
const TOKEN_REFUND_URL = `/${API_PREFIX}/refunds/by-token`;

describe('Refunds API (4.3)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let yooKassa: YooKassaClient;
  let mailService: MailService;
  let cinemaId: string;
  let otherCinemaId: string;
  let cashier: StaffAgent;
  let controller: StaffAgent;
  let foreignCashier: StaffAgent;
  let hall: IHallWithLayout;
  let filmId: string;
  let sessionId: string;
  let seatIds: string[];

  const loginCustomer = async (email: string) => {
    const spy = vi.spyOn(mailService, 'sendMail');
    await request(server).post(`${CUSTOMER_URL}/auth/request-otp`).send({ email }).expect(204);
    const mail = spy.mock.calls.at(-1)?.[0] as ISendMailOptions;
    const code = mail.text.match(/\b(\d{6})\b/)?.[1] ?? '';
    spy.mockRestore();

    const agent = request.agent(server);
    await agent.post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email, code }).expect(200);

    return agent;
  };

  const buyAndPayOnlineOrder = async (
    email: string,
    chosenSeats: string[],
    externalId: string,
    targetSessionId = sessionId,
  ): Promise<{ order: { id: string; number: string; totalAmount: number; tickets: Array<{ id: string; price: number }> }; refundToken: string }> => {
    const { body: order } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId: targetSessionId, seatIds: chosenSeats, email, privacyAccepted: true })
      .expect(201);

    vi.spyOn(yooKassa, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/refund-test' },
    });
    await request(server).post(`${ORDERS_URL}/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassa, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T16:00:00.000Z',
    });

    const mailSpy = vi.spyOn(mailService, 'sendMail');
    await request(server)
      .post(WEBHOOK_URL)
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

    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));
    controller = await loginAs(app, await createStaff(app, { role: StaffRole.Controller, cinemaIds: [cinemaId] }));
    foreignCashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [otherCinemaId] }));

    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);
    hall = await createHallWithLayout(admin, cinemaId);

    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Возвратный фильм', ageRating: AgeRating.Twelve }).expect(201)).body.id;
    const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);
    sessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '18:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports partial and full customer refunds via YooKassa, sends refund email, frees seats, and blocks IDOR', async () => {
    const email = 'refund-customer@example.com';
    const { order } = await buyAndPayOnlineOrder(email, [seatIds[0], seatIds[1]], 'yk-ref-cust-1');
    const customerAgent = await loginCustomer(email);
    const otherAgent = await loginCustomer('other-refund@example.com');

    await otherAgent.post(`${CUSTOMER_URL}/orders/${order.id}/refunds`).send({ ticketIds: [order.tickets[0].id] }).expect(404);

    const refundSpy = vi.spyOn(yooKassa, 'createRefund').mockResolvedValue({
      id: 'yk-refund-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.tickets[0].price), currency: PAYMENT_CURRENCY },
    });
    const mailSpy = vi.spyOn(mailService, 'sendMail');

    const firstRefund = await customerAgent
      .post(`${CUSTOMER_URL}/orders/${order.id}/refunds`)
      .send({ ticketIds: [order.tickets[0].id] })
      .expect(201);

    expect(firstRefund.body).toMatchObject({
      orderId: order.id,
      orderStatus: OrderStatus.PartiallyRefunded,
      amount: order.tickets[0].price,
      status: RefundStatus.Succeeded,
      ticketIds: [order.tickets[0].id],
    });
    expect(refundSpy).toHaveBeenCalledTimes(1);
    expect(mailSpy).toHaveBeenCalledTimes(1);

    const secondRefund = await customerAgent
      .post(`${CUSTOMER_URL}/orders/${order.id}/refunds`)
      .send({ ticketIds: [order.tickets[1].id] })
      .expect(201);
    expect(secondRefund.body.orderStatus).toBe(OrderStatus.Refunded);

    await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatIds[0]], email: 'rebook@example.com', privacyAccepted: true })
      .expect(201);
  });

  it('supports one-time signed refund link from email and rejects reuse or tampering', async () => {
    const { order, refundToken } = await buyAndPayOnlineOrder('token-refund@example.com', [seatIds[2]], 'yk-ref-tok-1');
    expect(refundToken.length).toBeGreaterThan(20);

    const preview = await request(server).get(TOKEN_REFUND_URL).query({ token: refundToken }).expect(200);
    expect(preview.body.orderId).toBe(order.id);
    expect(preview.body.tickets).toHaveLength(1);

    vi.spyOn(yooKassa, 'createRefund').mockResolvedValueOnce({
      id: 'yk-refund-tok-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.tickets[0].price), currency: PAYMENT_CURRENCY },
    });

    const refunded = await request(server)
      .post(TOKEN_REFUND_URL)
      .send({ token: refundToken, ticketIds: [order.tickets[0].id] })
      .expect(201);
    expect(refunded.body.orderStatus).toBe(OrderStatus.Refunded);

    await request(server).get(TOKEN_REFUND_URL).query({ token: refundToken }).expect(409);
    await request(server)
      .post(TOKEN_REFUND_URL)
      .send({ token: refundToken, ticketIds: [order.tickets[0].id] })
      .expect(409);

    await request(server).get(TOKEN_REFUND_URL).query({ token: `${refundToken}tampered` }).expect(400);
  });

  it('handles box-office refunds for cash and online orders, rejects used tickets and started sessions, and enforces permissions', async () => {
    const { body: boxOrder } = await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders`)
      .send({ sessionId, seatIds: [seatIds[3], seatIds[4]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${boxOrder.id}/refunds`)
      .send({ ticketIds: [boxOrder.tickets[0].id] })
      .expect(400);

    const cashRefund = await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${boxOrder.id}/refunds`)
      .send({ ticketIds: [boxOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(201);
    expect(cashRefund.body.orderStatus).toBe(OrderStatus.PartiallyRefunded);

    await app.get(DataSource).getRepository(Ticket).update({ id: boxOrder.tickets[1].id }, { status: TicketStatus.Used });
    await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${boxOrder.id}/refunds`)
      .send({ ticketIds: [boxOrder.tickets[1].id], refundMethod: PaymentProvider.Cash })
      .expect(409);

    const { order: onlineOrder } = await buyAndPayOnlineOrder('cashier-online-ref@example.com', [seatIds[5]], 'yk-ref-box-1');
    const refundSpy = vi.spyOn(yooKassa, 'createRefund').mockResolvedValueOnce({
      id: 'yk-refund-box-1',
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(onlineOrder.tickets[0].price), currency: PAYMENT_CURRENCY },
    });

    await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${onlineOrder.id}/refunds`)
      .send({ ticketIds: [onlineOrder.tickets[0].id] })
      .expect(201);
    expect(refundSpy).toHaveBeenCalledTimes(1);

    const startedSession = await app.get(DataSource).getRepository(Session).save(
      app.get(DataSource).getRepository(Session).create({
        hallId: hall.hallId,
        layoutId: hall.layoutId,
        filmId,
        startsAt: new Date(Date.now() - 10 * MINUTE_MS),
        endsAt: new Date(Date.now() + 90 * MINUTE_MS),
        format: SessionFormat.TwoD,
      }),
    );
    const { body: lateOrder } = await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders`)
      .send({ sessionId: startedSession.id, seatIds: [seatIds[0]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${lateOrder.id}/refunds`)
      .send({ ticketIds: [lateOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(409);

    await controller
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${lateOrder.id}/refunds`)
      .send({ ticketIds: [lateOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(403);

    await foreignCashier
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders/${lateOrder.id}/refunds`)
      .send({ ticketIds: [lateOrder.tickets[0].id], refundMethod: PaymentProvider.Cash })
      .expect(403);
  });
});
