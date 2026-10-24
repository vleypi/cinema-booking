export const HALL_NAME_MAX_LENGTH = 100;
export const HALL_FORMAT_MAX_LENGTH = 50;
export const HALL_BASE_PRICE_MAX = 1_000_000;
export const PRICE_ZONE_NAME_MAX_LENGTH = 50;
export const LAYOUT_ROWS_MAX = 50;
export const LAYOUT_SEATS_MAX = 1000;
export const SEAT_NUMBER_MAX = 100;
export const SEAT_POSITION_MAX = 200;

export const HALL_MESSAGES = {
  notFound: 'Зал не найден',
  layoutNotFound: 'Схема зала еще не создана',
  priceZoneNotFound: 'Ценовая зона не найдена',
  priceZoneInUse: 'Ценовая зона используется в схеме зала',
  foreignPriceZone: 'Ценовая зона не относится к этому залу',
  rowOutOfRange: 'Ряд выходит за пределы схемы',
  duplicateSeat: 'Место с таким рядом и номером уже есть',
  duplicatePosition: 'Позиция уже занята другим местом',
} as const;
