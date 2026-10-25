export const CINEMA_SORT_FIELDS = {
  name: "name",
  timezone: "timezone",
} as const;

export type CinemaSortField = (typeof CINEMA_SORT_FIELDS)[keyof typeof CINEMA_SORT_FIELDS];

export const CINEMA_TEXT = {
  name: "Кинотеатр",
  address: "Адрес",
  hours: "Часы работы",
  timezone: "Часовой пояс",
  status: "На сайте",
  published: "Опубликован",
  hidden: "Скрыт",
  empty: "Кинотеатров пока нет",
  searchPlaceholder: "Название, адрес или код",
} as const;
