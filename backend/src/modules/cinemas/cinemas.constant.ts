export const CINEMA_NAME_MAX_LENGTH = 100;
export const CINEMA_ADDRESS_MAX_LENGTH = 255;
export const CINEMA_SLUG_MAX_LENGTH = 64;
export const CINEMA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CLEANING_BREAK_MAX_MINUTES = 120;

export const CINEMA_MESSAGES = {
  notFound: 'Кинотеатр не найден',
  slugTaken: 'Код страницы уже занят другим кинотеатром',
  slugFormat: 'Код страницы может содержать только латинские буквы в нижнем регистре, цифры и дефисы',
} as const;
