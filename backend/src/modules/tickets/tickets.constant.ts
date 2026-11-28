export const TICKET_EMAILS_QUEUE = 'ticket-emails';
export const SEND_ORDER_TICKETS_JOB = 'send-order-tickets';
export const TICKET_QR_PREFIX = 'LUCH:v1';
export const CHECK_IN_OPEN_BEFORE_MINUTES = 30;

export enum CheckInReasonCode {
  InvalidQr = 'INVALID_QR',
  TicketNotFound = 'TICKET_NOT_FOUND',
  WrongCinema = 'WRONG_CINEMA',
  WrongHall = 'WRONG_HALL',
  SessionCancelled = 'SESSION_CANCELLED',
  TicketRefunded = 'TICKET_REFUNDED',
  TicketNotActive = 'TICKET_NOT_ACTIVE',
  TicketAlreadyUsed = 'TICKET_ALREADY_USED',
  TooEarly = 'TOO_EARLY',
  SessionEnded = 'SESSION_ENDED',
}

export const CHECK_IN_MESSAGES: Record<CheckInReasonCode | 'ALLOWED', string> = {
  ALLOWED: 'Проход разрешен',
  [CheckInReasonCode.InvalidQr]: 'Недействительный или подделанный QR-код',
  [CheckInReasonCode.TicketNotFound]: 'Билет не найден',
  [CheckInReasonCode.WrongCinema]: 'Билет относится к другому кинотеатру',
  [CheckInReasonCode.WrongHall]: 'Билет относится к другому залу',
  [CheckInReasonCode.SessionCancelled]: 'Сеанс отменен',
  [CheckInReasonCode.TicketRefunded]: 'Билет возвращен',
  [CheckInReasonCode.TicketNotActive]: 'Билет не оплачен или отменен',
  [CheckInReasonCode.TicketAlreadyUsed]: 'Билет уже использован',
  [CheckInReasonCode.TooEarly]: 'Проход открывается за 30 минут до начала сеанса',
  [CheckInReasonCode.SessionEnded]: 'Сеанс уже завершился',
} as const;

export const TICKET_MESSAGES = {
  orderNotFound: 'Заказ не найден',
  ticketsNotReady: 'Билеты по заказу еще не оплачены или отсутствуют',
  checkInInputRequired: 'Укажите QR-код или код билета',
} as const;
