export const TIME_BAND_LIMITS = {
  maxBands: 12,
  nameMaxLength: 50,
} as const;

export const NEW_TIME_BAND_VALUES = {
  name: "",
  startsAt: "12:00",
  multiplier: 1,
} as const;

export const SAVE_TIME_BAND_TEXT = {
  name: "Название",
  nameHint: "Например, Утро, День или Вечер",
  startsAt: "Начало",
  startsAtHint: "Интервал длится до начала следующего, последний до конца суток. Первый начинается в 00:00",
  multiplier: "Коэффициент",
  multiplierHint: "Цена места умножается на коэффициент интервала. Залы с фиксированной ценой его не учитывают",
  create: "Добавить интервал",
  save: "Сохранить",
  remove: "Удалить",
  cancel: "Отмена",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  timeFormat: "Укажите время в формате ЧЧ:ММ",
} as const;
