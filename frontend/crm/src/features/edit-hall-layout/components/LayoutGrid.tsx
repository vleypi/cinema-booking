"use client";

import type { IPriceZone } from "@/entities/hall";
import { LayoutCell } from "@/features/edit-hall-layout/components/LayoutCell";
import { RowLabel } from "@/features/edit-hall-layout/components/RowLabel";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import { usePaintGesture } from "@/features/edit-hall-layout/hooks/usePaintGesture";
import type { ILayoutDraft, INumberedSeat } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";
import { getCellSizeClassName } from "@/features/edit-hall-layout/utils/cell-size.util";
import { range, toCellKey } from "@/features/edit-hall-layout/utils/layout-draft.util";

interface ILayoutGridProps {
  draft: ILayoutDraft;
  seats: readonly INumberedSeat[];
  priceZones: readonly IPriceZone[];
  onPaint: (key: string) => void;
}

export const LayoutGrid = ({ draft, seats, priceZones, onPaint }: ILayoutGridProps) => {
  const gesture = usePaintGesture(onPaint);
  const seatsByKey = new Map(seats.map((seat) => [toCellKey(seat.posX, seat.posY), seat]));
  const rowNumbers = new Map(seats.map(({ posY, row }) => [posY, row]));
  const cellSizeClassName = getCellSizeClassName(draft.columns);

  return (
    <div className="overflow-x-auto rounded-2xl bg-gray-50 px-6 py-12">
      <div className="mx-auto flex w-max flex-col items-center">
        <div className="mb-12 w-full px-10 text-center">
          <div className="h-6 rounded-t-[50%] border-t-4 border-gray-300" />
          <p className="-mt-3 text-xs tracking-[0.3em] text-gray-400 uppercase">{EDIT_LAYOUT_TEXT.screen}</p>
        </div>
        <div {...gesture} className="flex touch-none flex-col gap-1.5 select-none">
          {range(draft.rows).map((posY) => (
            <div key={posY} className="flex items-center gap-1.5">
              <RowLabel number={rowNumbers.get(posY)} />
              {range(draft.columns).map((posX) => {
                const key = toCellKey(posX, posY);
                return (
                  <LayoutCell
                    key={key}
                    cellKey={key}
                    seat={seatsByKey.get(key)}
                    priceZones={priceZones}
                    sizeClassName={cellSizeClassName}
                    onPaint={onPaint}
                  />
                );
              })}
              <RowLabel number={rowNumbers.get(posY)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
