import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { addDays, MINUTE_MS, todayIn } from '@/common/time/zoned-time.js';
import { CATALOG_MESSAGES } from '@/modules/catalog/catalog.constant.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout, HALL_BODY, type IHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const CATALOG_URL = `/${API_PREFIX}/catalog`;
const cinemaFilmsUrl = (cinemaId: string) => `${CATALOG_URL}/cinemas/${cinemaId}/films`;
const cinemaSessionsUrl = (cinemaId: string) => `${CATALOG_URL}/cinemas/${cinemaId}/sessions`;

describe('Catalog', () => {
  let app: INestApplication;
  let manager: StaffAgent;
  let cinemaId: string;
  let hall: IHallWithLayout;
  let filmId: string;
  let otherFilmId: string;
  const tomorrow = addDays(todayIn(DEFAULT_TIMEZONE), 1);

  const guest = () => request(app.getHttpServer());

  const createFilm = async (overrides: Record<string, unknown> = {}): Promise<string> =>
    (await manager.post(FILMS_URL).send({ ...filmBody(), ...overrides }).expect(201)).body.id;

  const schedule = async (date: string, time: string, film = filmId): Promise<string> =>
    (await manager.post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`).send({ filmId: film, hallId: hall.hallId, date, time, format: SessionFormat.TwoD }).expect(201)).body.id;

  const publish = (id: string) => app.get(DataSource).getRepository(Cinema).update({ id }, { isPublished: true });

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    await publish(cinemaId);
    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);
    hall = await createHallWithLayout(admin, cinemaId);

    filmId = await createFilm({ title: 'Мастер и Маргарита' });
    otherFilmId = await createFilm({ title: 'Летучий корабль' });
    await schedule(tomorrow, '12:00');
    await schedule(tomorrow, '19:00');
    await schedule(addDays(tomorrow, 1), '15:00', otherFilmId);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('cinemas', () => {
    it('shows only published cinemas with their address', async () => {
      const hiddenId = await createCinema(app);

      const { body } = await guest().get(`${CATALOG_URL}/cinemas`).expect(200);

      const ids = body.map(({ id }: { id: string }) => id);
      expect(ids).toContain(cinemaId);
      expect(ids).not.toContain(hiddenId);
      expect(body.find(({ id }: { id: string }) => id === cinemaId)).toMatchObject({ address: 'Москва', timezone: DEFAULT_TIMEZONE });
    });

    it('hides the schedule of an unpublished cinema', async () => {
      const hiddenId = await createCinema(app);

      const { body } = await guest().get(cinemaSessionsUrl(hiddenId)).expect(404);

      expect(body.message).toBe(CATALOG_MESSAGES.cinemaNotFound);
    });
  });

  describe('sessions', () => {
    it('shows the sessions of a day with the hall and the cheapest seat price', async () => {
      const { body } = await guest().get(cinemaSessionsUrl(cinemaId)).query({ date: tomorrow }).expect(200);

      expect(body).toEqual([
        expect.objectContaining({ filmId, hall: expect.objectContaining({ id: hall.hallId, name: HALL_BODY.name }), minPrice: 40000 }),
        expect.objectContaining({ filmId, minPrice: 48000 }),
      ]);
    });

    it('shows the next seven days without a date and filters by film', async () => {
      const all = await guest().get(cinemaSessionsUrl(cinemaId)).expect(200);
      const filtered = await guest().get(cinemaSessionsUrl(cinemaId)).query({ filmId: otherFilmId }).expect(200);

      expect(all.body).toHaveLength(3);
      expect(filtered.body).toEqual([expect.objectContaining({ filmId: otherFilmId })]);
    });

    it('does not show days beyond the seven day schedule', async () => {
      const { body } = await guest().get(cinemaSessionsUrl(cinemaId)).query({ date: addDays(tomorrow, 7) }).expect(200);

      expect(body).toEqual([]);
    });

    it('hides a session when online sale closes ten minutes before the start', async () => {
      const startsAt = new Date(Date.now() + 5 * MINUTE_MS);
      const { id } = await app.get(DataSource).getRepository(Session).save({
        filmId,
        hallId: hall.hallId,
        layoutId: hall.layoutId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 120 * MINUTE_MS),
        format: SessionFormat.TwoD,
      });

      const { body } = await guest().get(cinemaSessionsUrl(cinemaId)).expect(200);

      expect(body.map((session: { id: string }) => session.id)).not.toContain(id);
    });
  });

  describe('halls', () => {
    it('shows the current layout and the price of each zone in every time band', async () => {
      const { body } = await request(app.getHttpServer()).get(`${CATALOG_URL}/cinemas/${cinemaId}/halls`).expect(200);

      expect(body.timeBands.map(({ startsAt }: { startsAt: string }) => startsAt)).toEqual(['00:00', '12:00', '17:00']);
      expect(body.halls).toEqual([
        expect.objectContaining({
          id: hall.hallId,
          name: HALL_BODY.name,
          seats: expect.arrayContaining([expect.objectContaining({ row: 1, number: 1, priceZoneId: hall.priceZoneId })]),
          priceZones: [expect.objectContaining({ id: hall.priceZoneId, prices: [33000, 40000, 48000] })],
        }),
      ]);
    });
  });

  describe('films', () => {
    it('shows films with sessions in the cinema and finds them by part of the title', async () => {
      await createFilm({ title: 'Фильм без сеансов' });

      const all = await guest().get(cinemaFilmsUrl(cinemaId)).expect(200);
      const found = await guest().get(cinemaFilmsUrl(cinemaId)).query({ search: 'маргар' }).expect(200);

      expect(all.body.map(({ id }: { id: string }) => id)).toEqual([otherFilmId, filmId]);
      expect(found.body).toEqual([expect.objectContaining({ id: filmId, title: 'Мастер и Маргарита' })]);
    });

    it('opens the page of a film but not of an archived one', async () => {
      const archivedId = await createFilm({ status: FilmStatus.Archived });

      await guest().get(`${CATALOG_URL}/films/${filmId}`).expect(200);
      const { body } = await guest().get(`${CATALOG_URL}/films/${archivedId}`).expect(404);

      expect(body.message).toBe(CATALOG_MESSAGES.filmNotFound);
    });

    it('shows future premieres without sessions as coming soon', async () => {
      const futureRelease = addDays(tomorrow, 30);
      const comingId = await createFilm({ status: FilmStatus.Announced, releaseDate: futureRelease });
      const scheduledId = await createFilm({ status: FilmStatus.Announced, releaseDate: futureRelease });
      await schedule(addDays(tomorrow, 2), '12:00', scheduledId);

      const { body } = await guest().get(`${CATALOG_URL}/films/coming-soon`).expect(200);

      const ids = body.map(({ id }: { id: string }) => id);
      expect(ids).toContain(comingId);
      expect(ids).not.toContain(scheduledId);
      expect(ids).not.toContain(filmId);
    });
  });
});
