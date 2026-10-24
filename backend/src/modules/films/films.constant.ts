export const FILM_TITLE_MAX_LENGTH = 200;
export const FILM_DESCRIPTION_MAX_LENGTH = 5000;
export const FILM_GENRE_MAX_LENGTH = 100;
export const FILM_TRAILER_URL_MAX_LENGTH = 500;
export const FILM_DURATION_MAX_MINUTES = 600;

export const POSTER_FIELD = 'file';
export const POSTER_MAX_BYTES = 5 * 1024 * 1024;
export const POSTER_MIME_TYPES = /^image\/(jpeg|png|webp)$/;

export const FILM_MESSAGES = {
  notFound: 'Фильм не найден',
  hasSessions: 'У фильма есть сеансы, его можно только снять с проката',
  invalidPoster: 'Загрузите постер в формате JPEG, PNG или WebP размером до 5 МБ',
} as const;
