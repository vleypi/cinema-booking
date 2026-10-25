import type { SeatType } from "@/entities/hall/constants/hall.constant";

export interface IPriceZone {
  id: string;
  hallId: string;
  name: string;
  multiplier: number;
}

export interface IPriceZonePayload {
  name: string;
  multiplier: number;
}

export interface IHall {
  id: string;
  cinemaId: string;
  name: string;
  format: string;
  basePrice: number;
  useTimeBands: boolean;
  isActive: boolean;
  priceZones: IPriceZone[];
}

export interface IHallPayload {
  name: string;
  format: string;
  basePrice: number;
  useTimeBands: boolean;
  isActive?: boolean;
}

export interface ISeatInput {
  row: number;
  number: number;
  posX: number;
  posY: number;
  type: SeatType;
  priceZoneId: string;
}

export interface ISeat extends ISeatInput {
  id: string;
}

export interface IHallLayoutPayload {
  rows: number;
  seats: ISeatInput[];
}

export interface IHallLayout {
  id: string;
  hallId: string;
  version: number;
  isCurrent: boolean;
  rows: number;
  seats: ISeat[];
}
