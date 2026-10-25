export const LIST_PARAMS = {
  search: "search",
  sort: "sort",
  order: "order",
  page: "page",
} as const;

export const SORT_ORDERS = {
  asc: "asc",
  desc: "desc",
} as const;

export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

export const FIRST_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const SEARCH_DEBOUNCE_MS = 300;

export const LIST_TEXT = {
  searchPlaceholder: "Поиск",
  clearSearch: "Очистить поиск",
  found: "Найдено",
  notFound: "Ничего не найдено. Измените запрос или очистите поиск",
  shown: "Показано",
  of: "из",
  previousPage: "Предыдущая страница",
  nextPage: "Следующая страница",
  pagination: "Страницы",
} as const;
