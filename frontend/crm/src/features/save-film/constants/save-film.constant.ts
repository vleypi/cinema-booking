import type { ISelectOption } from "@luch/shared/ui";
import { AGE_RATINGS, FILM_STATUS_LABELS, FILM_STATUSES } from "@/entities/film";

export const SAVE_FILM_TEXT = {
  title: "Название",
  description: "Описание",
  genre: "Жанр",
  ageRating: "Возраст",
  durationMinutes: "Длительность, мин",
  releaseDate: "Начало проката",
  status: "Статус",
  statusHint: "Снятый с проката фильм нельзя поставить в расписание",
  trailerUrl: "Ссылка на трейлер",
  trailerUrlHint: "Необязательно. Например, https://www.youtube.com/watch?v=…",
  isPremiere: "Премьера",
  isPremiereHint: "Фильм отмечается на сайте как премьера",
  poster: "Постер",
  posterHint: "JPEG, PNG или WebP до 5 МБ",
  choosePoster: "Выбрать файл",
  replacePoster: "Заменить",
  required: "Заполните поле",
  tooLong: "Слишком длинное значение",
  durationRange: "От 1 до 600 минут",
  dateFormat: "Укажите дату",
  urlFormat: "Укажите ссылку, начиная с http:// или https://",
  posterInvalid: "Загрузите постер в формате JPEG, PNG или WebP размером до 5 МБ",
  create: "Добавить фильм",
  save: "Сохранить",
  remove: "Удалить",
  cancel: "Отмена",
  removeTitle: "Удалить фильм?",
  removeDescription: "Фильм исчезнет из каталога. Фильм с сеансами удалить нельзя, его можно только снять с проката",
} as const;

export const FILM_LIMITS = {
  titleMaxLength: 200,
  descriptionMaxLength: 5000,
  genreMaxLength: 100,
  trailerUrlMaxLength: 500,
  durationMaxMinutes: 600,
  posterMaxBytes: 5 * 1024 * 1024,
} as const;

export const POSTER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const AGE_RATING_OPTIONS: readonly ISelectOption[] = AGE_RATINGS.map((rating) => ({ value: rating, label: rating }));

export const FILM_STATUS_OPTIONS: readonly ISelectOption[] = Object.values(FILM_STATUSES).map((status) => ({
  value: status,
  label: FILM_STATUS_LABELS[status],
}));
