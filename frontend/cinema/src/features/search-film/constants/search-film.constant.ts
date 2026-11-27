export const SEARCH_FILM_TEXT = {
  label: "Найти фильм",
  placeholder: "Название фильма",
  nothingFound: (query: string) => `По запросу «${query}» фильмов нет. Попробуйте другое название`,
} as const;
