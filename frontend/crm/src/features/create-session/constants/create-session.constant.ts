import type { ISelectOption } from "@luch/shared/ui";
import { SESSION_FORMATS } from "@/entities/session";

export const CREATE_SESSION_TEXT = {
  film: "Фильм",
  hall: "Зал",
  date: "Дата",
  time: "Начало",
  timeHint: "Время кинотеатра. Конец считается по длительности фильма",
  format: "Формат",
  basePrice: "Цена сеанса, ₽",
  basePriceHint: "Необязательно. Без нее берется цена зала",
  hallPrice: "Необязательно, по умолчанию цена зала",
  required: "Выберите значение",
  dateFormat: "Укажите дату",
  timeFormat: "Укажите время в формате ЧЧ:ММ",
  basePriceRange: "Цена от 0 до 10 000 ₽",
  noFilmsTitle: "Нет фильмов для расписания",
  noFilmsDescription: "Добавьте фильм в разделе «Фильмы» или верните его в прокат",
  noHallsTitle: "Нет работающих залов",
  noHallsDescription: "Попросите администратора добавить зал со схемой мест",
  create: "Поставить сеанс",
  cancel: "Отмена",
} as const;

export const BASE_PRICE_MAX_RUBLES = 10_000;

export const SESSION_FORMAT_OPTIONS: readonly ISelectOption[] = SESSION_FORMATS.map((format) => ({ value: format, label: format }));
