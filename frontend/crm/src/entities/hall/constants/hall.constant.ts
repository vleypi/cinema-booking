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
} as const;
