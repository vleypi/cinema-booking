import type { BadgeTone } from "@/shared/ui";
import type {
  BoxOfficePaymentMethod,
  OrderChannel,
  OrderStatus,
  TicketStatus,
} from "@/entities/box-office/interfaces/box-office.interface";

export const BOX_OFFICE_PAYMENT_METHOD_LABELS: Record<BoxOfficePaymentMethod, string> = {
  CASH: "Наличные",
  CARD_TERMINAL: "Банковская карта",
};

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  ONLINE: "Сайт",
  BOX_OFFICE: "Касса",
};

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: "Ожидает оплаты", tone: "warning" },
  PAID: { label: "Оплачен", tone: "success" },
  EXPIRED: { label: "Истёк", tone: "neutral" },
  PARTIALLY_REFUNDED: { label: "Частичный возврат", tone: "warning" },
  REFUNDED: { label: "Возвращён", tone: "danger" },
};

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  RESERVED: { label: "Бронь", tone: "warning" },
  ACTIVE: { label: "Активен", tone: "success" },
  USED: { label: "Использован", tone: "neutral" },
  REFUNDED: { label: "Возвращён", tone: "danger" },
  EXPIRED: { label: "Истёк", tone: "neutral" },
};

export const PRINT_FORMAT_LABELS = {
  a4: "Печать A4",
  receipt: "Чек 80 мм",
} as const;
