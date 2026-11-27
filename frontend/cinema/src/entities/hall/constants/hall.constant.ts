import type { IZoneTone } from "@/entities/hall/interfaces/hall.interface";

export const cinemaHallsPath = (cinemaId: string) => `/catalog/cinemas/${cinemaId}/halls`;

export const SEAT_TYPES = {
  standard: "STANDARD",
  sofa: "SOFA",
  wheelchair: "WHEELCHAIR",
} as const;

export type SeatType = (typeof SEAT_TYPES)[keyof typeof SEAT_TYPES];

export const SINGLE_ZONE_TONE: IZoneTone = { fill: "fill-paper/60", swatch: "bg-paper/60" };

export const ZONE_TONES: readonly IZoneTone[] = [
  { fill: "fill-paper/30", swatch: "bg-paper/30" },
  { fill: "fill-paper/72", swatch: "bg-paper/72" },
  { fill: "fill-warm", swatch: "bg-warm" },
];

export const MINIMAP_SEAT_SIZE = 0.82;
export const MINIMAP_SEAT_RADIUS = 0.12;

export const HALL_TEXT = {
  seats: { one: "место", few: "места", many: "мест" },
  sofas: { one: "диван на двоих", few: "дивана на двоих", many: "диванов на двоих" },
  priceFrom: "цена от",
  screen: "Экран",
} as const;
