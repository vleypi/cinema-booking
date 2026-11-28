import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';

export const BOX_OFFICE_PAYMENT_METHODS = [PaymentProvider.Cash, PaymentProvider.CardTerminal] as const;

export type BoxOfficePaymentMethod = (typeof BOX_OFFICE_PAYMENT_METHODS)[number];

export const BOX_OFFICE_SEARCH_LIMIT = 30;

export const BOX_OFFICE_MESSAGES = {
  sessionNotFound: 'Сеанс не найден',
  sessionEnded: 'Продажа в кассе закрывается после окончания сеанса',
  seatNotInLayout: 'Выбранные места не принадлежат схеме зала сеанса',
  seatsAlreadyTaken: 'Выбранные места уже заняты или удерживаются другим покупателем',
  orderNotFound: 'Заказ не найден',
} as const;
