import { SORT_ORDERS } from "@/shared/config";
import { toSortValue } from "@/shared/lib";

export const TIME_BAND_SORT_FIELDS = {
  name: "name",
  startsAt: "startsAt",
  multiplier: "multiplier",
} as const;

export type TimeBandSortField = (typeof TIME_BAND_SORT_FIELDS)[keyof typeof TIME_BAND_SORT_FIELDS];

export const TIME_BAND_TEXT = {
  band: "Интервал",
  time: "Время",
  multiplier: "Коэффициент",
  empty: "Интервалов пока нет",
  searchPlaceholder: "Название интервала",
} as const;

export const TIME_BAND_SORT_OPTIONS = [
  { value: "", label: "По времени начала" },
  { value: toSortValue(TIME_BAND_SORT_FIELDS.name, SORT_ORDERS.asc), label: "По названию" },
  { value: toSortValue(TIME_BAND_SORT_FIELDS.multiplier, SORT_ORDERS.asc), label: "Сначала дешевле" },
  { value: toSortValue(TIME_BAND_SORT_FIELDS.multiplier, SORT_ORDERS.desc), label: "Сначала дороже" },
];
