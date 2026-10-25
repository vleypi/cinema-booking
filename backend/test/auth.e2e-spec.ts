import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { AUTH_MESSAGES, LOGIN_MAX_ATTEMPTS, AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import { Permission } from '@/modules/auth/permissions.js';
import { DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { ACCESS_PROBE_CONTROLLERS, PERMISSION_PROBE_PATH } from '@test/support/access-probe.controllers.js';
import { loginAs, readSetCookies, refreshCookie, AUTH_URL } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createCinema, createStaff, STAFF_PASSWORD } from '@test/support/staff.fixture.js';

const PROBE_URL = `/${API_PREFIX}/${PERMISSION_PROBE_PATH}/${Permission.SearchOrders}`;
const NEW_PASSWORD = 'New-Password-1';

describe('Authentication', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  const login = ({ login, password }: { login: string; password: string }) =>
    request(server).post(`${AUTH_URL}/login`).send({ login, password });

  const refresh = (token: string) => request(server).post(`${AUTH_URL}/refresh`).set('Cookie', refreshCookie(token));

  beforeAll(async () => {
    app = await createTestApp(ACCESS_PROBE_CONTROLLERS);
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    await app.get(RedisClient).flushdb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    it('returns the profile and sets httpOnly cookies without exposing secrets', async () => {
      const cinemaId = await createCinema(app);
      const staff = await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] });

      const response = await login(staff).expect(200);
      const cookies = readSetCookies(response);
      const body = JSON.stringify(response.body);

      expect(response.body).toMatchObject({ login: staff.login, role: StaffRole.Cashier, cinemas: [{ id: cinemaId, timezone: DEFAULT_TIMEZONE }] });
      expect(response.body.permissions).toContain(Permission.SellTickets);
      expect(Object.keys(cookies)).toEqual([AUTH_COOKIE_NAMES.access, AUTH_COOKIE_NAMES.refresh]);
      (response.headers['set-cookie'] as unknown as string[]).forEach((cookie) => expect(cookie).toMatch(/HttpOnly/));
      [staff.password, ...Object.values(cookies)].forEach((secret) => expect(body).not.toContain(secret));
    });

    it('answers the same way for a wrong password and an unknown login', async () => {
      const staff = await createStaff(app);

      const wrongPassword = await login({ login: staff.login, password: 'Wrong-Password-1' }).expect(401);
      const unknownLogin = await login({ login: 'nobody', password: STAFF_PASSWORD }).expect(401);

      expect(wrongPassword.body.message).toBe(AUTH_MESSAGES.invalidCredentials);
      expect(unknownLogin.body.message).toBe(AUTH_MESSAGES.invalidCredentials);
    });

    it('ignores login case and surrounding spaces', async () => {
      const staff = await createStaff(app);

      await login({ login: `  ${staff.login.toUpperCase()} `, password: staff.password }).expect(200);
    });

    it('locks the login after five wrong passwords even for the right one', async () => {
      const staff = await createStaff(app);

      for (let attempt = 0; attempt < LOGIN_MAX_ATTEMPTS; attempt++) {
        await login({ login: staff.login, password: 'Wrong-Password-1' }).expect(401);
      }

      const response = await login(staff).expect(429);
      expect(response.body.message).toBe(AUTH_MESSAGES.loginLocked);
    });

    it('rejects a blocked staff member', async () => {
      const staff = await createStaff(app, { isBlocked: true });

      const response = await login(staff).expect(403);
      expect(response.body.message).toBe(AUTH_MESSAGES.staffBlocked);
    });

    it('validates the request body', async () => {
      const response = await login({ login: '', password: '' }).expect(400);

      expect(Object.keys(response.body.errors)).toEqual(['login', 'password']);
    });
  });

  describe('session', () => {
    it('requires authentication', async () => {
      await request(server).get(`${AUTH_URL}/session`).expect(401);
      await request(server).get(`${AUTH_URL}/me`).expect(401);
    });

    it('lets a super admin see every cinema and every permission', async () => {
      const [first, second] = [await createCinema(app), await createCinema(app)];
      const agent = await loginAs(app, await createStaff(app, { role: StaffRole.SuperAdmin }));

      const { body } = await agent.get(`${AUTH_URL}/me`).expect(200);

      expect(body.cinemas.map((cinema: { id: string }) => cinema.id)).toEqual(expect.arrayContaining([first, second]));
      expect(body.permissions).toEqual(Object.values(Permission));
    });

    it('drops access immediately after the staff member is blocked', async () => {
      const staff = await createStaff(app);
      const agent = await loginAs(app, staff);

      await app.get(DataSource).getRepository(StaffUser).update({ id: staff.id }, { isBlocked: true });

      await agent.get(`${AUTH_URL}/me`).expect(401);
    });
  });

  describe('refresh and logout', () => {
    it('replaces both tokens and makes the old refresh token useless', async () => {
      const staff = await createStaff(app);
      const { [AUTH_COOKIE_NAMES.refresh]: oldToken } = readSetCookies(await login(staff).expect(200));

      const refreshed = readSetCookies(await refresh(oldToken).expect(204));

      expect(refreshed[AUTH_COOKIE_NAMES.refresh]).not.toBe(oldToken);
      await request(server).get(`${AUTH_URL}/me`).set('Cookie', `${AUTH_COOKIE_NAMES.access}=${refreshed[AUTH_COOKIE_NAMES.access]}`).expect(200);
      await refresh(oldToken).expect(401);
    });

    it('rejects refresh without a cookie', async () => {
      await request(server).post(`${AUTH_URL}/refresh`).expect(401);
    });

    it('revokes the refresh token on logout', async () => {
      const staff = await createStaff(app);
      const { [AUTH_COOKIE_NAMES.refresh]: token } = readSetCookies(await login(staff).expect(200));

      await request(server).post(`${AUTH_URL}/logout`).set('Cookie', refreshCookie(token)).expect(204);
      await refresh(token).expect(401);
    });
  });

  describe('temporary password', () => {
    it('blocks every protected action until the password is changed', async () => {
      const staff = await createStaff(app, { mustChangePassword: true });
      const agent = await loginAs(app, staff);

      const blocked = await agent.get(PROBE_URL).expect(403);
      expect(blocked.body.message).toBe(AUTH_MESSAGES.passwordChangeRequired);
      await agent.get(`${AUTH_URL}/me`).expect(200);

      await agent.post(`${AUTH_URL}/password`).send({ currentPassword: staff.password, newPassword: NEW_PASSWORD }).expect(204);

      await agent.get(PROBE_URL).expect(200);
      await login({ login: staff.login, password: NEW_PASSWORD }).expect(200);
    });

    it('rejects a wrong current password with a field error', async () => {
      const agent = await loginAs(app, await createStaff(app, { mustChangePassword: true }));

      const response = await agent.post(`${AUTH_URL}/password`).send({ currentPassword: 'Wrong-Password-1', newPassword: NEW_PASSWORD }).expect(400);

      expect(response.body.errors).toEqual({ currentPassword: [AUTH_MESSAGES.wrongCurrentPassword] });
    });
  });
});
