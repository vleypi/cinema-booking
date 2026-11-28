import type { SeatType } from "@/entities/hall/constants/hall.constant";

export interface ISeat {
  row: number;
  number: number;
  posX: number;
  posY: number;
  type: SeatType;
  priceZoneId: string;
}

export interface IPriceZone {
  id: string;
  name: string;
  multiplier: number;
  prices: number[];
}

export interface IHall {
  id: string;
  name: string;
  format: string;
  seats: ISeat[];
  priceZones: IPriceZone[];
}

export interface ITimeBand {
  name: string;
  startsAt: string;
  endsAt: string;
}

export interface ICinemaHalls {
  timeBands: ITimeBand[];
  halls: IHall[];
}

export interface IZoneTone {
  fill: string;
  swatch: string;
}
