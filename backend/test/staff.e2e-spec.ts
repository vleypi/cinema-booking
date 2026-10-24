import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import { STAFF_MESSAGES } from '@/modules/staff/staff.constant.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { AUTH_URL, loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const STAFF_URL = `/${API_PREFIX}/staff`;
const cinemaStaffUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/staff`;
const TEMPORARY_PASSWORD = 'Temporary-Password-1';
const UNKNOWN_ID = '999999999';

let sequence = 0;
const staffBody = (role: StaffRole, cinemaIds: string[]) => ({
  login: `cashier-${Date.now()}-${++sequence}`,
  password: TEMPORARY_PASSWORD,
  fullName: 'Иванова Анна',
  role,
  cinemaIds,
});

describe('Staff', () => {
  let app: INestApplication;
  let cinemaId: string;
  let otherCinemaId: string;
  let admin: StaffAgent;
  let superAdmin: StaffAgent;

  const createAs = async (agent: StaffAgent, role: StaffRole, cinemaIds = [cinemaId]) =>
    (await agent.post(STAFF_URL).send(staffBody(role, cinemaIds)).expect(201)).body;

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);
    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    superAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.SuperAdmin }));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('creates a staff member with a temporary password in the admin cinema', async () => {
      const body = staffBody(StaffRole.Cashier, [cinemaId]);

      const { body: created } = await admin.post(STAFF_URL).send(body).expect(201);
      const { body: profile } = await (await loginAs(app, body)).get(`${AUTH_URL}/me`).expect(200);

      expect(created).toEqual({
        id: expect.any(String),
        login: body.login,
        fullName: body.fullName,
        role: StaffRole.Cashier,
        isBlocked: false,
        mustChangePassword: true,
        cinemas: [expect.objectContaining({ id: cinemaId })],
      });
      expect(profile).toMatchObject({ id: created.id, mustChangePassword: true });
    });

    it.each([StaffRole.Admin, StaffRole.SuperAdmin])('forbids an admin to assign the %s role', async (role) => {
      const response = await admin.post(STAFF_URL).send(staffBody(role, [cinemaId])).expect(403);

      expect(response.body.message).toBe(AUTH_MESSAGES.permissionDenied);
    });

    it('lets a super admin appoint an admin but never another super admin', async () => {
      await createAs(superAdmin, StaffRole.Admin, [cinemaId, otherCinemaId]);

      await superAdmin.post(STAFF_URL).send(staffBody(StaffRole.SuperAdmin, [cinemaId])).expect(403);
    });

    it('forbids an admin to create staff in another cinema', async () => {
      const response = await admin.post(STAFF_URL).send(staffBody(StaffRole.Cashier, [otherCinemaId])).expect(403);

      expect(response.body.message).toBe(AUTH_MESSAGES.cinemaAccessDenied);
    });

    it('rejects a taken login regardless of case', async () => {
      const { login } = await createAs(admin, StaffRole.Controller);

      const response = await admin.post(STAFF_URL).send({ ...staffBody(StaffRole.Controller, [cinemaId]), login: login.toUpperCase() }).expect(409);

      expect(response.body.errors).toEqual({ login: [STAFF_MESSAGES.loginTaken] });
    });

    it('rejects an unknown cinema', async () => {
      const response = await superAdmin.post(STAFF_URL).send(staffBody(StaffRole.Cashier, [UNKNOWN_ID])).expect(400);

      expect(response.body.errors).toEqual({ cinemaIds: [CINEMA_MESSAGES.notFound] });
    });

    it('validates the request body', async () => {
      const response = await admin.post(STAFF_URL).send({ login: 'Анна', password: 'short', fullName: '', role: 'OWNER', cinemaIds: [] }).expect(400);

      expect(Object.keys(response.body.errors).sort()).toEqual(['cinemaIds', 'fullName', 'login', 'password', 'role']);
    });
  });

  describe('list', () => {
    it('shows only the staff of the requested cinema with all their cinemas', async () => {
      const shared = await createAs(superAdmin, StaffRole.Manager, [cinemaId, otherCinemaId]);
      const foreign = await createAs(superAdmin, StaffRole.Manager, [otherCinemaId]);

      const { body } = await admin.get(cinemaStaffUrl(cinemaId)).expect(200);
      const listed = body.find(({ id }: { id: string }) => id === shared.id);

      expect(listed.cinemas.map(({ id }: { id: string }) => id).sort()).toEqual([cinemaId, otherCinemaId].sort());
      expect(body.map(({ id }: { id: string }) => id)).not.toContain(foreign.id);
    });

    it('forbids an admin to list another cinema', async () => {
      await admin.get(cinemaStaffUrl(otherCinemaId)).expect(403);
    });
  });

  describe('update', () => {
    it('blocks a staff member and drops their open session at once', async () => {
      const body = staffBody(StaffRole.Cashier, [cinemaId]);
      const { body: created } = await admin.post(STAFF_URL).send(body).expect(201);
      const cashier = await loginAs(app, body);

      const { body: updated } = await admin.patch(`${STAFF_URL}/${created.id}`).send({ isBlocked: true }).expect(200);

      expect(updated.isBlocked).toBe(true);
      await cashier.get(`${AUTH_URL}/me`).expect(401);
      await request(app.getHttpServer()).post(`${AUTH_URL}/login`).send({ login: body.login, password: body.password }).expect(403);
    });

    it('changes the name and role within the allowed roles', async () => {
      const created = await createAs(admin, StaffRole.Cashier);

      const { body } = await admin.patch(`${STAFF_URL}/${created.id}`).send({ fullName: 'Петрова Анна', role: StaffRole.Manager }).expect(200);

      expect(body).toMatchObject({ fullName: 'Петрова Анна', role: StaffRole.Manager, login: created.login });
      await admin.patch(`${STAFF_URL}/${created.id}`).send({ role: StaffRole.Admin }).expect(403);
    });

    it('resets the password to a new temporary one', async () => {
      const created = await createAs(admin, StaffRole.Cashier);
      const newPassword = 'Another-Temporary-1';

      const { body } = await admin.patch(`${STAFF_URL}/${created.id}`).send({ password: newPassword }).expect(200);

      expect(body.mustChangePassword).toBe(true);
      await loginAs(app, { login: created.login, password: newPassword });
    });

    it('keeps the cinemas the admin has no access to when changing cinemas', async () => {
      const thirdCinemaId = await createCinema(app);
      const multiCinemaAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId, thirdCinemaId] }));
      const created = await createAs(superAdmin, StaffRole.Manager, [cinemaId, otherCinemaId]);

      const { body } = await multiCinemaAdmin.patch(`${STAFF_URL}/${created.id}`).send({ cinemaIds: [thirdCinemaId] }).expect(200);

      expect(body.cinemas.map(({ id }: { id: string }) => id).sort()).toEqual([otherCinemaId, thirdCinemaId].sort());
    });

    it('forbids an admin to edit staff of another cinema, another admin or themselves', async () => {
      const foreign = await createAs(superAdmin, StaffRole.Cashier, [otherCinemaId]);
      const colleague = await createAs(superAdmin, StaffRole.Admin, [cinemaId]);
      const { body: self } = await admin.get(`${AUTH_URL}/me`).expect(200);

      for (const { id } of [foreign, colleague, self]) {
        const response = await admin.patch(`${STAFF_URL}/${id}`).send({ fullName: 'Взлом' }).expect(403);
        expect(response.body.message).toBe(AUTH_MESSAGES.permissionDenied);
      }
    });

    it('answers 404 for an unknown staff member', async () => {
      const response = await admin.patch(`${STAFF_URL}/${UNKNOWN_ID}`).send({ fullName: 'Никто' }).expect(404);

      expect(response.body.message).toBe(STAFF_MESSAGES.notFound);
    });
  });

  it('keeps staff management away from managers', async () => {
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));

    await manager.get(cinemaStaffUrl(cinemaId)).expect(403);
    await manager.post(STAFF_URL).send(staffBody(StaffRole.Cashier, [cinemaId])).expect(403);
  });
});
