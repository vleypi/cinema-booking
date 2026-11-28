import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { type ISendMailOptions, MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const boxOfficeBase = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/box-office`;

describe('Box Office API (4.1)', () => {
  let app: INestApplication;
  let cinemaId: string;
  let otherCinemaId: string;
  let cashier: StaffAgent;
  let cashierStaffId: string;
  let controller: StaffAgent;
  let foreignCashier: StaffAgent;
  let sessionId: string;
  let ongoingSessionId: string;
  let endedSessionId: string;
  let seatIds: string[];

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);
    await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });

    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    const cashierStaff = await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] });
    cashierStaffId = cashierStaff.id;
    cashier = await loginAs(app, cashierStaff);
    controller = await loginAs(app, await createStaff(app, { role: StaffRole.Controller, cinemaIds: [cinemaId] }));
    foreignCashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [otherCinemaId] }));

    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    const hall = await createHallWithLayout(admin, cinemaId);
    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Кассовый фильм', ageRating: AgeRating.Twelve }).expect(201)).body.id;
    const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);
    sessionId = (
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId: hall.hallId, date: tomorrow, time: '15:00', format: SessionFormat.TwoD })
        .expect(201)
    ).body.id;

    const sessionRepo = dataSource.getRepository(Session);
    const ongoing = await sessionRepo.save(
      sessionRepo.create({
        hallId: hall.hallId,
        layoutId: hall.layoutId,
        filmId,
        startsAt: new Date(Date.now() - 20 * MINUTE_MS),
        endsAt: new Date(Date.now() + 90 * MINUTE_MS),
        format: SessionFormat.TwoD,
      }),
    );
    ongoingSessionId = ongoing.id;

    const ended = await sessionRepo.save(
      sessionRepo.create({
        hallId: hall.hallId,
        layoutId: hall.layoutId,
        filmId,
        startsAt: new Date(Date.now() - 180 * MINUTE_MS),
        endsAt: new Date(Date.now() - 60 * MINUTE_MS),
        format: SessionFormat.TwoD,
      }),
    );
    endedSessionId = ended.id;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sells more than five tickets without email using cash, records payment and cashier, and generates A4 and 80mm receipt PDFs', async () => {
    const mailSpy = vi.spyOn(app.get(MailService), 'sendMail');
    const chosenSeats = seatIds.slice(0, 6);

    const { body: seatMap } = await cashier.get(`${boxOfficeBase(cinemaId)}/sessions/${sessionId}/seats`).expect(200);
    expect(seatMap.seats).toHaveLength(seatIds.length);

    const { body: order } = await cashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({
        sessionId,
        seatIds: chosenSeats,
        paymentMethod: PaymentProvider.Cash,
      })
      .expect(201);

    expect(order).toMatchObject({
      cinemaId,
      channel: OrderChannel.BoxOffice,
      status: OrderStatus.Paid,
      cashierId: cashierStaffId,
      contactEmail: null,
    });
    expect(order.tickets).toHaveLength(6);
    expect(order.tickets.every((ticket: { status: string; qrPayload: string | null }) => ticket.status === TicketStatus.Active && Boolean(ticket.qrPayload))).toBe(true);
    expect(mailSpy).not.toHaveBeenCalled();

    const payment = await app.get(DataSource).getRepository(Payment).findOneByOrFail({ orderId: order.id });
    expect(payment).toMatchObject({
      provider: PaymentProvider.Cash,
      status: PaymentStatus.Succeeded,
      amount: order.totalAmount,
    });

    const a4Pdf = await cashier.get(`${boxOfficeBase(cinemaId)}/orders/${order.id}/pdf`).query({ format: 'a4' }).expect(200);
    expect(a4Pdf.headers['content-type']).toContain('application/pdf');
    expect((a4Pdf.body as Buffer).toString('latin1').startsWith('%PDF-')).toBe(true);

    const receiptPdf = await cashier.get(`${boxOfficeBase(cinemaId)}/orders/${order.id}/pdf`).query({ format: 'receipt' }).expect(200);
    const receiptRaw = (receiptPdf.body as Buffer).toString('latin1');
    expect(receiptRaw.startsWith('%PDF-')).toBe(true);
    expect(receiptRaw).toContain('226.77');
    expect(receiptRaw.match(/\/Type \/Page\b/g) ?? []).toHaveLength(6);
  });

  it('links customer and sends PDF email when email is provided, and supports searching by order number, ticket code, email, and phone', async () => {
    const mailSpy = vi.spyOn(app.get(MailService), 'sendMail');

    const { body: order } = await cashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({
        sessionId,
        seatIds: [seatIds[6]],
        paymentMethod: PaymentProvider.CardTerminal,
        email: 'box-guest@example.com',
        name: 'Дмитрий',
        phone: '+79990001122',
      })
      .expect(201);

    expect(mailSpy).toHaveBeenCalledTimes(1);
    const mailArgs = mailSpy.mock.calls[0][0] as ISendMailOptions;
    expect(mailArgs.to).toBe('box-guest@example.com');
    expect(mailArgs.attachments).toHaveLength(1);

    const customer = await app.get(DataSource).getRepository(Customer).findOneByOrFail({ email: 'box-guest@example.com' });
    expect(customer.phone).toBe('+79990001122');

    const ticketCode = (order.tickets as Array<{ code: string }>)[0].code;

    for (const query of [order.number as string, ticketCode, 'box-guest@example.com', '0001122']) {
      const { body: results } = await controller.get(`${boxOfficeBase(cinemaId)}/orders`).query({ query }).expect(200);
      expect(results.some((item: { id: string }) => item.id === order.id)).toBe(true);
    }
  });

  it('allows box-office sale during an ongoing session, rejects ended sessions and seats held online, and enforces role and cinema access', async () => {
    await cashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({ sessionId: ongoingSessionId, seatIds: [seatIds[0]], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    await cashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({ sessionId: endedSessionId, seatIds: [seatIds[0]], paymentMethod: PaymentProvider.Cash })
      .expect(409);

    const onlineHeldSeat = seatIds[7];
    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/orders`)
      .send({ sessionId, seatIds: [onlineHeldSeat], email: 'online-holder@example.com', privacyAccepted: true })
      .expect(201);

    await cashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [onlineHeldSeat], paymentMethod: PaymentProvider.Cash })
      .expect(409);

    await controller
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[8]], paymentMethod: PaymentProvider.Cash })
      .expect(403);

    await foreignCashier.get(`${boxOfficeBase(cinemaId)}/orders`).expect(403);
    await foreignCashier
      .post(`${boxOfficeBase(cinemaId)}/orders`)
      .send({ sessionId, seatIds: [seatIds[8]], paymentMethod: PaymentProvider.Cash })
      .expect(403);
  });
});
