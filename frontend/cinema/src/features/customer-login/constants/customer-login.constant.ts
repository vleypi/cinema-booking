export const OTP_RESEND_SECONDS = 60;

export const CUSTOMER_LOGIN_TEXT = {
  eyebrow: "Личный кабинет",
  title: "Вход по коду",
  emailSubtitle: "Введите электронную почту, и мы отправим одноразовый шестизначный код.",
  codeSubtitle: (email: string) => `Мы отправили 6-значный код на ${email}`,
  emailLabel: "Электронная почта",
  emailPlaceholder: "viewer@example.com",
  codeLabel: "Код из письма",
  codePlaceholder: "000000",
  sendCodeButton: "Получить код",
  sendingCodeButton: "Отправляем…",
  verifyButton: "Войти",
  verifyingButton: "Проверяем…",
  changeEmailButton: "Изменить почту",
  resendButton: "Отправить код повторно",
  resendWait: (seconds: number) => `Повторная отправка через ${seconds} с`,
  validationEmail: "Укажите корректный адрес почты",
  validationCode: "Введите 6 цифр кода из письма",
  fallbackError: "Не удалось выполнить запрос. Попробуйте позже.",
} as const;
