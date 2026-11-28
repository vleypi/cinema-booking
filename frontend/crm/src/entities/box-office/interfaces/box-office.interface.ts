import type { SeatType } from "@/entities/hall";
import type { SessionFormat } from "@/entities/session";

export type BoxOfficePaymentMethod = "CASH" | "CARD_TERMINAL";
export type BoxOfficePrintFormat = "a4" | "receipt";
export type OrderChannel = "ONLINE" | "BOX_OFFICE";
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "EXPIRED" | "PARTIALLY_REFUNDED" | "REFUNDED";
export type TicketStatus = "RESERVED" | "ACTIVE" | "USED" | "REFUND_PENDING" | "REFUNDED" | "RELEASED";

export interface IBoxOfficeSession {
  id: string;
  filmId: string;
  hallId: string;
  startsAt: string;
  endsAt: string;
  format: SessionFormat;
  status: string;
  basePriceOverride: number | null;
  film: {
    id: string;
    title: string;
    ageRating: string;
    durationMinutes: number;
  };
  hall: {
    id: string;
    name: string;
    format: string;
  };
}

export interface IBoxOfficePriceZone {
  id: string;
  name: string;
  multiplier: number;
  price: number;
}

export interface IBoxOfficeSeat {
  id: string;
  row: number;
  number: number;
  posX: number;
  posY: number;
  type: SeatType;
  priceZoneId: string;
  price: number;
  isAvailable: boolean;
}

export interface IBoxOfficeSessionSeats {
  sessionId: string;
  startsAt: string;
  endsAt: string;
  format: SessionFormat;
  film: {
    id: string;
    title: string;
    ageRating: string;
    durationMinutes: number;
  };
  hall: {
    id: string;
    name: string;
    format: string;
  };
  cinema: {
    id: string;
    name: string;
    timezone: string;
  };
  priceZones: IBoxOfficePriceZone[];
  seats: IBoxOfficeSeat[];
}

export interface IBoxOfficeTicket {
  id: string;
  seatId: string;
  code: string;
  price: number;
  status: TicketStatus;
  row: number;
  number: number;
  seatType: SeatType;
  qrPayload: string | null;
}

export interface IBoxOfficeOrder {
  id: string;
  number: string;
  cinemaId: string;
  channel: OrderChannel;
  status: OrderStatus;
  totalAmount: number;
  contactEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  cashierId: string | null;
  createdAt: string;
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    format: SessionFormat;
    filmTitle: string;
    hallName: string;
  };
  tickets: IBoxOfficeTicket[];
}

export interface ICreateBoxOfficeOrderPayload {
  sessionId: string;
  seatIds: string[];
  paymentMethod: BoxOfficePaymentMethod;
  email?: string;
  name?: string;
  phone?: string;
}

export interface IBoxOfficeRefundPayload {
  ticketIds: string[];
  refundMethod?: BoxOfficePaymentMethod;
}

export interface IBoxOfficeRefund {
  id: string;
  orderId: string;
  orderStatus: OrderStatus;
  paymentId: string;
  amount: number;
  reason: string;
  initiatorType: string;
  status: string;
  ticketIds: string[];
}
