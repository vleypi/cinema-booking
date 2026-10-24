export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCK_SECONDS = 15 * 60;

export const AUTH_COOKIE_NAMES = { access: 'staff_access', refresh: 'staff_refresh' } as const;

export const REQUIRED_PERMISSIONS = 'auth:required-permissions';

export const AUTH_MESSAGES = {
  invalidCredentials: 'Неверный логин или пароль',
  loginLocked: 'Слишком много неудачных попыток входа. Попробуйте через 15 минут',
  staffBlocked: 'Сотрудник заблокирован',
  sessionExpired: 'Сессия истекла, войдите снова',
  passwordChangeRequired: 'Смените временный пароль',
  wrongCurrentPassword: 'Текущий пароль указан неверно',
  permissionDenied: 'Недостаточно прав',
  cinemaAccessDenied: 'Нет доступа к этому кинотеатру',
} as const;
