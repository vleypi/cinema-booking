import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { seatHoldKey } from '@/modules/orders/orders.constant.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { type IYooKassaPaymentResponse, YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const ORDERS_URL = `/${API_PREFIX}/orders`;
const WEBHOOK_URL = `/${API_PREFIX}/payments/yookassa/webhook`;
const createPaymentUrl = (orderId: string) => `/${API_PREFIX}/orders/${orderId}/payments`;

describe('YooKassa Payments & Webhook', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let yooKassaClient: YooKassaClient;
  let sessionId: string;
  let seatIds: string[];
  let seatCursor = 0;

  const nextSeatId = () => seatIds[seatCursor++];

  const createOrder = async (email = 'buyer@example.com'): Promise<{ id: string; number: string; totalAmount: number; seatId: string }> => {
    const seatId = nextSeatId();
    const { body } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatId], email, privacyAccepted: true })
      .expect(201);

    return { id: body.id, number: body.number, totalAmount: body.totalAmount, seatId };
  };

  const mockCreatePayment = (externalId: string, amountKopecks: number): IYooKassaPaymentResponse => ({
    id: externalId,
    status: 'pending',
    amount: { value: formatKopecksToRubles(amountKopecks), currency: PAYMENT_CURRENCY },
    confirmation: { type: 'redirect', confirmation_url: `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${externalId}` },
  });

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    yooKassaClient = app.get(YooKassaClient);
    await app.get(RedisClient).flushdb();

    const cinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });

    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    const hall = await createHallWithLayout(admin, cinemaId);
    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), ageRating: AgeRating.Twelve }).expect(201)).body.id;
    const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);
    sessionId = (
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

  it('creates a YooKassa payment, verifies succeeded webhook via API, activates tickets, and handles duplicate webhooks idempotently', async () => {
    const order = await createOrder('pay-success@example.com');
    const externalId = 'yk-pay-success-1';

    const createSpy = vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce(mockCreatePayment(externalId, order.totalAmount));
    const { body: createdPayment } = await request(server).post(createPaymentUrl(order.id)).expect(201);

    expect(createdPayment).toMatchObject({
      orderId: order.id,
      orderNumber: order.number,
      provider: PaymentProvider.YooKassa,
      externalId,
      amount: order.totalAmount,
      status: PaymentStatus.Pending,
      confirmationUrl: `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${externalId}`,
      paidAt: null,
    });
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        amountKopecks: order.totalAmount,
        returnUrl: expect.stringContaining(`/orders/${order.number}`),
      }),
    );

    const getSpy = vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValue({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T12:00:00.000Z',
    });

    const webhookPayload = {
      type: 'notification',
      event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded,
      object: { id: externalId, status: 'succeeded', test: true },
    };

    await request(server).post(WEBHOOK_URL).send(webhookPayload).expect(200);
    await request(server).post(WEBHOOK_URL).send(webhookPayload).expect(200);

    expect(getSpy).toHaveBeenCalledTimes(2);

    const dataSource = app.get(DataSource);
    const updatedOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: order.id });
    const updatedPayment = await dataSource.getRepository(Payment).findOneByOrFail({ id: createdPayment.id });
    const tickets = await dataSource.getRepository(Ticket).findBy({ orderId: order.id });

    expect(updatedOrder.status).toBe(OrderStatus.Paid);
    expect(updatedOrder.holdExpiresAt).toBeNull();
    expect(updatedPayment.status).toBe(PaymentStatus.Succeeded);
    expect(updatedPayment.paidAt).toBeInstanceOf(Date);
    expect(tickets).toHaveLength(1);
    expect(tickets[0].status).toBe(TicketStatus.Active);

    const holdAfterPay = await app.get(RedisClient).get(seatHoldKey(sessionId, order.seatId));
    expect(holdAfterPay).toBeNull();
  });

  it('rejects spoofed webhooks when YooKassa API does not confirm status or amount', async () => {
    const order = await createOrder('spoof@example.com');
    const externalId = 'yk-pay-spoof-1';

    vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce(mockCreatePayment(externalId, order.totalAmount));
    await request(server).post(createPaymentUrl(order.id)).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
    });
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(400);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'succeeded',
      amount: { value: '1.00', currency: PAYMENT_CURRENCY },
    });
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(400);

    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: 'yk-unknown-id' } })
      .expect(400);

    const dataSource = app.get(DataSource);
    const unchangedOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: order.id });
    const unchangedTickets = await dataSource.getRepository(Ticket).findBy({ orderId: order.id });
    expect(unchangedOrder.status).toBe(OrderStatus.PendingPayment);
    expect(unchangedTickets[0].status).toBe(TicketStatus.Reserved);
  });

  it('marks canceled payment and lets the guest retry payment while the hold is still active', async () => {
    const order = await createOrder('retry@example.com');
    const firstExternalId = 'yk-pay-cancel-1';
    const secondExternalId = 'yk-pay-retry-2';

    vi.spyOn(yooKassaClient, 'createPayment')
      .mockResolvedValueOnce(mockCreatePayment(firstExternalId, order.totalAmount))
      .mockResolvedValueOnce(mockCreatePayment(secondExternalId, order.totalAmount));

    const first = await request(server).post(createPaymentUrl(order.id)).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValueOnce({
      id: firstExternalId,
      status: 'canceled',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
    });

    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentCanceled, object: { id: firstExternalId } })
      .expect(200);

    const dataSource = app.get(DataSource);
    const canceledPayment = await dataSource.getRepository(Payment).findOneByOrFail({ id: first.body.id });
    const pendingOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: order.id });
    expect(canceledPayment.status).toBe(PaymentStatus.Canceled);
    expect(pendingOrder.status).toBe(OrderStatus.PendingPayment);

    const second = await request(server).post(createPaymentUrl(order.id)).expect(201);
    expect(second.body.externalId).toBe(secondExternalId);
    expect(second.body.status).toBe(PaymentStatus.Pending);
  });

  it('rejects payment creation after the 10-minute hold has expired', async () => {
    const order = await createOrder('expired-pay@example.com');
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Order).update({ id: order.id }, { holdExpiresAt: new Date(Date.now() - MINUTE_MS) });

    await request(server).post(createPaymentUrl(order.id)).expect(409);

    const expiredOrder = await dataSource.getRepository(Order).findOneByOrFail({ id: order.id });
    expect(expiredOrder.status).toBe(OrderStatus.Expired);
  });
});
