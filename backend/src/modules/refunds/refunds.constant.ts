export const REFUND_TOKEN_PREFIX = 'refund-token:used';
export const MIN_USED_TOKEN_TTL_SECONDS = 3_600;

export const usedRefundTokenKey = (jti: string): string => `${REFUND_TOKEN_PREFIX}:${jti}`;

export const REFUND_MESSAGES = {
  orderNotFound: 'Заказ не найден',
  paymentNotFound: 'Успешный платеж по заказу не найден',
  sessionAlreadyStarted: 'Возврат билетов доступен только до начала сеанса',
  ticketsNotRefundable: 'Выбранные билеты недоступны для возврата или уже использованы',
  boxOfficeRefundInCashierOnly: 'Возврат билетов, купленных в кассе, оформляется в кассе кинотеатра',
  refundMethodRequired: 'Укажите способ возврата для заказа из кассы',
  invalidRefundToken: 'Ссылка на возврат недействительна или срок ее действия истек',
  refundTokenAlreadyUsed: 'Ссылка на возврат уже использована',
} as const;
