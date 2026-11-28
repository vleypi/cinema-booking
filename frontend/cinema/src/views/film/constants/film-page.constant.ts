export const FILM_PAGE_TEXT = {
  back: "Афиша",
  loading: "Загружаем фильм…",
  notFound: "Фильм не найден или снят с проката.",
  trailer: "Смотреть трейлер",
  sessionsTitle: (cinema: string) => `Сеансы в «${cinema}»`,
  noSessions: "В ближайшие семь дней сеансов этого фильма нет.",
} as const;

export const FILM_PAGE_POSTER_SIZES = "(min-width: 56.25rem) 20rem, 18rem";
