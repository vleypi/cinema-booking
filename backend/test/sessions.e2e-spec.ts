import type { INestApplication } from '@nestjs/common';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { SESSION_MESSAGES } from '@/modules/sessions/sessions.constant.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createFilm, FILMS_URL } from '@test/support/film.fixture.js';
import { buildUseCaseSeats, cinemaHallsUrl, createHallWithLayout, HALL_BODY, HALLS_URL, ROWS } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const SESSIONS_URL = `/${API_PREFIX}/sessions`;
const cinemaSessionsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/sessions`;
const DATE = '2030-03-15';
const NEXT_DATE = '2030-03-16';

describe('Sessions', () => {
  let app: INestApplication;
  let cinemaId: string;
  let admin: StaffAgent;
  let manager: StaffAgent;
  let filmId: string;

  const schedule = (hallId: string, date: string, time: string, overrides: Record<string, unknown> = {}) =>
    manager.post(cinemaSessionsUrl(cinemaId)).send({ filmId, hallId, date, time, format: SessionFormat.TwoD, ...overrides });

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    filmId = await createFilm(manager);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('schedules a session in the local time of the cinema with the current layout', async () => {
      const { hallId, layoutId } = await createHallWithLayout(admin, cinemaId);

      const { body } = await schedule(hallId, DATE, '19:45', { format: SessionFormat.ThreeD, basePriceOverride: 60000 }).expect(201);

      expect(body).toMatchObject({
        filmId,
        hallId,
        layoutId,
        startsAt: '2030-03-15T16:45:00.000Z',
        endsAt: '2030-03-15T18:45:00.000Z',
        format: SessionFormat.ThreeD,
        basePriceOverride: 60000,
        status: SessionStatus.Scheduled,
        film: expect.objectContaining({ id: filmId }),
      });
    });

    it('keeps the cleaning break between sessions and names the conflicting one', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      await schedule(hallId, DATE, '19:45').expect(201);

      const tooEarly = await schedule(hallId, DATE, '21:50').expect(400);
      const overlapping = await schedule(hallId, DATE, '18:00').expect(400);
      await schedule(hallId, DATE, '22:00').expect(201);
      await schedule(hallId, DATE, '17:30').expect(201);

      const busy = SESSION_MESSAGES.hallBusy('Мастер и Маргарита', '19:45', '21:45', 15);
      expect(tooEarly.body.errors).toEqual({ time: [busy] });
      expect(overlapping.body.errors).toEqual({ time: [busy] });
    });

    it('lets different halls show sessions at the same time', async () => {
      const [first, second] = [await createHallWithLayout(admin, cinemaId), await createHallWithLayout(admin, cinemaId)];

      await schedule(first.hallId, DATE, '15:00').expect(201);
      await schedule(second.hallId, DATE, '15:00').expect(201);
    });

    it.each([
      ['before opening', '09:00'],
      ['ending after closing', '01:00'],
    ])('rejects a session %s', async (_, time) => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);

      const response = await schedule(hallId, NEXT_DATE, time).expect(400);

      expect(response.body.errors).toEqual({ time: [SESSION_MESSAGES.outsideOpeningHours('10:00', '02:00')] });
    });

    it('accepts a late session that ends exactly at closing time', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);

      await schedule(hallId, NEXT_DATE, '00:00').expect(201);
    });

    it('rejects a session in the past', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);

      const response = await schedule(hallId, '2020-03-15', '12:00').expect(400);

      expect(response.body.errors).toEqual({ time: [SESSION_MESSAGES.inPast] });
    });

    it('rejects a film taken out of release', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      const archivedFilmId = await createFilm(manager);
      await manager.patch(`${FILMS_URL}/${archivedFilmId}`).send({ status: FilmStatus.Archived }).expect(200);

      const response = await schedule(hallId, DATE, '12:00', { filmId: archivedFilmId }).expect(400);

      expect(response.body.errors).toEqual({ filmId: [SESSION_MESSAGES.filmUnavailable] });
    });

    it('rejects a hall that is closed, has no layout or belongs to another cinema', async () => {
      const closed = await createHallWithLayout(admin, cinemaId);
      await admin.patch(`${HALLS_URL}/${closed.hallId}`).send({ isActive: false }).expect(200);
      const { body: withoutLayout } = await admin.post(cinemaHallsUrl(cinemaId)).send(HALL_BODY).expect(201);
      const otherCinemaId = await createCinema(app);
      const otherAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [otherCinemaId] }));
      const foreign = await createHallWithLayout(otherAdmin, otherCinemaId);

      const responses = await Promise.all([
        schedule(closed.hallId, DATE, '12:00'),
        schedule(withoutLayout.id, DATE, '12:00'),
        schedule(foreign.hallId, DATE, '12:00'),
      ]);

      expect(responses.map(({ status, body }) => [status, body.errors.hallId])).toEqual([
        [400, [SESSION_MESSAGES.hallUnavailable]],
        [400, [SESSION_MESSAGES.hallWithoutLayout]],
        [400, [SESSION_MESSAGES.hallUnavailable]],
      ]);
    });

    it('keeps old sessions on their layout after the hall gets a new one', async () => {
      const { hallId, layoutId, priceZoneId } = await createHallWithLayout(admin, cinemaId);
      const { body: before } = await schedule(hallId, DATE, '12:00').expect(201);

      const { body: newLayout } = await admin.post(`${HALLS_URL}/${hallId}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(priceZoneId) }).expect(201);
      const { body: after } = await schedule(hallId, DATE, '16:00').expect(201);

      expect(before.layoutId).toBe(layoutId);
      expect(after.layoutId).toBe(newLayout.id);
    });

    it('validates the request', async () => {
      const response = await manager
        .post(cinemaSessionsUrl(cinemaId))
        .send({ filmId: 'abc', hallId: '', date: '15.03.2030', time: '7:45', format: 'IMAX', basePriceOverride: -1 })
        .expect(400);

      expect(Object.keys(response.body.errors).sort()).toEqual(['basePriceOverride', 'date', 'filmId', 'format', 'hallId', 'time']);
    });
  });

  describe('list', () => {
    it('shows the sessions that start on the given local day', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      const { body: evening } = await schedule(hallId, DATE, '21:00').expect(201);
      const { body: night } = await schedule(hallId, NEXT_DATE, '00:00').expect(201);

      const { body: today } = await manager.get(cinemaSessionsUrl(cinemaId)).query({ date: DATE }).expect(200);
      const { body: tomorrow } = await manager.get(cinemaSessionsUrl(cinemaId)).query({ date: NEXT_DATE }).expect(200);

      expect(today.map(({ id }: { id: string }) => id)).toContain(evening.id);
      expect(today.map(({ id }: { id: string }) => id)).not.toContain(night.id);
      expect(tomorrow.map(({ id }: { id: string }) => id)).toContain(night.id);
    });

    it('requires a valid date', async () => {
      const response = await manager.get(cinemaSessionsUrl(cinemaId)).query({ date: 'завтра' }).expect(400);

      expect(Object.keys(response.body.errors)).toEqual(['date']);
    });
  });

  describe('access', () => {
    it('lets a manager delete a session and frees the time', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      const { body } = await schedule(hallId, DATE, '12:00').expect(201);

      await manager.delete(`${SESSIONS_URL}/${body.id}`).expect(204);

      await schedule(hallId, DATE, '12:00').expect(201);
    });

    it('keeps the schedule of another cinema and cashiers out', async () => {
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      const { body } = await schedule(hallId, DATE, '12:00').expect(201);
      const foreignManager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [await createCinema(app)] }));
      const cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));

      const deleted = await foreignManager.delete(`${SESSIONS_URL}/${body.id}`).expect(403);
      await foreignManager.get(cinemaSessionsUrl(cinemaId)).query({ date: DATE }).expect(403);
      await cashier.post(cinemaSessionsUrl(cinemaId)).send({ filmId, hallId, date: DATE, time: '18:00', format: SessionFormat.TwoD }).expect(403);

      expect(deleted.body.message).toBe(AUTH_MESSAGES.cinemaAccessDenied);
    });
  });
});
