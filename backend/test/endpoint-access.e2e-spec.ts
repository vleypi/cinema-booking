import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { Permission } from '@/modules/auth/permissions.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createFilm } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { PERMISSION_MATRIX } from '@test/support/permission-matrix.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

interface ICinemaFixture {
  cinemaId: string;
  hallId: string;
  priceZoneId: string;
  sessionId: string;
  staffId: string;
  filmId: string;
}

interface IEndpoint {
  method: HttpMethod;
  path: (fixture: ICinemaFixture) => string;
  permission: Permission;
  isCinemaScoped: boolean;
  body?: (fixture: ICinemaFixture) => object;
  foreignDenial?: string;
}

const SESSION_DATE = '2030-03-15';
const SESSION_TIME = '12:00';
const DENIED_STATUSES = [401, 403];

const ENDPOINTS: IEndpoint[] = [
  { method: 'get', path: () => '/cinemas', permission: Permission.ManageCinemas, isCinemaScoped: false },
  { method: 'post', path: () => '/cinemas', permission: Permission.ManageCinemas, isCinemaScoped: false },
  { method: 'patch', path: ({ cinemaId }) => `/cinemas/${cinemaId}`, permission: Permission.ManageCinemas, isCinemaScoped: true },
  { method: 'get', path: ({ cinemaId }) => `/cinemas/${cinemaId}/staff`, permission: Permission.ManageStaff, isCinemaScoped: true },
  { method: 'post', path: () => '/staff', permission: Permission.ManageStaff, isCinemaScoped: false },
  {
    method: 'patch',
    path: ({ staffId }) => `/staff/${staffId}`,
    permission: Permission.ManageStaff,
    isCinemaScoped: true,
    foreignDenial: AUTH_MESSAGES.permissionDenied,
  },
  { method: 'get', path: ({ cinemaId }) => `/cinemas/${cinemaId}/halls`, permission: Permission.ManageSchedule, isCinemaScoped: true },
  { method: 'post', path: ({ cinemaId }) => `/cinemas/${cinemaId}/halls`, permission: Permission.ManageHalls, isCinemaScoped: true },
  { method: 'patch', path: ({ hallId }) => `/halls/${hallId}`, permission: Permission.ManageHalls, isCinemaScoped: true },
  {
    method: 'post',
    path: ({ hallId }) => `/halls/${hallId}/price-zones`,
    permission: Permission.ManageHalls,
    isCinemaScoped: true,
    body: () => ({ name: 'Лучшие места', multiplier: 1.3 }),
  },
  { method: 'patch', path: ({ priceZoneId }) => `/price-zones/${priceZoneId}`, permission: Permission.ManageHalls, isCinemaScoped: true },
  { method: 'delete', path: ({ priceZoneId }) => `/price-zones/${priceZoneId}`, permission: Permission.ManageHalls, isCinemaScoped: true },
  { method: 'get', path: ({ hallId }) => `/halls/${hallId}/layout`, permission: Permission.ManageHalls, isCinemaScoped: true },
  {
    method: 'post',
    path: ({ hallId }) => `/halls/${hallId}/layouts`,
    permission: Permission.ManageHalls,
    isCinemaScoped: true,
    body: ({ priceZoneId }) => ({ rows: 1, seats: [{ row: 1, number: 1, posX: 0, posY: 0, type: SeatType.Standard, priceZoneId }] }),
  },
  { method: 'get', path: ({ cinemaId }) => `/cinemas/${cinemaId}/time-bands`, permission: Permission.ManageHalls, isCinemaScoped: true },
  { method: 'put', path: ({ cinemaId }) => `/cinemas/${cinemaId}/time-bands`, permission: Permission.ManageHalls, isCinemaScoped: true },
  { method: 'get', path: () => '/films', permission: Permission.ManageFilms, isCinemaScoped: false },
  { method: 'post', path: () => '/films', permission: Permission.ManageFilms, isCinemaScoped: false },
  { method: 'patch', path: ({ filmId }) => `/films/${filmId}`, permission: Permission.ManageFilms, isCinemaScoped: false },
  { method: 'delete', path: ({ filmId }) => `/films/${filmId}`, permission: Permission.ManageFilms, isCinemaScoped: false },
  { method: 'put', path: ({ filmId }) => `/films/${filmId}/poster`, permission: Permission.ManageFilms, isCinemaScoped: false },
  {
    method: 'get',
    path: ({ cinemaId }) => `/cinemas/${cinemaId}/sessions?date=${SESSION_DATE}`,
    permission: Permission.ManageSchedule,
    isCinemaScoped: true,
  },
  { method: 'post', path: ({ cinemaId }) => `/cinemas/${cinemaId}/sessions`, permission: Permission.ManageSchedule, isCinemaScoped: true },
  { method: 'delete', path: ({ sessionId }) => `/sessions/${sessionId}`, permission: Permission.ManageSchedule, isCinemaScoped: true },
];

