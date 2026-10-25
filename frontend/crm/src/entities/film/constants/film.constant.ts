import type { BadgeTone } from "@/shared/ui";

export const AGE_RATINGS = ["0+", "6+", "12+", "16+", "18+"] as const;

export type AgeRating = (typeof AGE_RATINGS)[number];

export const FILM_STATUSES = {
  announced: "ANNOUNCED",
  inRelease: "IN_RELEASE",
  archived: "ARCHIVED",
} as const;

export type FilmStatus = (typeof FILM_STATUSES)[keyof typeof FILM_STATUSES];

export const FILM_STATUS_LABELS: Record<FilmStatus, string> = {
  ANNOUNCED: "Скоро в прокате",
  IN_RELEASE: "В прокате",
  ARCHIVED: "Снят с проката",
};

export const FILM_STATUS_TONES: Record<FilmStatus, BadgeTone> = {
  ANNOUNCED: "warning",
  IN_RELEASE: "success",
  ARCHIVED: "neutral",
};

export const FILM_TEXT = {
  premiere: "Премьера",
  minutes: "мин",
  noPoster: "Нет постера",
  empty: "В каталоге пока нет фильмов",
} as const;

export const MEDIA_PATH = "/api/media";
