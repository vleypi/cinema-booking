export const DAY_START = "00:00";
export const DAY_END = "24:00";

export const TIME_BAND_LIMITS = {
  maxBands: 12,
  nameMaxLength: 50,
} as const;

export const NEW_TIME_BAND = {
  name: "",
  startsAt: "12:00",
  multiplier: 1,
} as const;

export const EDIT_TIME_BANDS_TEXT = {
  name: "Название",
  startsAt: "Начало",
  endsAt: "До",
  multiplier: "Коэффициент",
  add: "Добавить интервал",
  remove: "Удалить интервал",
  save: "Сохранить интервалы",
  saved: "Интервалы сохранены",
  reset: "Отменить изменения",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  timeFormat: "Укажите время в формате ЧЧ:ММ",
  dayStartMissing: "Первый интервал должен начинаться в 00:00",
  duplicateStart: "Два интервала не могут начинаться в одно время",
} as const;
