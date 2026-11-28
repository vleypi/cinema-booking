import type { OrderChannel } from "@/entities/box-office";

export interface IReportPeriod {
  from: string;
  to: string;
}

export interface IRevenueTotals {
  grossAmount: number;
  refundedAmount: number;
  netRevenue: number;
  ticketsSold: number;
  ticketsRefunded: number;
}

export interface IRevenueByFilm extends IRevenueTotals {
  filmId: string;
  filmTitle: string;
}

export interface IRevenueByHall extends IRevenueTotals {
  hallId: string;
  hallName: string;
}

export interface IRevenueByChannel extends IRevenueTotals {
  channel: OrderChannel;
}

export interface IRevenueReport {
  totals: IRevenueTotals;
  byFilm: IRevenueByFilm[];
  byHall: IRevenueByHall[];
  byChannel: IRevenueByChannel[];
}

export interface IOccupancySessionItem {
  sessionId: string;
  startsAt: string;
  filmTitle: string;
  hallName: string;
  status: string;
  totalSeats: number;
  soldTickets: number;
  occupancyPercent: number;
}
