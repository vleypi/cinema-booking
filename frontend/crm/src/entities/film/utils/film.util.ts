import { FILM_TEXT, MEDIA_PATH } from "@/entities/film/constants/film.constant";
import type { IFilm } from "@/entities/film/interfaces/film.interface";

export const getPosterUrl = (posterFileId: string | null): string | null => (posterFileId ? `${MEDIA_PATH}/${posterFileId}` : null);

export const describeFilm = ({ genre, durationMinutes, ageRating }: IFilm): string => `${genre} · ${durationMinutes} ${FILM_TEXT.minutes} · ${ageRating}`;
