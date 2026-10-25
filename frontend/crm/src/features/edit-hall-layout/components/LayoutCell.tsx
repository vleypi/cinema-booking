import { joinClassNames } from "@luch/shared/lib";
import { getPriceZoneColor, type IPriceZone, SEAT_SHAPE_CLASSES, SEAT_TYPE_LABELS } from "@/entities/hall";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import type { INumberedSeat } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";
import { CELL_KEY_ATTRIBUTE } from "@/features/edit-hall-layout/hooks/usePaintGesture";

interface ILayoutCellProps {
  cellKey: string;
  seat: INumberedSeat | undefined;
  priceZones: readonly IPriceZone[];
  onPaint: (key: string) => void;
}

const describeSeat = (seat: INumberedSeat | undefined, priceZones: readonly IPriceZone[]): string => {
  if (!seat) return EDIT_LAYOUT_TEXT.aisle;
  const zoneName = priceZones.find(({ id }) => id === seat.priceZoneId)?.name ?? "";

  return `${EDIT_LAYOUT_TEXT.row} ${seat.row}, ${EDIT_LAYOUT_TEXT.seat} ${seat.number}. ${SEAT_TYPE_LABELS[seat.type]}, ${zoneName}`;
};

export const LayoutCell = ({ cellKey, seat, priceZones, onPaint }: ILayoutCellProps) => {
  const description = describeSeat(seat, priceZones);

  return (
    <button
      type="button"
      {...{ [CELL_KEY_ATTRIBUTE]: cellKey }}
      aria-label={description}
      title={description}
      onClick={() => onPaint(cellKey)}
      className={joinClassNames(
        "grid size-7 shrink-0 place-items-center text-xs font-semibold tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        seat
          ? joinClassNames(getPriceZoneColor(priceZones, seat.priceZoneId), SEAT_SHAPE_CLASSES[seat.type])
          : "rounded-md border border-dashed border-gray-300 bg-white hover:border-gray-400",
      )}
    >
      {seat?.number}
    </button>
  );
};
