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
    expect(cinemas).toContainEqual(expect.objectContaining({ id: created.id, slug: body.slug }));
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
});
