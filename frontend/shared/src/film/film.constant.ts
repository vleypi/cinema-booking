export const AGE_RATINGS = ["0+", "6+", "12+", "16+", "18+"] as const;

export type AgeRating = (typeof AGE_RATINGS)[number];

export const FILM_STATUSES = {
  announced: "ANNOUNCED",
  inRelease: "IN_RELEASE",
  archived: "ARCHIVED",
} as const;

export type FilmStatus = (typeof FILM_STATUSES)[keyof typeof FILM_STATUSES];

export const MEDIA_PATH = "/api/media";
