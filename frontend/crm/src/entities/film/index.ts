export { FilmCard } from "@/entities/film/components/FilmCard";
export { FilmPoster } from "@/entities/film/components/FilmPoster";
export {
  AGE_RATINGS,
  type AgeRating,
  FILM_SORT_FIELDS,
  FILM_STATUS_LABELS,
  FILM_STATUSES,
  FILM_TEXT,
  type FilmSortField,
  type FilmStatus,
} from "@/entities/film/constants/film.constant";
export { useFilms } from "@/entities/film/hooks/useFilms";
export { useSchedulableFilms } from "@/entities/film/hooks/useSchedulableFilms";
export type { IFilm, IFilmPayload } from "@/entities/film/interfaces/film.interface";
export { filmService } from "@/entities/film/services/film.service";
export { describeFilm, getPosterUrl } from "@/entities/film/utils/film.util";
