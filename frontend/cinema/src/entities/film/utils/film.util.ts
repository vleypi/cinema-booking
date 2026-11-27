import type { IFilm } from "@luch/shared/film";
import { MINUTES_PER_HOUR } from "@luch/shared/lib";
import { FILM_TEXT } from "@/entities/film/constants/film.constant";

const RELEASE_DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", day: "numeric", month: "long" });

export const formatDuration = (durationMinutes: number): string =>
  FILM_TEXT.duration(Math.floor(durationMinutes / MINUTES_PER_HOUR), String(durationMinutes % MINUTES_PER_HOUR).padStart(2, "0"));

export const formatReleaseDate = (releaseDate: string): string => RELEASE_DATE_FORMAT.format(new Date(releaseDate));

export const describeFilm = ({ genre, ageRating, durationMinutes }: IFilm): string => [genre, ageRating, formatDuration(durationMinutes)].join(" · ");
