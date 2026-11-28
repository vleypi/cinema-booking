import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';

export const MAX_ONLINE_TICKETS = 5;
export const HOLD_DURATION_MINUTES = 10;
export const HOLD_TTL_SECONDS = HOLD_DURATION_MINUTES * 60;
export const EXPIRED_HOLDS_SWEEP_MS = 30_000;

export const CUSTOMER_NAME_MAX_LENGTH = 120;
export const CUSTOMER_PHONE_MAX_LENGTH = 32;

export const OCCUPIED_TICKET_STATUSES = [TicketStatus.Reserved, TicketStatus.Active, TicketStatus.Used] as const;

export const seatHoldKey = (sessionId: string, seatId: string): string => `seat-hold:${sessionId}:${seatId}`;

export const ORDER_MESSAGES = {
  sessionNotFound: 'Сеанс не найден',
  saleClosed: 'Онлайн-продажа на этот сеанс уже закрыта',
  seatNotInLayout: 'Одно или несколько выбранных мест не относятся к схеме зала этого сеанса',
  seatsAlreadyTaken: 'Одно или несколько выбранных мест уже заняты',
  ageConfirmationRequired: 'Для фильма 18+ необходимо подтвердить возраст',
  privacyRequired: 'Необходимо согласие на обработку персональных данных',
  maxTicketsExceeded: `В онлайн-заказе может быть не более ${MAX_ONLINE_TICKETS} билетов`,
  minTicketsRequired: 'Выберите хотя бы одно место',
  duplicateSeats: 'Места в заказе не должны повторяться',
} as const;
