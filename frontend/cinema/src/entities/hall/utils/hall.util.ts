import { pluralize } from "@/shared/lib";
import { HALL_TEXT, SEAT_TYPES, SINGLE_ZONE_TONE, ZONE_TONES } from "@/entities/hall/constants/hall.constant";
import type { IHall, IZoneTone } from "@/entities/hall/interfaces/hall.interface";

export const getZoneTone = (order: number, zoneCount: number): IZoneTone =>
  zoneCount > 1 ? ZONE_TONES[Math.round((order * (ZONE_TONES.length - 1)) / (zoneCount - 1))] : SINGLE_ZONE_TONE;

export const getHallMinPrice = ({ priceZones }: IHall): number => Math.min(...priceZones.flatMap(({ prices }) => prices));

export const describeCapacity = ({ seats }: IHall): string =>
  pluralize(seats.length, seats.every(({ type }) => type === SEAT_TYPES.sofa) ? HALL_TEXT.sofas : HALL_TEXT.seats);

export const getLayoutSize = ({ seats }: IHall) => ({
  columns: Math.max(...seats.map(({ posX }) => posX)) + 1,
  rows: Math.max(...seats.map(({ posY }) => posY)) + 1,
});
