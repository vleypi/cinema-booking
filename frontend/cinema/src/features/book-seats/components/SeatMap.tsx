"use client";

import { formatRubles, joinClassNames } from "@luch/shared/lib";
import type { ReactNode } from "react";
import { MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import type { ISessionPriceZone, ISessionSeat } from "@/entities/order";
import { BOOK_SEATS_TEXT, SEAT_TYPE_LABELS } from "@/features/book-seats/constants/book-seats.constant";

interface ISeatMapProps {
  seats: readonly ISessionSeat[];
  priceZones: readonly ISessionPriceZone[];
  selectedIds: readonly string[];
  disabled?: boolean;
  onToggleSeat: (seatId: string) => void;
  footer?: ReactNode;
}

const ZONE_BUTTON_STYLES = [
  "border-paper/35 bg-ink-3 text-paper hover:border-warm",
  "border-warm/50 bg-warm/15 text-paper hover:border-warm",
  "border-signal/60 bg-signal/15 text-paper hover:border-signal",
] as const;

const ZONE_DOT_STYLES = ["bg-paper/45", "bg-warm/75", "bg-signal/80"] as const;

const getZoneStyleIndex = (order: number, count: number): number =>
  count <= 1 ? 0 : Math.round((order * (ZONE_BUTTON_STYLES.length - 1)) / (count - 1));

export const SeatMap = ({ seats, priceZones, selectedIds, disabled = false, onToggleSeat, footer }: ISeatMapProps) => {
  const selectedSet = new Set(selectedIds);
  const zoneOrder = new Map(priceZones.map((zone, index) => [zone.id, index]));

  const maxCol = Math.max(...seats.map((seat) => seat.posX), 0);
  const rowEntries = new Map<number, { rowNumber: number; seatsByCol: Map<number, ISessionSeat> }>();

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
    <div className={joinClassNames(PANEL_CLASS_NAME, "bg-ink-2 p-5 sm:p-8 lg:p-10")}>
      <div className="mb-8 flex flex-col items-center gap-2.5">
        <div className="h-1.5 w-full max-w-2xl rounded-full bg-gradient-to-r from-paper/10 via-warm/75 to-paper/10" />
        <span className={MONO_LABEL_CLASS_NAME}>{BOOK_SEATS_TEXT.screen}</span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="mx-auto grid w-max gap-2.5 sm:gap-3">
          {orderedRows.map(([posY, { rowNumber, seatsByCol }]) => (
            <div key={posY} className="flex items-center gap-4 sm:gap-5">
              <span className="w-6 text-right font-mono text-xs text-paper/45 tabular-nums sm:text-sm">{rowNumber}</span>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {columns.map((col) => {
                  const seat = seatsByCol.get(col);
                  if (!seat) {
                    return <span key={col} aria-hidden className="inline-block h-10 w-10 shrink-0 sm:h-11 sm:w-11" />;
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
                      aria-label={BOOK_SEATS_TEXT.seatAriaLabel(seat.row, seat.number, typeLabel, priceText, seat.isAvailable, isSelected)}
                      title={`${BOOK_SEATS_TEXT.seatSummary(seat.row, seat.number)}, ${typeLabel}, ${priceText}`}
                      onClick={() => onToggleSeat(seat.id)}
                      className={joinClassNames(
                        "flex h-10 shrink-0 items-center justify-center rounded-frame border font-mono text-xs font-medium tabular-nums transition-colors duration-150 sm:h-11 sm:text-sm",
                        seat.type === "SOFA" ? "w-15 sm:w-16" : "w-10 sm:w-11",
                        !seat.isAvailable
                          ? "cursor-not-allowed border-paper/8 bg-paper/6 text-paper/20"
                          : isSelected
                            ? "border-warm bg-warm text-ink"
                            : ZONE_BUTTON_STYLES[zoneIndex],
                      )}
                    >
                      {seat.type === "WHEELCHAIR" ? (
                        <span className="inline-flex items-center gap-0.5">
                          <span>{seat.number}</span>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="h-3.5 w-3.5">
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
              <span className="w-6 text-left font-mono text-xs text-paper/45 tabular-nums sm:text-sm">{rowNumber}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-paper/13 pt-5 text-xs text-paper/72 sm:text-sm">
        {priceZones.map((zone, index) => (
          <span key={zone.id} className="inline-flex items-center gap-2">
            <span className={joinClassNames("h-3 w-3 rounded-xs", ZONE_DOT_STYLES[getZoneStyleIndex(index, priceZones.length)])} />
            <span>
              {zone.name} <b className="ml-1 font-mono font-medium text-paper">{formatRubles(zone.price)}</b>
            </span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-xs bg-warm" />
          <span>{BOOK_SEATS_TEXT.legendSelected}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-xs border border-paper/10 bg-paper/8" />
          <span>{BOOK_SEATS_TEXT.legendOccupied}</span>
        </span>
      </div>

      {footer && <div className="mt-6 border-t border-paper/13 pt-6">{footer}</div>}
    </div>
  );
};
