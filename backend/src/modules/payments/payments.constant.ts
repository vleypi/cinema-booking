export const PAYMENT_CURRENCY = 'RUB';

export const YOOKASSA_WEBHOOK_EVENTS = {
  paymentSucceeded: 'payment.succeeded',
  paymentCanceled: 'payment.canceled',
  refundSucceeded: 'refund.succeeded',
} as const;

export const PAYMENT_MESSAGES = {
  orderNotFound: 'Заказ не найден',
  orderNotPayable: 'Заказ недоступен для оплаты',
  orderHoldExpired: 'Время бронирования заказа истекло',
  yookassaNotConfigured: 'Платежный шлюз ЮKassa не настроен',
  yookassaRequestFailed: 'Ошибка обращения к платежному шлюзу ЮKassa',
  paymentVerificationFailed: 'Не удалось подтвердить статус платежа в ЮKassa',
  paymentAmountMismatch: 'Сумма платежа не совпадает с суммой заказа',
} as const;
