import { BOOLEAN_FILTER_VALUES, type BooleanFilterValue, SORT_ORDERS } from "@/shared/config";
import { type IListFilter, toSortValue } from "@/shared/lib";

export const HALL_SORT_FIELDS = {
  name: "name",
  basePrice: "basePrice",
} as const;

export type HallSortField = (typeof HALL_SORT_FIELDS)[keyof typeof HALL_SORT_FIELDS];

export const SEAT_TYPES = {
  standard: "STANDARD",
  sofa: "SOFA",
  wheelchair: "WHEELCHAIR",
} as const;

export type SeatType = (typeof SEAT_TYPES)[keyof typeof SEAT_TYPES];

export const SEAT_TYPE_LABELS: Record<SeatType, string> = {
  STANDARD: "Кресло",
  SOFA: "Диван на двоих",
  WHEELCHAIR: "Место для коляски",
};

export const SEAT_SHAPE_CLASSES: Record<SeatType, string> = {
  STANDARD: "rounded-md",
  SOFA: "rounded-md border-b-4 border-black/25",
  WHEELCHAIR: "rounded-full",
};

export const PRICE_ZONE_COLORS = [
  "bg-brand text-white",
  "bg-ray text-ink",
  "bg-indigo-500 text-white",
  "bg-rose-500 text-white",
  "bg-violet-500 text-white",
  "bg-sky-500 text-white",
  "bg-orange-500 text-white",
  "bg-pink-400 text-white",
] as const;

export const MISSING_PRICE_ZONE_COLOR = "bg-gray-300 text-white";

export const HALL_TEXT = {
  hall: "Зал",
  basePrice: "Базовая цена",
  priceZones: "Ценовые зоны",
  timeBands: "Временные интервалы",
  timeBandsOn: "Учитываются",
  timeBandsOff: "Фиксированная цена",
  status: "Статус",
  active: "Работает",
  inactive: "Не работает",
  noZones: "Не заданы",
  empty: "В этом кинотеатре пока нет залов",
  searchPlaceholder: "Название или формат",
} as const;

export const HALL_FILTERS = {
  isActive: {
    param: "isActive",
    allLabel: "Любой статус",
    options: [
      { value: BOOLEAN_FILTER_VALUES.yes, label: HALL_TEXT.active },
      { value: BOOLEAN_FILTER_VALUES.no, label: HALL_TEXT.inactive },
    ],
  } satisfies IListFilter<BooleanFilterValue>,
  useTimeBands: {
    param: "useTimeBands",
    allLabel: "Любая цена",
    options: [
      { value: BOOLEAN_FILTER_VALUES.yes, label: "По интервалам" },
      { value: BOOLEAN_FILTER_VALUES.no, label: HALL_TEXT.timeBandsOff },
    ],
  } satisfies IListFilter<BooleanFilterValue>,
};

export const HALL_SORT_OPTIONS = [
  { value: "", label: "По названию, А–Я" },
  { value: toSortValue(HALL_SORT_FIELDS.name, SORT_ORDERS.desc), label: "По названию, Я–А" },
  { value: toSortValue(HALL_SORT_FIELDS.basePrice, SORT_ORDERS.asc), label: "Сначала дешевле" },
  { value: toSortValue(HALL_SORT_FIELDS.basePrice, SORT_ORDERS.desc), label: "Сначала дороже" },
];
