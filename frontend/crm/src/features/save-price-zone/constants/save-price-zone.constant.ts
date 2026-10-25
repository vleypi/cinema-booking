export const SAVE_PRICE_ZONE_TEXT = {
  name: "Название",
  nameHint: "Например, Стандарт, Лучшие места или Первые ряды",
  multiplier: "Коэффициент",
  multiplierHint: "Цена места умножается на коэффициент зоны. 1 означает базовую цену",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  create: "Добавить зону",
  save: "Сохранить",
  remove: "Удалить",
  cancel: "Отмена",
} as const;

export const PRICE_ZONE_NAME_MAX_LENGTH = 50;

export const NEW_PRICE_ZONE_VALUES = {
  name: "",
  multiplier: 1,
} as const;
