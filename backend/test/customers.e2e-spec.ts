import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { CUSTOMER_COOKIE_NAMES, CUSTOMER_MESSAGES, OTP_MAX_ATTEMPTS } from '@/modules/customers/customers.constant.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, readSetCookies } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const CUSTOMER_URL = `/${API_PREFIX}/customer`;
const CUSTOMER_AUTH_URL = `${CUSTOMER_URL}/auth`;
const ORDERS_URL = `/${API_PREFIX}/orders`;

const extractOtpCode = (text: string): string => {
  const match = text.match(/\b(\d{6})\b/);
  if (!match) throw new Error('OTP code was not found in email text');

  return match[1];
};

describe('Customer OTP Auth & Cabinet', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let sendMailSpy: ReturnType<typeof vi.spyOn>;

  const requestAndCaptureOtp = async (email: string): Promise<string> => {
    sendMailSpy.mockClear();
    await request(server).post(`${CUSTOMER_AUTH_URL}/request-otp`).send({ email }).expect(204);
    expect(sendMailSpy).toHaveBeenCalledTimes(1);
    const mailPayload = sendMailSpy.mock.calls[0][0] as { to: string; text: string };
    expect(mailPayload.to).toBe(email.trim().toLowerCase());

    return extractOtpCode(mailPayload.text);
  };

  const loginCustomer = async (email: string) => {
    const code = await requestAndCaptureOtp(email);
    const agent = request.agent(server);
    const response = await agent.post(`${CUSTOMER_AUTH_URL}/verify-otp`).send({ email, code }).expect(200);

    return { agent, response };
  };

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    sendMailSpy = vi.spyOn(app.get(MailService), 'sendMail');
  });

  beforeEach(async () => {
    await app.get(RedisClient).flushdb();
    sendMailSpy.mockClear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('OTP authentication', () => {
    it('logs in a customer via email OTP, sets httpOnly cookies, verifies email, and exposes session/profile', async () => {
      const { agent, response } = await loginCustomer('  Viewer@Example.COM ');
      const cookies = readSetCookies(response);

      expect(response.body).toMatchObject({
        email: 'viewer@example.com',
        name: null,
        phone: null,
      });
      expect(response.body.emailVerifiedAt).toEqual(expect.any(String));
      expect(Object.keys(cookies)).toEqual([CUSTOMER_COOKIE_NAMES.access, CUSTOMER_COOKIE_NAMES.refresh]);
      (response.headers['set-cookie'] as unknown as string[]).forEach((cookie) => expect(cookie).toMatch(/HttpOnly/));

      const sessionRes = await agent.get(`${CUSTOMER_AUTH_URL}/session`).expect(200);
      expect(sessionRes.body).toEqual({ authenticated: true });

      const meRes = await agent.get(`${CUSTOMER_URL}/me`).expect(200);
      expect(meRes.body).toMatchObject({ id: response.body.id, email: 'viewer@example.com' });
    });

    it('enforces resend cooldown on repeated OTP requests', async () => {
      await requestAndCaptureOtp('cooldown@example.com');

      const second = await request(server).post(`${CUSTOMER_AUTH_URL}/request-otp`).send({ email: 'cooldown@example.com' }).expect(429);
      expect(second.body.message).toBe(CUSTOMER_MESSAGES.otpCooldown);
    });

    it('returns generic 401 on wrong code and invalidates the OTP after five failed attempts', async () => {
      const email = 'attempts@example.com';
      const validCode = await requestAndCaptureOtp(email);
      const wrongCode = validCode === '000000' ? '111111' : '000000';

      for (let attempt = 0; attempt < OTP_MAX_ATTEMPTS; attempt++) {
        const res = await request(server).post(`${CUSTOMER_AUTH_URL}/verify-otp`).send({ email, code: wrongCode }).expect(401);
        expect(res.body.message).toBe(CUSTOMER_MESSAGES.invalidOtp);
      }

      const afterLimit = await request(server).post(`${CUSTOMER_AUTH_URL}/verify-otp`).send({ email, code: validCode }).expect(401);
      expect(afterLimit.body.message).toBe(CUSTOMER_MESSAGES.invalidOtp);
    });

    it('rotates refresh token on refresh and revokes it on logout', async () => {
      const { response } = await loginCustomer('rotate@example.com');
      const initialCookies = readSetCookies(response);

      const refreshRes = await request(server)
        .post(`${CUSTOMER_AUTH_URL}/refresh`)
        .set('Cookie', `${CUSTOMER_COOKIE_NAMES.refresh}=${initialCookies[CUSTOMER_COOKIE_NAMES.refresh]}`)
        .expect(204);
      const rotatedCookies = readSetCookies(refreshRes);
      expect(rotatedCookies[CUSTOMER_COOKIE_NAMES.refresh]).not.toBe(initialCookies[CUSTOMER_COOKIE_NAMES.refresh]);

      await request(server)
        .post(`${CUSTOMER_AUTH_URL}/refresh`)
        .set('Cookie', `${CUSTOMER_COOKIE_NAMES.refresh}=${initialCookies[CUSTOMER_COOKIE_NAMES.refresh]}`)
        .expect(401);

      await request(server)
        .post(`${CUSTOMER_AUTH_URL}/logout`)
        .set('Cookie', `${CUSTOMER_COOKIE_NAMES.refresh}=${rotatedCookies[CUSTOMER_COOKIE_NAMES.refresh]}`)
        .expect(204);

      await request(server)
        .post(`${CUSTOMER_AUTH_URL}/refresh`)
        .set('Cookie', `${CUSTOMER_COOKIE_NAMES.refresh}=${rotatedCookies[CUSTOMER_COOKIE_NAMES.refresh]}`)
        .expect(401);
    });

    it('rejects staff cookies on customer endpoints', async () => {
      const staffAgent = await loginAs(app, await createStaff(app, { role: StaffRole.Admin }));

      await staffAgent.get(`${CUSTOMER_URL}/me`).expect(401);
      await staffAgent.get(`${CUSTOMER_AUTH_URL}/session`).expect(401);
    });
  });

  describe('Customer cabinet', () => {
    it('updates customer name and phone', async () => {
      const { agent } = await loginCustomer('profile@example.com');

      const { body } = await agent.patch(`${CUSTOMER_URL}/me`).send({ name: 'Анна Петрова', phone: '+79991234567' }).expect(200);
      expect(body).toMatchObject({ email: 'profile@example.com', name: 'Анна Петрова', phone: '+79991234567' });

      const persisted = await agent.get(`${CUSTOMER_URL}/me`).expect(200);
      expect(persisted.body).toMatchObject({ name: 'Анна Петрова', phone: '+79991234567' });
    });

    it('splits customer orders into upcoming and past, includes box-office orders, excludes expired, and enforces IDOR protection', async () => {
      const cinemaId = await createCinema(app);
      const dataSource = app.get(DataSource);
      await dataSource.getRepository(Cinema).update({ id: cinemaId }, { isPublished: true });

      const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
      const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
      await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

      const hall = await createHallWithLayout(admin, cinemaId);
      const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: hall.layoutId }, order: { id: 'ASC' } });
      const filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Кабинетный фильм', ageRating: AgeRating.Twelve }).expect(201)).body.id;

      const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);
      const upcomingSessionId = (
        await manager.post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`).send({ filmId, hallId: hall.hallId, date: tomorrow, time: '14:00', format: SessionFormat.TwoD }).expect(201)
      ).body.id;

      const pastSession = await dataSource.getRepository(Session).save(
        dataSource.getRepository(Session).create({
          hallId: hall.hallId,
          layoutId: hall.layoutId,
          filmId,
          startsAt: new Date(Date.now() - 240 * MINUTE_MS),
          endsAt: new Date(Date.now() - 120 * MINUTE_MS),
          format: SessionFormat.TwoD,
        }),
      );

      const upcomingOnline = await request(server)
        .post(ORDERS_URL)
        .send({ sessionId: upcomingSessionId, seatIds: [seats[0].id], email: 'alice@example.com', privacyAccepted: true })
        .expect(201);

      const otherCustomerOrder = await request(server)
        .post(ORDERS_URL)
        .send({ sessionId: upcomingSessionId, seatIds: [seats[1].id], email: 'bob@example.com', privacyAccepted: true })
        .expect(201);

      const expiredOrder = await request(server)
        .post(ORDERS_URL)
        .send({ sessionId: upcomingSessionId, seatIds: [seats[2].id], email: 'alice@example.com', privacyAccepted: true })
        .expect(201);
      await dataSource.getRepository(Order).update({ id: expiredOrder.body.id }, { status: OrderStatus.Expired });

      const alice = await dataSource.getRepository(Customer).findOneByOrFail({ email: 'alice@example.com' });
      const pastBoxOfficeOrder = await dataSource.getRepository(Order).save(
        dataSource.getRepository(Order).create({
          number: 'LUCH-PAST-001',
          cinemaId,
          sessionId: pastSession.id,
          customerId: alice.id,
          contactEmail: alice.email,
          channel: OrderChannel.BoxOffice,
          status: OrderStatus.Paid,
          totalAmount: 50000,
          ageConfirmed: false,
          holdExpiresAt: null,
        }),
      );
      await dataSource.getRepository(Ticket).save(
        dataSource.getRepository(Ticket).create({
          orderId: pastBoxOfficeOrder.id,
          sessionId: pastSession.id,
          seatId: seats[0].id,
          code: 'PASTCODE12',
          price: 50000,
          status: TicketStatus.Used,
        }),
      );

      const { agent: aliceAgent } = await loginCustomer('alice@example.com');
      const { body: list } = await aliceAgent.get(`${CUSTOMER_URL}/orders`).expect(200);

      expect(list.upcoming.map((order: { id: string }) => order.id)).toEqual([upcomingOnline.body.id]);
      expect(list.past.map((order: { id: string }) => order.id)).toEqual([pastBoxOfficeOrder.id]);
      expect(list.past[0]).toMatchObject({
        channel: OrderChannel.BoxOffice,
        status: OrderStatus.Paid,
        session: { filmTitle: 'Кабинетный фильм' },
      });

      const { body: ownOrder } = await aliceAgent.get(`${CUSTOMER_URL}/orders/${upcomingOnline.body.id}`).expect(200);
      expect(ownOrder.id).toBe(upcomingOnline.body.id);
      expect(ownOrder.tickets).toHaveLength(1);

      await aliceAgent.get(`${CUSTOMER_URL}/orders/${otherCustomerOrder.body.id}`).expect(404);
    });
  });
});
