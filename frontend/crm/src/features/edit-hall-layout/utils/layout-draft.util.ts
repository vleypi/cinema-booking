import { type IHallLayout, type IHallLayoutPayload, SEAT_TYPES } from "@/entities/hall";
import { BRUSH_KINDS, LAYOUT_LIMITS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { Brush, ILayoutCell, ILayoutDraft, INumberedSeat } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

export const toCellKey = (posX: number, posY: number): string => `${posX}:${posY}`;

const fromCellKey = (key: string): [number, number] => {
  const [posX, posY] = key.split(":").map(Number);
  return [posX, posY];
};

export const range = (length: number): number[] => Array.from({ length }, (_, index) => index);

const fillGrid = (columns: number, rows: number, priceZoneId: string): Record<string, ILayoutCell> =>
  Object.fromEntries(
    range(rows).flatMap((posY) => range(columns).map((posX) => [toCellKey(posX, posY), { type: SEAT_TYPES.standard, priceZoneId }])),
  );

export const createDraft = (layout: IHallLayout | null, defaultPriceZoneId: string | undefined): ILayoutDraft => {
  if (!layout) {
    const { defaultColumns: columns, defaultRows: rows } = LAYOUT_LIMITS;
    return { columns, rows, cells: defaultPriceZoneId ? fillGrid(columns, rows, defaultPriceZoneId) : {} };
  }

  return {
    columns: Math.max(...layout.seats.map(({ posX }) => posX)) + 1,
    rows: Math.max(...layout.seats.map(({ posY }) => posY)) + 1,
    cells: Object.fromEntries(layout.seats.map(({ posX, posY, type, priceZoneId }) => [toCellKey(posX, posY), { type, priceZoneId }])),
  };
};

const paintCell = (cell: ILayoutCell | undefined, brush: Brush, priceZoneId: string): ILayoutCell | undefined => {
  if (brush === BRUSH_KINDS.aisle) return undefined;
  if (brush === BRUSH_KINDS.zone) return cell && { ...cell, priceZoneId };

  return { type: brush, priceZoneId };
};

export const paintDraft = (draft: ILayoutDraft, key: string, brush: Brush, priceZoneId: string): ILayoutDraft => {
  const current = draft.cells[key];
  const next = paintCell(current, brush, priceZoneId);
  if (current?.type === next?.type && current?.priceZoneId === next?.priceZoneId) return draft;

  const cells = { ...draft.cells };
  if (next) cells[key] = next;
  else delete cells[key];

  return { ...draft, cells };
};

export const fillEmptyCells = (draft: ILayoutDraft, priceZoneId: string): ILayoutDraft => ({
  ...draft,
  cells: { ...fillGrid(draft.columns, draft.rows, priceZoneId), ...draft.cells },
});

export const numberSeats = ({ columns, rows, cells }: ILayoutDraft): INumberedSeat[] => {
  const visible = Object.entries(cells)
    .map(([key, cell]) => ({ position: fromCellKey(key), cell }))
    .filter(({ position: [posX, posY] }) => posX < columns && posY < rows)
    .toSorted(({ position: [firstX, firstY] }, { position: [secondX, secondY] }) => firstY - secondY || firstX - secondX);

  const rowNumbers = new Map([...new Set(visible.map(({ position: [, posY] }) => posY))].map((posY, index) => [posY, index + 1]));
  const seatCounters = new Map<number, number>();

  return visible.map(({ position: [posX, posY], cell }) => {
    const number = (seatCounters.get(posY) ?? 0) + 1;
    seatCounters.set(posY, number);

    return { ...cell, posX, posY, row: rowNumbers.get(posY) ?? 0, number };
  });
};

export const toLayoutPayload = (seats: readonly INumberedSeat[]): IHallLayoutPayload => ({
  rows: Math.max(0, ...seats.map(({ row }) => row)),
  seats: seats.map(({ row, number, posX, posY, type, priceZoneId }) => ({ row, number, posX, posY, type, priceZoneId })),
});
