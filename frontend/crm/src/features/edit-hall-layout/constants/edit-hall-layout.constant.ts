import { SEAT_TYPES } from "@/entities/hall";
import type { Brush } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

export const LAYOUT_LIMITS = {
  minSize: 1,
  maxColumns: 40,
  maxRows: 25,
  defaultColumns: 12,
  defaultRows: 8,
} as const;

export const BRUSH_KINDS = {
  zone: "ZONE",
  aisle: "AISLE",
} as const;

export const BRUSH_OPTIONS: readonly { value: Brush; label: string }[] = [
  { value: SEAT_TYPES.standard, label: "Кресло" },
  { value: SEAT_TYPES.sofa, label: "Диван" },
  { value: SEAT_TYPES.wheelchair, label: "Коляска" },
  { value: BRUSH_KINDS.zone, label: "Зона" },
  { value: BRUSH_KINDS.aisle, label: "Проход" },
];

export const CELL_SIZES = [
  { maxColumns: 16, className: "size-12 text-sm" },
  { maxColumns: 24, className: "size-10 text-sm" },
  { maxColumns: LAYOUT_LIMITS.maxColumns, className: "size-8 text-xs" },
] as const;

export const EDIT_LAYOUT_TEXT = {
  columns: "Ширина",
  rows: "Ряды",
  decrease: "Уменьшить",
  increase: "Увеличить",
  tools: "Инструмент",
  priceZones: "Ценовые зоны",
  addPriceZone: "Добавить зону",
  editPriceZone: "Изменить зону",
  fillEmpty: "Заполнить",
  clear: "Очистить",
  reset: "Отменить",
  screen: "Экран",
  aisle: "Проход",
  row: "Ряд",
  seat: "место",
  seats: "мест",
  rowsCount: "рядов",
  version: "версия",
  noLayout: "не сохранена",
  save: "Сохранить",
  saved: "Сохранено",
  noZonesTitle: "Нет ценовых зон",
  noZonesDescription: "Добавьте первую зону, например «Стандарт» ×1",
} as const;
