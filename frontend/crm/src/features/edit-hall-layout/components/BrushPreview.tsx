import { joinClassNames } from "@luch/shared/lib";
import { SEAT_SHAPE_CLASSES, SEAT_TYPES, type SeatType } from "@/entities/hall";
import { BRUSH_KINDS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { Brush } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

interface IBrushPreviewProps {
  brush: Brush;
  zoneColor: string;
}

const isSeatType = (brush: Brush): brush is SeatType => Object.values<string>(SEAT_TYPES).includes(brush);

const getPreviewClassName = (brush: Brush, zoneColor: string): string => {
  if (isSeatType(brush)) return joinClassNames(zoneColor, SEAT_SHAPE_CLASSES[brush]);
  if (brush === BRUSH_KINDS.zone) return joinClassNames(zoneColor, "rounded-full");

  return "rounded border border-dashed border-gray-400";
};

export const BrushPreview = ({ brush, zoneColor }: IBrushPreviewProps) => (
  <span aria-hidden className={joinClassNames("size-4 shrink-0", getPreviewClassName(brush, zoneColor))} />
);
