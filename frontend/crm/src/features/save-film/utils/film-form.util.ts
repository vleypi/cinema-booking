import { FILM_STATUSES, type IFilm, type IFilmPayload } from "@/entities/film";
import type { FilmFormValues } from "@/features/save-film/schemas/film-form.schema";

export const NEW_FILM_VALUES: FilmFormValues = {
  title: "",
  description: "",
  genre: "",
  ageRating: "12+",
  durationMinutes: 120,
  releaseDate: "",
  isPremiere: false,
  trailerUrl: "",
  status: FILM_STATUSES.inRelease,
  poster: null,
};

export const toFilmFormValues = ({ title, description, genre, ageRating, durationMinutes, releaseDate, isPremiere, trailerUrl, status }: IFilm): FilmFormValues => ({
  title,
  description,
  genre,
  ageRating,
  durationMinutes,
  releaseDate,
  isPremiere,
  trailerUrl: trailerUrl ?? "",
  status,
  poster: null,
});

export const toFilmPayload = ({ title, description, genre, ageRating, durationMinutes, releaseDate, isPremiere, trailerUrl, status }: FilmFormValues): IFilmPayload => ({
  title,
  description,
  genre,
  ageRating,
  durationMinutes,
  releaseDate,
  isPremiere,
  trailerUrl: trailerUrl || null,
  status,
});
