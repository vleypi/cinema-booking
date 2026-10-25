export const SAVE_HALL_TEXT = {
  name: "Название",
  format: "Формат",
  formatHint: "Например, Лазер 4K или 2D / 3D",
  basePrice: "Базовая цена места, ₽",
  basePriceHint: "Итоговая цена: базовая × коэффициент интервала × коэффициент зоны",
  useTimeBands: "Учитывать временные интервалы",
  useTimeBandsHint: "Отключите для зала с фиксированной ценой, например «Диван»",
  isActive: "Зал работает",
  isActiveHint: "В неработающий зал нельзя поставить новые сеансы",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  basePriceRange: "Цена от 0 до 10 000 ₽",
  create: "Добавить зал",
  save: "Сохранить",
  cancel: "Отмена",
} as const;

export const HALL_LIMITS = {
  nameMaxLength: 100,
  formatMaxLength: 50,
  basePriceMaxRubles: 10_000,
} as const;

export const NEW_HALL_VALUES = {
  name: "",
  format: "",
  basePrice: 400,
  useTimeBands: true,
  isActive: true,
} as const;
