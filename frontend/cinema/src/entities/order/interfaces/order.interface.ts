export type SeatType = "STANDARD" | "SOFA" | "WHEELCHAIR";

export interface ISessionSeat {
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

export interface ISessionPriceZone {
  id: string;
  name: string;
  multiplier: number;
  price: number;
}

export interface ISessionSeatsResponse {
  sessionId: string;
  startsAt: string;
  endsAt: string;
  format: string;
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
  priceZones: ISessionPriceZone[];
  seats: ISessionSeat[];
}

export interface ICreateOrderPayload {
  sessionId: string;
  seatIds: string[];
  email: string;
  name?: string;
  phone?: string;
  privacyAccepted: boolean;
  ageConfirmed?: boolean;
}

export interface IOrderTicket {
  id: string;
  seatId: string;
  code: string;
  price: number;
  status: string;
}

export interface IOrder {
  id: string;
  number: string;
  cinemaId: string;
  sessionId: string;
  contactEmail: string | null;
  channel: string;
  status: string;
  totalAmount: number;
  holdExpiresAt: string | null;
  ageConfirmed: boolean;
  tickets: IOrderTicket[];
}

export interface IPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  externalId: string | null;
  amount: number;
  status: string;
  confirmationUrl: string | null;
  paidAt: string | null;
}
