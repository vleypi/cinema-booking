"use client";

import { formatRubles, joinClassNames } from "@luch/shared/lib";
import type { IBoxOfficePriceZone, IBoxOfficeSeat } from "@/entities/box-office";
import { BOX_OFFICE_SELL_TEXT, SEAT_TYPE_LABELS } from "@/features/box-office-sell/constants/box-office-sell.constant";

interface IBoxOfficeSeatMapProps {
  seats: readonly IBoxOfficeSeat[];
  priceZones: readonly IBoxOfficePriceZone[];
  selectedIds: readonly string[];
  disabled?: boolean;
  onToggleSeat: (seatId: string) => void;
}

const ZONE_BUTTON_STYLES = [
  "border-gray-300 bg-white text-ink hover:border-brand hover:bg-brand-soft/60",
  "border-sage bg-canvas text-ink hover:border-brand hover:bg-brand-soft",
  "border-amber-400 bg-amber-50 text-ink hover:border-amber-500 hover:bg-amber-100",
] as const;

const ZONE_DOT_STYLES = ["border border-gray-300 bg-white", "border border-sage bg-canvas", "border border-amber-400 bg-amber-100"] as const;

const getZoneStyleIndex = (order: number, count: number): number =>
  count <= 1 ? 0 : Math.round((order * (ZONE_BUTTON_STYLES.length - 1)) / (count - 1));

export const BoxOfficeSeatMap = ({ seats, priceZones, selectedIds, disabled = false, onToggleSeat }: IBoxOfficeSeatMapProps) => {
  const selectedSet = new Set(selectedIds);
  const zoneOrder = new Map(priceZones.map((zone, index) => [zone.id, index]));

  const maxCol = Math.max(...seats.map((seat) => seat.posX), 0);
  const rowEntries = new Map<number, { rowNumber: number; seatsByCol: Map<number, IBoxOfficeSeat> }>();

  for (const seat of seats) {
    const existing = rowEntries.get(seat.posY);
    if (existing) {
      existing.seatsByCol.set(seat.posX, seat);
    } else {
      rowEntries.set(seat.posY, { rowNumber: seat.row, seatsByCol: new Map([[seat.posX, seat]]) });
    }
  }

  const orderedRows = [...rowEntries.entries()].toSorted(([first], [second]) => first - second);
  const columns = Array.from({ length: maxCol + 1 }, (_, index) => index);

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-6 flex flex-col items-center gap-1.5">
        <div className="h-1.5 w-full max-w-md rounded-full bg-gradient-to-r from-gray-200 via-brand to-gray-200" />
        <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">{BOX_OFFICE_SELL_TEXT.screen}</span>
      </div>

      <div className="overflow-x-auto pb-3">
        <div className="mx-auto grid w-max gap-2">
          {orderedRows.map(([posY, { rowNumber, seatsByCol }]) => (
            <div key={posY} className="flex items-center gap-3">
              <span className="w-6 text-right text-xs font-medium text-gray-400 tabular-nums">{rowNumber}</span>
              <div className="flex items-center gap-1.5">
                {columns.map((col) => {
                  const seat = seatsByCol.get(col);
                  if (!seat) {
                    return <span key={col} aria-hidden className="inline-block h-9 w-9 shrink-0" />;
                  }

                  const isSelected = selectedSet.has(seat.id);
                  const zoneIndex = getZoneStyleIndex(zoneOrder.get(seat.priceZoneId) ?? 0, priceZones.length);
                  const priceText = formatRubles(seat.price);
                  const typeLabel = SEAT_TYPE_LABELS[seat.type];

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={disabled || !seat.isAvailable}
                      aria-pressed={isSelected}
                      aria-label={BOX_OFFICE_SELL_TEXT.seatAriaLabel(seat.row, seat.number, typeLabel, priceText, seat.isAvailable, isSelected)}
                      title={`${BOX_OFFICE_SELL_TEXT.seatSummary(seat.row, seat.number)}, ${typeLabel}, ${priceText}`}
                      onClick={() => onToggleSeat(seat.id)}
                      className={joinClassNames(
                        "flex h-9 shrink-0 items-center justify-center rounded-lg border text-xs font-medium tabular-nums transition-colors",
                        seat.type === "SOFA" ? "w-14" : "w-9",
                        !seat.isAvailable
                          ? "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300"
                          : isSelected
                            ? "border-brand bg-brand text-white"
                            : ZONE_BUTTON_STYLES[zoneIndex],
                      )}
                    >
                      {seat.type === "WHEELCHAIR" ? (
                        <span className="inline-flex items-center gap-0.5">
                          <span>{seat.number}</span>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="h-3 w-3">
                            <circle cx="8" cy="3.2" r="1.2" fill="currentColor" stroke="none" />
                            <path d="M8 5.5v3.5h3l1 3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.2 8.2a3.2 3.2 0 1 0 3.4 4.3" strokeLinecap="round" />
                          </svg>
                        </span>
                      ) : (
                        seat.number
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-left text-xs font-medium text-gray-400 tabular-nums">{rowNumber}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">
        {priceZones.map((zone, index) => (
          <span key={zone.id} className="inline-flex items-center gap-1.5">
            <span className={joinClassNames("size-3 rounded-xs", ZONE_DOT_STYLES[getZoneStyleIndex(index, priceZones.length)])} />
            <span>
              {zone.name} <strong className="font-semibold text-ink">{formatRubles(zone.price)}</strong>
            </span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-xs bg-brand" />
          <span>{BOX_OFFICE_SELL_TEXT.legendSelected}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-xs bg-gray-200" />
          <span>{BOX_OFFICE_SELL_TEXT.legendOccupied}</span>
        </span>
      </div>
    </div>
  );
};
