import type { IFilm } from "@/entities/film";
import type { SessionFormat, SessionStatus } from "@/entities/session/constants/session.constant";

export interface ISessionPayload {
  filmId: string;
  hallId: string;
  date: string;
  time: string;
  format: SessionFormat;
  basePriceOverride?: number;
}

export interface ISession {
  id: string;
  filmId: string;
  hallId: string;
  layoutId: string;
  startsAt: string;
  endsAt: string;
  format: SessionFormat;
  basePriceOverride: number | null;
  status: SessionStatus;
  cancelReason: string | null;
  film: IFilm;
}
