import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { FILM_MESSAGES, POSTER_FIELD, POSTER_MAX_BYTES } from '@/modules/films/films.constant.js';
import { MEDIA_CACHE_CONTROL } from '@/modules/media/media.constant.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { createFilm, filmBody, FILMS_URL, PNG_IMAGE } from '@test/support/film.fixture.js';
import { createHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const MEDIA_URL = `/${API_PREFIX}/media`;
const posterUrl = (filmId: string) => `${FILMS_URL}/${filmId}/poster`;

describe('Films', () => {
  let app: INestApplication;
  let cinemaId: string;
  let admin: StaffAgent;
  let manager: StaffAgent;

  const uploadPoster = (filmId: string, content: Buffer, contentType = 'image/png') =>
    manager.put(posterUrl(filmId)).attach(POSTER_FIELD, content, { filename: 'poster.png', contentType });
  const downloadMedia = (id: string) => request(app.getHttpServer()).get(`${MEDIA_URL}/${id}`);

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('catalog', () => {
    it('lets a manager add a film and see it in the catalog', async () => {
      const body = filmBody();

      const { body: created } = await manager.post(FILMS_URL).send(body).expect(201);
      const { body: films } = await manager.get(FILMS_URL).expect(200);

      expect(created).toMatchObject({ ...body, id: expect.any(String), posterFileId: null });
      expect(films).toContainEqual(expect.objectContaining({ id: created.id }));
    });

    it('takes a film out of release and clears its trailer', async () => {
      const filmId = await createFilm(manager);

      const { body } = await manager.patch(`${FILMS_URL}/${filmId}`).send({ status: FilmStatus.Archived, trailerUrl: null }).expect(200);

      expect(body).toMatchObject({ status: FilmStatus.Archived, trailerUrl: null, title: filmBody().title });
    });

    it('validates the film', async () => {
      const response = await manager
        .post(FILMS_URL)
        .send({ ...filmBody(), ageRating: '21+', durationMinutes: 0, releaseDate: '2026-13-01', trailerUrl: 'ftp://example.com', status: 'SOON' })
        .expect(400);

      expect(Object.keys(response.body.errors).sort()).toEqual(['ageRating', 'durationMinutes', 'releaseDate', 'status', 'trailerUrl']);
      await manager.patch(`${FILMS_URL}/${await createFilm(manager)}`).send({ title: null }).expect(400);
    });

    it('keeps the catalog away from a cashier', async () => {
      const cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));

      await cashier.get(FILMS_URL).expect(403);
      await cashier.post(FILMS_URL).send(filmBody()).expect(403);
    });
  });

  describe('poster', () => {
    it('uploads a poster that anyone can download and replaces the previous one', async () => {
      const filmId = await createFilm(manager);

      const { body: first } = await uploadPoster(filmId, PNG_IMAGE).expect(200);
      const download = await downloadMedia(first.posterFileId).expect(200);
      const { body: second } = await uploadPoster(filmId, PNG_IMAGE).expect(200);

      expect(download.headers['content-type']).toBe('image/png');
      expect(download.headers['cache-control']).toBe(MEDIA_CACHE_CONTROL);
      expect(Buffer.compare(download.body as Buffer, PNG_IMAGE)).toBe(0);
      expect(second.posterFileId).not.toBe(first.posterFileId);
      await downloadMedia(first.posterFileId).expect(404);
    });

    it('rejects a file that only pretends to be an image', async () => {
      const filmId = await createFilm(manager);

      const response = await uploadPoster(filmId, Buffer.from('<script>alert(1)</script>')).expect(400);
      await manager.put(posterUrl(filmId)).expect(400);

      expect(response.body.errors).toEqual({ [POSTER_FIELD]: [FILM_MESSAGES.invalidPoster] });
    });

    it('rejects a poster larger than 5 MB', async () => {
      const filmId = await createFilm(manager);

      await uploadPoster(filmId, Buffer.concat([PNG_IMAGE, Buffer.alloc(POSTER_MAX_BYTES)])).expect(413);
    });
  });

  describe('removal', () => {
    it('deletes a film without sessions together with its poster', async () => {
      const filmId = await createFilm(manager);
      const { body } = await uploadPoster(filmId, PNG_IMAGE).expect(200);

      await manager.delete(`${FILMS_URL}/${filmId}`).expect(204);

      await manager.patch(`${FILMS_URL}/${filmId}`).send({ title: 'Удален' }).expect(404);
      await downloadMedia(body.posterFileId).expect(404);
    });

    it('keeps a film with sessions so it can only be taken out of release', async () => {
      const filmId = await createFilm(manager);
      const { hallId } = await createHallWithLayout(admin, cinemaId);
      await manager
        .post(`/${API_PREFIX}/cinemas/${cinemaId}/sessions`)
        .send({ filmId, hallId, date: '2030-03-15', time: '12:00', format: '2D' })
        .expect(201);

      const response = await manager.delete(`${FILMS_URL}/${filmId}`).expect(409);

      expect(response.body.message).toBe(FILM_MESSAGES.hasSessions);
    });
  });
});
