import type { AgeRating, FilmStatus } from "@/entities/film/constants/film.constant";

export interface IFilmPayload {
  title: string;
  description: string;
  genre: string;
  ageRating: AgeRating;
  durationMinutes: number;
  releaseDate: string;
  isPremiere: boolean;
  trailerUrl: string | null;
  status: FilmStatus;
}

export interface IFilm extends IFilmPayload {
  id: string;
  posterFileId: string | null;
}
