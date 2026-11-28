"use client";

import { formatCalendarDate, formatTimeInZone, joinClassNames, toDateInTimeZone } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import { useEffect } from "react";
import type { ICheckInResult } from "@/entities/ticket-check-in";
import { SCAN_TICKET_TEXT } from "@/features/scan-ticket/constants/scan-ticket.constant";

interface ICheckInResultOverlayProps {
  result: ICheckInResult | null;
  timeZone: string;
  onClose: () => void;
}

const formatInstant = (iso: string, timeZone: string): string =>
  `${formatCalendarDate(toDateInTimeZone(iso, timeZone))}, ${formatTimeInZone(iso, timeZone)}`;

export const CheckInResultOverlay = ({ result, timeZone, onClose }: ICheckInResultOverlayProps) => {
  useEffect(() => {
    if (!result) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result, onClose]);

  if (!result) return null;

  const { allowed, message, ticket } = result;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={allowed ? SCAN_TICKET_TEXT.allowedTitle : SCAN_TICKET_TEXT.deniedTitle}
      className={joinClassNames(
        "fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-white sm:p-10",
        allowed ? "bg-emerald-700" : "bg-red-700",
      )}
    >
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 text-center">
        <div
          className={joinClassNames(
            "grid size-24 place-items-center rounded-full border-4 border-white/30",
            allowed ? "bg-emerald-600" : "bg-red-600",
          )}
        >
          <Icon name={allowed ? "check" : "close"} className="size-12 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            {allowed ? SCAN_TICKET_TEXT.allowedTitle : SCAN_TICKET_TEXT.deniedTitle}
          </h2>
          <p className="text-lg font-medium text-white/95 sm:text-xl">{message}</p>
        </div>

        {ticket && (
          <div className="w-full space-y-3 rounded-2xl bg-black/20 p-5 text-left backdrop-blur-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl font-bold text-white">{ticket.filmTitle}</p>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold text-white">
                {ticket.ageRating}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-sm text-white/90 sm:grid-cols-2">
              <p>{ticket.hallName}</p>
              <p className="tabular-nums sm:text-right">{formatInstant(ticket.startsAt, timeZone)}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3">
              <span className="font-display text-2xl font-bold text-white">
                {SCAN_TICKET_TEXT.seatSummary(ticket.row, ticket.number)}
              </span>
              <span className="rounded-lg bg-white/15 px-2.5 py-1 font-mono text-sm font-semibold text-white">
                {ticket.code}
              </span>
            </div>

            {!allowed && ticket.usedAt && (
              <div className="rounded-xl bg-black/25 px-3.5 py-2.5 text-sm text-white/95">
                <p className="font-semibold">
                  {SCAN_TICKET_TEXT.usedInfoLabel}: {formatInstant(ticket.usedAt, timeZone)}
                </p>
                {ticket.usedByName && <p className="text-white/85">{SCAN_TICKET_TEXT.usedByLabel(ticket.usedByName)}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full max-w-lg rounded-xl bg-white px-6 py-4 font-display text-lg font-bold text-ink shadow-lg transition-transform active:scale-99"
      >
        {SCAN_TICKET_TEXT.nextScanButton}
      </button>
    </div>
  );
};
