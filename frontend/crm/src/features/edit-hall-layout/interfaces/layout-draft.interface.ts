import type { SeatType } from "@/entities/hall";
import type { BRUSH_KINDS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";

export type Brush = SeatType | (typeof BRUSH_KINDS)[keyof typeof BRUSH_KINDS];

export interface ILayoutCell {
  type: SeatType;
  priceZoneId: string;
}

export interface ILayoutDraft {
  columns: number;
  rows: number;
  cells: Readonly<Record<string, ILayoutCell>>;
}

export interface INumberedSeat extends ILayoutCell {
  posX: number;
  posY: number;
  row: number;
  number: number;
}
