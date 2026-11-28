import type { IFilm } from "@luch/shared/film";
import { FILM_TEXT } from "@/entities/film/constants/film.constant";

export const describeFilm = ({ genre, durationMinutes, ageRating }: IFilm): string => `${genre} · ${durationMinutes} ${FILM_TEXT.minutes} · ${ageRating}`;
