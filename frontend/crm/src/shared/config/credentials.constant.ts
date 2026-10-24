export const CREDENTIALS = {
  loginMaxLength: 64,
  loginPattern: /^[a-z0-9._-]+$/,
  passwordMinLength: 8,
  passwordMaxLength: 128,
} as const;

export const CREDENTIALS_TEXT = {
  loginRequired: "Введите логин",
  loginFormat: "Только латинские буквы, цифры, точка, дефис и подчеркивание",
  passwordRequired: "Введите пароль",
  passwordTooShort: `Минимум ${CREDENTIALS.passwordMinLength} символов`,
  tooLong: "Слишком длинное значение",
} as const;
