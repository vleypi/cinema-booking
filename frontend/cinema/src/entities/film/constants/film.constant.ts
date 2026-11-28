export const CATALOG_FILMS_PATH = "/catalog/films";
export const COMING_SOON_PATH = `${CATALOG_FILMS_PATH}/coming-soon`;
export const cinemaFilmsPath = (cinemaId: string) => `/catalog/cinemas/${cinemaId}/films`;

export const FILM_TEXT = {
  premiere: "Премьера",
  noPoster: "Луч",
  duration: (hours: number, minutes: string) => `${hours} ч ${minutes} мин`,
  releaseFrom: (date: string) => `В прокате с ${date}`,
} as const;
