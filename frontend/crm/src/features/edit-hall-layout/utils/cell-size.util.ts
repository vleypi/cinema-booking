import { CELL_SIZES } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";

export const getCellSizeClassName = (columns: number): string =>
  (CELL_SIZES.find(({ maxColumns }) => columns <= maxColumns) ?? CELL_SIZES[CELL_SIZES.length - 1]).className;