const describeEndpoint = ({ method, path, permission }: IEndpoint) =>
  `${method.toUpperCase()} ${path({ cinemaId: ':cinemaId', hallId: ':id', priceZoneId: ':id', sessionId: ':id', staffId: ':id', filmId: ':id' })} (${permission})`;

const ROLE_CASES = Object.values(StaffRole).flatMap((role) =>
  ENDPOINTS.map((endpoint) => ({ role, endpoint, name: describeEndpoint(endpoint), allowed: PERMISSION_MATRIX[endpoint.permission].includes(role) })),
);

const FOREIGN_CASES = ENDPOINTS.filter(({ isCinemaScoped }) => isCinemaScoped).flatMap((endpoint) =>
  PERMISSION_MATRIX[endpoint.permission]
    .filter((role) => role !== StaffRole.SuperAdmin)
    .map((role) => ({ role, endpoint, name: describeEndpoint(endpoint) })),
);

const ENDPOINT_CASES = ENDPOINTS.map((endpoint) => ({ endpoint, name: describeEndpoint(endpoint) }));

describe('Endpoint access', () => {
  let app: INestApplication;
  let own: ICinemaFixture;
  let foreign: ICinemaFixture;
  const agents = new Map<StaffRole, StaffAgent>();

  const send = (agent: StaffAgent, { method, path, body }: IEndpoint, fixture: ICinemaFixture) =>
    agent[method](`/${API_PREFIX}${path(fixture)}`).send(body?.(fixture) ?? {});

  const createCinemaFixture = async (superAdmin: StaffAgent, filmId: string): Promise<ICinemaFixture> => {
    const cinemaId = await createCinema(app);
    const { hallId, priceZoneId } = await createHallWithLayout(superAdmin, cinemaId);
    const { body: session } = await superAdmin
      .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
      .send({ filmId, hallId, date: SESSION_DATE, time: SESSION_TIME, format: SessionFormat.TwoD })
      .expect(201);
    const { id: staffId } = await createStaff(app, { role: StaffRole.Controller, cinemaIds: [cinemaId] });

    return { cinemaId, hallId, priceZoneId, sessionId: session.id, staffId, filmId };
  };

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    const superAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.SuperAdmin }));
    const filmId = await createFilm(superAdmin);
    own = await createCinemaFixture(superAdmin, filmId);
    foreign = await createCinemaFixture(superAdmin, filmId);

    agents.set(StaffRole.SuperAdmin, superAdmin);
    for (const role of Object.values(StaffRole).filter((staffRole) => staffRole !== StaffRole.SuperAdmin)) {
      agents.set(role, await loginAs(app, await createStaff(app, { role, cinemaIds: [own.cinemaId] })));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(ENDPOINT_CASES)('requires a session for $name', async ({ endpoint }) => {
    await send(request(app.getHttpServer()), endpoint, own).expect(401);
  });

  it.each(ENDPOINT_CASES)('requires a changed temporary password for $name', async ({ endpoint }) => {
    const agent = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [own.cinemaId], mustChangePassword: true }));

    const response = await send(agent, endpoint, own).expect(403);

    expect(response.body.message).toBe(AUTH_MESSAGES.passwordChangeRequired);
  });

  it.each(ROLE_CASES)('$role → $name: allowed = $allowed', async ({ role, endpoint, allowed }) => {
    const response = await send(agents.get(role)!, endpoint, own);

    if (allowed) {
      expect(DENIED_STATUSES).not.toContain(response.status);
    } else {
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(AUTH_MESSAGES.permissionDenied);
    }
  });

  it.each(FOREIGN_CASES)('keeps $role out of another cinema: $name', async ({ role, endpoint }) => {
    const response = await send(agents.get(role)!, endpoint, foreign).expect(403);

    expect(response.body.message).toBe(endpoint.foreignDenial ?? AUTH_MESSAGES.cinemaAccessDenied);
  });

  it.each(ENDPOINT_CASES.filter(({ endpoint }) => endpoint.isCinemaScoped))('lets a super admin into any cinema: $name', async ({ endpoint }) => {
    const response = await send(agents.get(StaffRole.SuperAdmin)!, endpoint, foreign);

    expect(DENIED_STATUSES).not.toContain(response.status);
  });
});
