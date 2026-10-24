import type { ISelectOption } from "@luch/shared/ui";
import type { ICinemaPayload } from "@/entities/cinema";

export const SAVE_CINEMA_TEXT = {
  name: "Название",
  slug: "Код для адреса страницы",
  slugHint: "Например, luch-arbat. Станет частью адреса на сайте",
  address: "Адрес",
  timezone: "Часовой пояс",
  opensAt: "Открывается",
  closesAt: "Закрывается",
  closesAtHint: "Если после полуночи, укажите время следующего дня",
  cleaningBreak: "Перерыв между сеансами, мин",
  isPublished: "Показывать на сайте",
  isPublishedHint: "Скрытый кинотеатр не виден зрителям, данные сохраняются",
  required: "Заполните поле",
  slugFormat: "Только латинские буквы в нижнем регистре, цифры и дефисы",
  timeFormat: "Укажите время в формате ЧЧ:ММ",
  breakRange: "От 0 до 120 минут",
  tooLong: "Слишком длинное значение",
  create: "Добавить кинотеатр",
  save: "Сохранить",
  cancel: "Отмена",
} as const;

export const CINEMA_LIMITS = {
  nameMaxLength: 100,
  slugMaxLength: 64,
  addressMaxLength: 255,
  cleaningBreakMaxMinutes: 120,
} as const;

export const TIMEZONE_OPTIONS: readonly ISelectOption[] = [
  { value: "Europe/Kaliningrad", label: "Калининград, UTC+2" },
  { value: "Europe/Moscow", label: "Москва, UTC+3" },
  { value: "Europe/Samara", label: "Самара, UTC+4" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург, UTC+5" },
  { value: "Asia/Omsk", label: "Омск, UTC+6" },
  { value: "Asia/Novosibirsk", label: "Новосибирск, UTC+7" },
  { value: "Asia/Krasnoyarsk", label: "Красноярск, UTC+7" },
  { value: "Asia/Irkutsk", label: "Иркутск, UTC+8" },
  { value: "Asia/Yakutsk", label: "Якутск, UTC+9" },
  { value: "Asia/Vladivostok", label: "Владивосток, UTC+10" },
  { value: "Asia/Magadan", label: "Магадан, UTC+11" },
  { value: "Asia/Kamchatka", label: "Петропавловск-Камчатский, UTC+12" },
];

export const NEW_CINEMA_VALUES: ICinemaPayload = {
  name: "",
  slug: "",
  address: "",
  timezone: "Europe/Moscow",
  opensAt: "10:00",
  closesAt: "02:00",
  cleaningBreakMinutes: 15,
  isPublished: false,
};
