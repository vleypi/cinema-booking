import type { INestApplication } from '@nestjs/common';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { Permission } from '@/modules/auth/permissions.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { ACCESS_PROBE_CONTROLLERS, CINEMA_PROBE_PATH, PERMISSION_PROBE_PATH } from '@test/support/access-probe.controllers.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const { SuperAdmin, Admin, Manager, Cashier, Controller } = StaffRole;

const PERMISSION_MATRIX: Record<Permission, StaffRole[]> = {
  [Permission.ManageCinemas]: [SuperAdmin],
  [Permission.ManageAdmins]: [SuperAdmin],
  [Permission.ManageStaff]: [SuperAdmin, Admin],
  [Permission.ManageHalls]: [SuperAdmin, Admin],
  [Permission.ManageFilms]: [SuperAdmin, Admin, Manager],
  [Permission.ManageSchedule]: [SuperAdmin, Admin, Manager],
  [Permission.CancelSessions]: [SuperAdmin, Admin, Manager],
  [Permission.SellTickets]: [SuperAdmin, Admin, Manager, Cashier],
  [Permission.RefundTickets]: [SuperAdmin, Admin, Manager, Cashier],
  [Permission.SearchOrders]: [SuperAdmin, Admin, Manager, Cashier, Controller],
  [Permission.ScanTickets]: [SuperAdmin, Admin, Manager, Cashier, Controller],
  [Permission.ViewReports]: [SuperAdmin, Admin, Manager],
  [Permission.ViewAuditLog]: [SuperAdmin, Admin],
};

const MATRIX_CASES = Object.values(StaffRole).flatMap((role) =>
  Object.values(Permission).map((permission) => ({ role, permission, allowed: PERMISSION_MATRIX[permission].includes(role) })),
);

describe('Access control', () => {
  let app: INestApplication;
  let ownCinemaId: string;
  let otherCinemaId: string;
  const agents = new Map<StaffRole, StaffAgent>();

  beforeAll(async () => {
    app = await createTestApp(ACCESS_PROBE_CONTROLLERS);
    await app.get(RedisClient).flushdb();

    ownCinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);

    for (const role of Object.values(StaffRole)) {
      agents.set(role, await loginAs(app, await createStaff(app, { role, cinemaIds: [ownCinemaId] })));
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(MATRIX_CASES)('$role → $permission: allowed = $allowed', async ({ role, permission, allowed }) => {
    const response = await agents.get(role)!.get(`/${API_PREFIX}/${PERMISSION_PROBE_PATH}/${permission}`);

    expect(response.status).toBe(allowed ? 200 : 403);
    if (!allowed) expect(response.body.message).toBe(AUTH_MESSAGES.permissionDenied);
  });

  it('lets staff reach their own cinema', async () => {
    await agents.get(Cashier)!.get(`/${API_PREFIX}/${CINEMA_PROBE_PATH}/${ownCinemaId}`).expect(200);
  });

  it.each(Object.values(StaffRole).filter((role) => role !== SuperAdmin))("forbids %s to reach another cinema", async (role) => {
    const response = await agents.get(role)!.get(`/${API_PREFIX}/${CINEMA_PROBE_PATH}/${otherCinemaId}`).expect(403);

    expect(response.body.message).toBe(AUTH_MESSAGES.cinemaAccessDenied);
  });

  it('lets a super admin reach any cinema', async () => {
    await agents.get(SuperAdmin)!.get(`/${API_PREFIX}/${CINEMA_PROBE_PATH}/${otherCinemaId}`).expect(200);
  });
});
