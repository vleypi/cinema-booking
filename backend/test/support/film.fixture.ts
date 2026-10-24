import { API_PREFIX } from '@/app.setup.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import type { StaffAgent } from '@test/support/auth.helpers.js';

export const FILMS_URL = `/${API_PREFIX}/films`;
export const FILM_DURATION_MINUTES = 120;

export const PNG_IMAGE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

export const filmBody = () => ({
  title: 'Мастер и Маргарита',
  description: 'Экранизация романа Михаила Булгакова',
  genre: 'Драма',
  ageRating: AgeRating.Eighteen,
  durationMinutes: FILM_DURATION_MINUTES,
  releaseDate: '2026-10-01',
  isPremiere: true,
  trailerUrl: 'https://example.com/trailer',
  status: FilmStatus.InRelease,
});

export const createFilm = async (agent: StaffAgent): Promise<string> => (await agent.post(FILMS_URL).send(filmBody()).expect(201)).body.id;
