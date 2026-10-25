import { joinClassNames } from "@luch/shared/lib";
import { SEAT_SHAPE_CLASSES, SEAT_TYPE_LABELS, SEAT_TYPES } from "@/entities/hall";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { INumberedSeat } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";

interface ILayoutLegendProps {
  seats: readonly INumberedSeat[];
  rows: number;
}

export const LayoutLegend = ({ seats, rows }: ILayoutLegendProps) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
    {Object.values(SEAT_TYPES).map((type) => (
      <span key={type} className="inline-flex items-center gap-2">
        <span className={joinClassNames("size-4 bg-gray-400", SEAT_SHAPE_CLASSES[type])} />
        {SEAT_TYPE_LABELS[type]}
      </span>
    ))}
    <span className="inline-flex items-center gap-2">
      <span className="size-4 rounded-md border border-dashed border-gray-300 bg-white" />
      {EDIT_LAYOUT_TEXT.aisle}
    </span>
    <span className="text-ink sm:ml-auto">
      {EDIT_LAYOUT_TEXT.seatsCount}: <b className="tabular-nums">{seats.length}</b> · {EDIT_LAYOUT_TEXT.rowsCount}:{" "}
      <b className="tabular-nums">{rows}</b>
    </span>
  </div>
);
