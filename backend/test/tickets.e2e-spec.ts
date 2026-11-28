import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { type ISendMailOptions, MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, todayIn } from '@/common/time/zoned-time.js';
import type { EnvironmentVariables } from '@/config/environment.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { PAYMENT_CURRENCY, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { verifyTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const ORDERS_URL = `/${API_PREFIX}/orders`;
const CUSTOMER_URL = `/${API_PREFIX}/customer`;
const WEBHOOK_URL = `/${API_PREFIX}/payments/yookassa/webhook`;

describe('Tickets PDF, QR & Email Dispatch', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let yooKassaClient: YooKassaClient;
  let mailService: MailService;
  let sessionId: string;
  let seatIds: string[];

  const loginCustomer = async (email: string) => {
    const otpSpy = vi.spyOn(mailService, 'sendMail');
    await request(server).post(`${CUSTOMER_URL}/auth/request-otp`).send({ email }).expect(204);
    const otpCall = otpSpy.mock.calls.at(-1)?.[0] as ISendMailOptions;
    const match = otpCall.text.match(/\b(\d{6})\b/);
    if (!match) throw new Error('OTP code missing');

    const agent = request.agent(server);
    await agent.post(`${CUSTOMER_URL}/auth/verify-otp`).send({ email, code: match[1] }).expect(200);
    otpSpy.mockRestore();

    return agent;
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    yooKassaClient = app.get(YooKassaClient);
    mailService = app.get(MailService);
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

    const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Билетный фильм', ageRating: AgeRating.Twelve }).expect(201)).body.id;
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

  it('sends one email with multi-page PDF attachment on payment success, exposes signed QR payloads, and serves PDF download with IDOR protection', async () => {
    const email = 'tickets-buyer@example.com';
    const { body: order } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatIds[0], seatIds[1]], email, privacyAccepted: true })
      .expect(201);

    const externalId = 'yk-tickets-pay-1';
    vi.spyOn(yooKassaClient, 'createPayment').mockResolvedValueOnce({
      id: externalId,
      status: 'pending',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      confirmation: { type: 'redirect', confirmation_url: 'https://yoomoney.ru/checkout/test' },
    });
    await request(server).post(`${ORDERS_URL}/${order.id}/payments`).expect(201);

    vi.spyOn(yooKassaClient, 'getPayment').mockResolvedValue({
      id: externalId,
      status: 'succeeded',
      amount: { value: formatKopecksToRubles(order.totalAmount), currency: PAYMENT_CURRENCY },
      captured_at: '2026-11-28T13:00:00.000Z',
    });

    const mailSpy = vi.spyOn(mailService, 'sendMail');

    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(200);
    await request(server)
      .post(WEBHOOK_URL)
      .send({ event: YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded, object: { id: externalId } })
      .expect(200);

    expect(mailSpy).toHaveBeenCalledTimes(1);
    const mailArgs = mailSpy.mock.calls[0][0] as ISendMailOptions;
    expect(mailArgs.to).toBe(email);
    expect(mailArgs.subject).toContain(order.number);
    expect(mailArgs.text).toContain(`/cabinet/orders/${order.id}`);
    expect(mailArgs.attachments).toHaveLength(1);

    const attachment = mailArgs.attachments?.[0];
    expect(attachment?.filename).toBe(`tickets-${order.number}.pdf`);
    expect(attachment?.contentType).toBe('application/pdf');
    const attachmentRaw = attachment?.content.toString('latin1') ?? '';
    expect(attachmentRaw.startsWith('%PDF-')).toBe(true);
    expect(attachmentRaw.match(/\/Type \/Page\b/g) ?? []).toHaveLength(2);

    mailSpy.mockRestore();

    const buyerAgent = await loginCustomer(email);
    const { body: cabinetOrder } = await buyerAgent.get(`${CUSTOMER_URL}/orders/${order.id}`).expect(200);
    const secret = app.get(ConfigService<EnvironmentVariables, true>).get('JWT_ACCESS_SECRET', { infer: true });

    expect(cabinetOrder.tickets).toHaveLength(2);
    for (const ticket of cabinetOrder.tickets as Array<{ code: string; qrPayload: string | null }>) {
      expect(ticket.qrPayload).not.toBeNull();
      expect(verifyTicketQrPayload(ticket.qrPayload as string, secret)).toBe(ticket.code);
    }

    const pdfRes = await buyerAgent.get(`${CUSTOMER_URL}/orders/${order.id}/pdf`).expect(200);
    expect(pdfRes.headers['content-type']).toContain('application/pdf');
    expect(pdfRes.headers['content-disposition']).toContain(`tickets-${order.number}.pdf`);
    expect((pdfRes.body as Buffer).subarray(0, 5).toString('latin1')).toBe('%PDF-');

    const otherAgent = await loginCustomer('other-buyer@example.com');
    await otherAgent.get(`${CUSTOMER_URL}/orders/${order.id}/pdf`).expect(404);

    const { body: unpaidOrder } = await request(server)
      .post(ORDERS_URL)
      .send({ sessionId, seatIds: [seatIds[2]], email, privacyAccepted: true })
      .expect(201);
    await buyerAgent.get(`${CUSTOMER_URL}/orders/${unpaidOrder.id}/pdf`).expect(409);
  });
});
