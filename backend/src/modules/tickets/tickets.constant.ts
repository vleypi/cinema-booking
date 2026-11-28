export const TICKET_EMAILS_QUEUE = 'ticket-emails';
export const SEND_ORDER_TICKETS_JOB = 'send-order-tickets';
export const TICKET_QR_PREFIX = 'LUCH:v1';

export const TICKET_MESSAGES = {
  orderNotFound: 'Заказ не найден',
  ticketsNotReady: 'Билеты по заказу еще не оплачены или отсутствуют',
} as const;
