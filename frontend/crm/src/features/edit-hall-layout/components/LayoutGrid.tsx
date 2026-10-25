"use client";

import type { IPriceZone } from "@/entities/hall";
import { LayoutCell } from "@/features/edit-hall-layout/components/LayoutCell";
import { RowLabel } from "@/features/edit-hall-layout/components/RowLabel";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";
import { usePaintGesture } from "@/features/edit-hall-layout/hooks/usePaintGesture";
import type { ILayoutDraft, INumberedSeat } from "@/features/edit-hall-layout/interfaces/layout-draft.interface";
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

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-8">
      <div className="mx-auto flex w-max flex-col items-center">
        <div className="mb-8 w-full max-w-lg px-8 text-center">
          <div className="h-1.5 rounded-full bg-gray-300" />
          <p className="mt-2 text-xs tracking-widest text-gray-500 uppercase">{EDIT_LAYOUT_TEXT.screen}</p>
        </div>
        <div {...gesture} className="flex touch-none flex-col gap-1 select-none">
          {range(draft.rows).map((posY) => (
            <div key={posY} className="flex items-center gap-1">
              <RowLabel number={rowNumbers.get(posY)} />
              {range(draft.columns).map((posX) => {
                const key = toCellKey(posX, posY);
                return <LayoutCell key={key} cellKey={key} seat={seatsByKey.get(key)} priceZones={priceZones} onPaint={onPaint} />;
              })}
              <RowLabel number={rowNumbers.get(posY)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
