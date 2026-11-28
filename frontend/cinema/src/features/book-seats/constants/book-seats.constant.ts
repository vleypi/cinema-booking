import type { SeatType } from "@/entities/order";

export const MAX_ONLINE_SEATS = 5;
export const ADULT_AGE_RATING = "18+";

export const SEAT_TYPE_LABELS: Record<SeatType, string> = {
  STANDARD: "Кресло",
  SOFA: "Диван на двоих",
  WHEELCHAIR: "Место для коляски",
} as const;

export const BOOK_SEATS_TEXT = {
  screen: "ЭКРАН",
  rowPrefix: (row: number) => `Ряд ${row}`,
  seatAriaLabel: (row: number, number: number, typeLabel: string, price: string, isAvailable: boolean, isSelected: boolean) =>
    `Ряд ${row}, место ${number}, ${typeLabel}, ${price}, ${!isAvailable ? "занято" : isSelected ? "выбрано" : "свободно"}`,
  legendSelected: "Выбрано",
  legendOccupied: "Занято",
  maxSeatsNotice: `В одном онлайн-заказе можно выбрать не более ${MAX_ONLINE_SEATS} мест`,
  selectedTitle: "Выбранные места",
  emptySelection: "Выберите до пяти мест на схеме зала",
  seatSummary: (row: number, number: number) => `Ряд ${row}, место ${number}`,
  removeSeat: "Убрать место",
  totalLabel: "Итого",
  continueButton: "Далее",
  changeSeatsButton: "Изменить места",
  checkoutTitle: "Оформление заказа",
  checkoutNote: "Места будут забронированы на 10 минут при переходе к оплате",
  emailLabel: "Электронная почта",
  emailPlaceholder: "viewer@example.com",
  nameLabel: "Имя (необязательно)",
  namePlaceholder: "Иван",
  phoneLabel: "Телефон (необязательно)",
  phonePlaceholder: "+7 999 123-45-67",
  privacyLabel: "Согласен на обработку персональных данных и получение билетов на почту",
  ageLabel: "Подтверждаю, что мне исполнилось 18 лет",
  reserveButton: "Перейти к оплате",
  reservingButton: "Бронируем места…",
  holdTitle: "Места забронированы",
  holdOrderNumber: (number: string) => `Заказ ${number}`,
  holdTimerLabel: "Бронь действует",
  holdExpired: "Время бронирования истекло. Выберите места заново.",
  payButton: "Перейти к оплате в ЮKassa",
  payingButton: "Переходим в ЮKassa…",
  chooseAgainButton: "Выбрать места заново",
  validationEmail: "Укажите корректный адрес почты",
  validationPrivacy: "Необходимо согласие на обработку персональных данных",
  validationAge: "Для фильма 18+ необходимо подтвердить возраст",
  fallbackError: "Не удалось выполнить операцию. Попробуйте еще раз.",
  paymentReadyFallback: "Платеж создан. Если перенаправление не сработало, повторите попытку.",
} as const;
