import { BOOLEAN_FILTER_VALUES, type BooleanFilterValue, SORT_ORDERS } from "@/shared/config";
import { type IListFilter, toSortValue } from "@/shared/lib";

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

export const CINEMA_FILTERS = {
  isPublished: {
    param: "isPublished",
    allLabel: "Все кинотеатры",
    options: [
      { value: BOOLEAN_FILTER_VALUES.yes, label: "Опубликованные" },
      { value: BOOLEAN_FILTER_VALUES.no, label: "Скрытые" },
    ],
  } satisfies IListFilter<BooleanFilterValue>,
};

export const CINEMA_SORT_OPTIONS = [
  { value: "", label: "По названию, А–Я" },
  { value: toSortValue(CINEMA_SORT_FIELDS.name, SORT_ORDERS.desc), label: "По названию, Я–А" },
  { value: toSortValue(CINEMA_SORT_FIELDS.timezone, SORT_ORDERS.asc), label: "По часовому поясу" },
];
