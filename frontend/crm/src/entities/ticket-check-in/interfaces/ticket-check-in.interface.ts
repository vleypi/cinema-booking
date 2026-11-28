export type CheckInReasonCode =
  | "INVALID_QR"
  | "TICKET_NOT_FOUND"
  | "WRONG_CINEMA"
  | "WRONG_HALL"
  | "SESSION_CANCELLED"
  | "TICKET_REFUNDED"
  | "TICKET_NOT_ACTIVE"
  | "TICKET_ALREADY_USED"
  | "TOO_EARLY"
  | "SESSION_ENDED";

export interface ICheckInHallOption {
  id: string;
  name: string;
  format: string;
}

export interface ICheckInTicketDetails {
  id: string;
  code: string;
  status: string;
  row: number;
  number: number;
  filmTitle: string;
  ageRating: string;
  hallId: string;
  hallName: string;
  cinemaName: string;
  startsAt: string;
  endsAt: string;
  usedAt: string | null;
  usedByName: string | null;
}

export interface ICheckInResult {
  allowed: boolean;
  reasonCode: CheckInReasonCode | null;
  message: string;
  ticket: ICheckInTicketDetails | null;
}

export interface ICheckInPayload {
  qrPayload?: string;
  code?: string;
  hallId?: string;
}
