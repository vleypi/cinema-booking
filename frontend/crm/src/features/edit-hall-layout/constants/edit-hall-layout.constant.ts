import { SEAT_TYPES } from "@/entities/hall";
import type { Brush } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

export const LAYOUT_LIMITS = {
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
  { value: BRUSH_KINDS.zone, label: "Сменить зону" },
  { value: BRUSH_KINDS.aisle, label: "Проход" },
];

export const EDIT_LAYOUT_TEXT = {
  title: "Схема зала",
  description: "Выберите кисть и проведите по сетке. Пустые клетки становятся проходами, ряды и места нумеруются сами",
  columns: "Ширина ряда с проходами",
  rows: "Рядов",
  brush: "Кисть",
  priceZone: "Ценовая зона",
  fillEmpty: "Заполнить пустые",
  clear: "Очистить",
  reset: "Отменить изменения",
  screen: "Экран",
  aisle: "Проход",
  row: "Ряд",
  seat: "место",
  seatsCount: "Мест",
  rowsCount: "Рядов",
  version: "Версия схемы",
  noLayout: "Схема еще не сохранена",
  versionHint: "Сохранение создает новую версию. Уже поставленные сеансы останутся на прежней схеме",
  save: "Сохранить схему",
  saved: "Схема сохранена",
  emptyLayout: "Добавьте на схему хотя бы одно место",
  noZonesTitle: "Сначала добавьте ценовую зону",
  noZonesDescription: "Каждое место относится к зоне, от нее зависит цена. Начните с зоны «Стандарт» с коэффициентом 1",
} as const;
