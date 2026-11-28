export const CUSTOMER_COOKIE_NAMES = {
  access: 'customer_access',
  refresh: 'customer_refresh',
} as const;

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const otpRedisKey = (email: string): string => `customer:otp:${email}`;
export const otpCooldownKey = (email: string): string => `customer:otp-cooldown:${email}`;

export const CUSTOMER_MESSAGES = {
  otpCooldown: 'Новый код можно запросить не чаще одного раза в минуту',
  invalidOtp: 'Неверный или истёкший код подтверждения',
  sessionExpired: 'Сессия истекла, войдите снова',
  orderNotFound: 'Заказ не найден',
  invalidOtpFormat: 'Код подтверждения должен состоять из 6 цифр',
} as const;
