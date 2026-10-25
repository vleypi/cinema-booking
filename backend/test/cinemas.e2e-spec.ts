import type { INestApplication } from '@nestjs/common';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const CINEMAS_URL = `/${API_PREFIX}/cinemas`;
const UNKNOWN_ID = '999999999';

let sequence = 0;
const cinemaBody = () => ({
  name: 'Луч на Арбате',
  slug: `luch-arbat-${Date.now()}-${++sequence}`,
  address: 'Москва, Арбат, 1',
  timezone: 'Europe/Moscow',
  opensAt: '10:00',
  closesAt: '02:00',
  cleaningBreakMinutes: 20,
  isPublished: true,
});

describe('Cinemas', () => {
  let app: INestApplication;
  let superAdmin: StaffAgent;

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();
    superAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.SuperAdmin }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets a super admin create a cinema and see it in the list', async () => {
    const body = cinemaBody();

    const { body: created } = await superAdmin.post(CINEMAS_URL).send(body).expect(201);
    const { body: cinemas } = await superAdmin.get(CINEMAS_URL).expect(200);

    expect(created).toMatchObject({ ...body, id: expect.any(String) });
    expect(cinemas.items).toContainEqual(expect.objectContaining({ id: created.id, slug: body.slug }));
  });

  it('hides a cinema from the site without deleting it', async () => {
    const { body: created } = await superAdmin.post(CINEMAS_URL).send(cinemaBody()).expect(201);

    const { body: updated } = await superAdmin.patch(`${CINEMAS_URL}/${created.id}`).send({ isPublished: false }).expect(200);

    expect(updated).toEqual({ ...created, isPublished: false, updatedAt: expect.any(String) });
  });

  it('rejects a slug that another cinema already uses', async () => {
    const body = cinemaBody();
    await superAdmin.post(CINEMAS_URL).send(body).expect(201);
    const { body: other } = await superAdmin.post(CINEMAS_URL).send(cinemaBody()).expect(201);

    const created = await superAdmin.post(CINEMAS_URL).send({ ...cinemaBody(), slug: body.slug }).expect(409);
    const updated = await superAdmin.patch(`${CINEMAS_URL}/${other.id}`).send({ slug: body.slug }).expect(409);

    [created, updated].forEach(({ body }) => expect(body.errors).toEqual({ slug: [CINEMA_MESSAGES.slugTaken] }));
  });

  it('validates the slug, time zone, opening hours and cleaning break', async () => {
    const response = await superAdmin
      .post(CINEMAS_URL)
      .send({ ...cinemaBody(), slug: 'Луч Арбат', timezone: 'Mars/Olympus', opensAt: '25:00', closesAt: '10', cleaningBreakMinutes: -1 })
      .expect(400);

    expect(Object.keys(response.body.errors).sort()).toEqual(['cleaningBreakMinutes', 'closesAt', 'opensAt', 'slug', 'timezone']);
    expect(response.body.errors.slug).toContain(CINEMA_MESSAGES.slugFormat);
  });

  it('rejects null for a required field instead of failing in the database', async () => {
    const { body: created } = await superAdmin.post(CINEMAS_URL).send(cinemaBody()).expect(201);

    const response = await superAdmin.patch(`${CINEMAS_URL}/${created.id}`).send({ name: null, isPublished: null }).expect(400);

    expect(Object.keys(response.body.errors).sort()).toEqual(['isPublished', 'name']);
  });

  it.each([UNKNOWN_ID, 'abc'])('answers 404 for the cinema id %s', async (cinemaId) => {
    const response = await superAdmin.patch(`${CINEMAS_URL}/${cinemaId}`).send({ isPublished: false }).expect(404);

    expect(response.body.message).toBe(CINEMA_MESSAGES.notFound);
  });

  it('keeps cinema management to the super admin', async () => {
    const cinemaId = await createCinema(app);
    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));

    await admin.get(CINEMAS_URL).expect(403);
    await admin.post(CINEMAS_URL).send(cinemaBody()).expect(403);
    await admin.patch(`${CINEMAS_URL}/${cinemaId}`).send({ isPublished: false }).expect(403);
  });
  describe('list', () => {
    const createNamed = async (name: string, timezone = 'Europe/Moscow') =>
      (await superAdmin.post(CINEMAS_URL).send({ ...cinemaBody(), name, timezone }).expect(201)).body;

    it('finds cinemas by part of the name, address or code ignoring case', async () => {
      const token = `poisk${Date.now()}`;
      const byName = await createNamed(`Луч ${token}`);
      const byAddress = (await superAdmin.post(CINEMAS_URL).send({ ...cinemaBody(), address: `Казань, ${token}` }).expect(201)).body;
      const bySlug = (await superAdmin.post(CINEMAS_URL).send({ ...cinemaBody(), slug: `${token}-slug` }).expect(201)).body;

      const { body } = await superAdmin.get(CINEMAS_URL).query({ search: token.toUpperCase() }).expect(200);

      expect(body.total).toBe(3);
      expect(new Set(body.items.map(({ id }: { id: string }) => id))).toEqual(new Set([byName.id, byAddress.id, bySlug.id]));
    });

    it('treats percent and underscore in the search as plain text', async () => {
      const { body } = await superAdmin.get(CINEMAS_URL).query({ search: '%_' }).expect(200);

      expect(body).toEqual({ items: [], total: 0 });
    });

    it('sorts by the requested field and pages through the result', async () => {
      const token = `sort${Date.now()}`;
      await createNamed(`${token} Б`, 'Europe/Moscow');
      await createNamed(`${token} А`, 'Asia/Yekaterinburg');
      await createNamed(`${token} В`, 'Europe/Kaliningrad');

      const { body: firstPage } = await superAdmin.get(CINEMAS_URL).query({ search: token, sort: 'timezone', order: 'desc', pageSize: 2 }).expect(200);
      const { body: secondPage } = await superAdmin.get(CINEMAS_URL).query({ search: token, sort: 'timezone', order: 'desc', pageSize: 2, page: 2 }).expect(200);

      expect(firstPage.total).toBe(3);
      expect(firstPage.items.map(({ timezone }: { timezone: string }) => timezone)).toEqual(['Europe/Moscow', 'Europe/Kaliningrad']);
      expect(secondPage.items.map(({ timezone }: { timezone: string }) => timezone)).toEqual(['Asia/Yekaterinburg']);
    });

    it('rejects an unknown sort field and a too large page size', async () => {
      const { body } = await superAdmin.get(CINEMAS_URL).query({ sort: 'address', pageSize: 1000 }).expect(400);

      expect(Object.keys(body.errors).sort()).toEqual(['pageSize', 'sort']);
    });
  });
});
