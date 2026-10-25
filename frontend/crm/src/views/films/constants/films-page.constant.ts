export const FILMS_PAGE_TEXT = {
  title: "Фильмы",
  description: "Каталог фильмов сети. Фильм с сеансами можно только снять с проката",
  add: "Добавить фильм",
  createTitle: "Новый фильм",
  editTitle: "Фильм",
} as const;

export const FILMS_PAGE_SIZE = 24;

export const SORT_VALUE_SEPARATOR = ":";

export const FILM_SORT_OPTIONS = [
  { value: "", label: "Сначала новые" },
  { value: "title:asc", label: "По названию, А–Я" },
  { value: "title:desc", label: "По названию, Я–А" },
  { value: "releaseDate:asc", label: "Сначала старые" },
  { value: "status:asc", label: "По статусу" },
] as const;

export const FILM_SORT_LABEL = "Сортировка";
