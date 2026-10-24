import type { INestApplication } from '@nestjs/common';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { TIME_BAND_MESSAGES } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const timeBandsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/time-bands`;

const pickBand = ({ name, startsAt, endsAt, multiplier }: Record<string, unknown>) => ({ name, startsAt, endsAt, multiplier });

describe('Time bands', () => {
  let app: INestApplication;
  let cinemaId: string;
  let admin: StaffAgent;
  let superAdmin: StaffAgent;

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    superAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.SuperAdmin }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('gives a new cinema the starting bands from BR-03', async () => {
    const { body: cinema } = await superAdmin
      .post(`/${API_PREFIX}/cinemas`)
      .send({ name: 'Луч', slug: `luch-${Date.now()}`, address: 'Москва', timezone: 'Europe/Moscow', opensAt: '10:00', closesAt: '02:00', cleaningBreakMinutes: 15, isPublished: false })
      .expect(201);

    const { body } = await superAdmin.get(timeBandsUrl(cinema.id)).expect(200);

    expect(body.map(pickBand)).toEqual([
      { name: 'Утро', startsAt: '00:00', endsAt: '12:00', multiplier: 0.825 },
      { name: 'День', startsAt: '12:00', endsAt: '17:00', multiplier: 1 },
      { name: 'Вечер', startsAt: '17:00', endsAt: '24:00', multiplier: 1.2 },
    ]);
  });

  it('replaces the bands and closes each one where the next begins', async () => {
    const bands = [
      { name: 'Вечер', startsAt: '18:00', multiplier: 1.3 },
      { name: 'Утро', startsAt: '00:00', multiplier: 0.8 },
    ];

    const { body } = await admin.put(timeBandsUrl(cinemaId)).send({ bands }).expect(200);

    expect(body.map(pickBand)).toEqual([
      { name: 'Утро', startsAt: '00:00', endsAt: '18:00', multiplier: 0.8 },
      { name: 'Вечер', startsAt: '18:00', endsAt: '24:00', multiplier: 1.3 },
    ]);
    expect((await admin.get(timeBandsUrl(cinemaId)).expect(200)).body).toEqual(body);
  });

  it.each([
    ['without a band at midnight', [{ name: 'День', startsAt: '12:00', multiplier: 1 }], TIME_BAND_MESSAGES.dayStartMissing],
    [
      'with two bands starting at the same time',
      [
        { name: 'Утро', startsAt: '00:00', multiplier: 1 },
        { name: 'Ночь', startsAt: '00:00', multiplier: 1 },
      ],
      TIME_BAND_MESSAGES.duplicateStart,
    ],
  ])('rejects bands %s', async (_, bands, message) => {
    const response = await admin.put(timeBandsUrl(cinemaId)).send({ bands }).expect(400);

    expect(response.body.errors).toEqual({ bands: [message] });
  });

  it('validates the time and the multiplier of every band', async () => {
    const response = await admin
      .put(timeBandsUrl(cinemaId))
      .send({ bands: [{ name: 'Утро', startsAt: '0000', multiplier: 0 }] })
      .expect(400);

    expect(Object.keys(response.body.errors).sort()).toEqual(['bands.0.multiplier', 'bands.0.startsAt']);
  });

  it('keeps the bands of another cinema and a manager out of reach', async () => {
    const otherCinemaId = await createCinema(app);
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));

    await admin.get(timeBandsUrl(otherCinemaId)).expect(403);
    await manager.get(timeBandsUrl(cinemaId)).expect(403);
  });

  it('answers 404 to a super admin for an unknown cinema', async () => {
    const response = await superAdmin.put(timeBandsUrl('999999999')).send({ bands: [{ name: 'Весь день', startsAt: '00:00', multiplier: 1 }] }).expect(404);

    expect(response.body.message).toBe(CINEMA_MESSAGES.notFound);
  });
});
