"use client";

import { formatRubles, formatTimeInZone, joinClassNames } from "@luch/shared/lib";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/shared/config";
import { Button, ButtonLink, CONTAINER_CLASS_NAME, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { useCustomerMe } from "@/entities/customer";
import { type IOrder, useSessionSeats } from "@/entities/order";
import { BOOK_SEATS_TEXT, CheckoutForm, SeatMap, useSeatSelection } from "@/features/book-seats";
import { SESSION_BOOKING_TEXT } from "@/views/session-booking/constants/session-booking.constant";

interface ISessionBookingViewProps {
  sessionId: string;
}

type BookingStep = "seats" | "checkout";

const formatSessionDate = (iso: string, timeZone: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, day: "numeric", month: "long", weekday: "short" }).format(new Date(iso));

export const SessionBookingView = ({ sessionId }: ISessionBookingViewProps) => {
  const { data, isLoading, isError } = useSessionSeats(sessionId);
  const { data: customer } = useCustomerMe();
  const selection = useSeatSelection(data?.seats ?? []);
  const [step, setStep] = useState<BookingStep>("seats");
  const [activeOrder, setActiveOrder] = useState<IOrder | null>(null);

  return (
    <section className="min-h-svh px-gutter pt-[calc(var(--spacing-nav)+2rem)] pb-20">
      <div className={CONTAINER_CLASS_NAME}>
        {isLoading ? (
          <p className="py-16 text-paper/64">{SESSION_BOOKING_TEXT.loading}</p>
        ) : isError || !data ? (
          <div className={joinClassNames(PANEL_CLASS_NAME, "grid max-w-xl justify-items-start gap-5 bg-ink-2 p-6 sm:p-8")}>
            <p className="text-paper/72">{SESSION_BOOKING_TEXT.notFound}</p>
            <ButtonLink href={ROUTES.home} variant="ghost" size="small">
              {SESSION_BOOKING_TEXT.backToSchedule}
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-8">
            <div className="grid gap-3">
              <Link
                href={ROUTES.film(data.film.id)}
                className="inline-flex min-h-10 w-fit items-center font-mono text-xs tracking-[0.08em] text-paper/56 uppercase transition-colors hover:text-warm"
              >
                ← {SESSION_BOOKING_TEXT.backToFilm}
              </Link>
              <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-none font-medium uppercase">
                {data.film.title} <span className="text-paper/45">{data.film.ageRating}</span>
              </h1>
              <p className={joinClassNames(MONO_LABEL_CLASS_NAME, "flex flex-wrap items-center gap-x-5 gap-y-1 text-paper/64")}>
                <span>{data.cinema.name}</span>
                <span>{data.hall.name}</span>
                <span>{data.format}</span>
                <span className="text-paper">
                  {formatSessionDate(data.startsAt, data.cinema.timezone)}, {formatTimeInZone(data.startsAt, data.cinema.timezone)}
                </span>
              </p>
            </div>

            {step === "seats" && !activeOrder ? (
              <SeatMap
                seats={data.seats}
                priceZones={data.priceZones}
                selectedIds={selection.selectedIds}
                onToggleSeat={selection.toggleSeat}
                footer={
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="grid gap-2">
                      {selection.selectedSeats.length === 0 ? (
                        <p className="text-sm text-paper/56">{BOOK_SEATS_TEXT.emptySelection}</p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {selection.selectedSeats.map((seat) => (
                            <li key={seat.id} className="inline-flex items-center gap-2.5 rounded-frame bg-ink-3 px-3 py-1.5 text-sm">
                              <span className="text-paper">{BOOK_SEATS_TEXT.seatSummary(seat.row, seat.number)}</span>
                              <span className="font-mono text-xs text-paper/64">{formatRubles(seat.price)}</span>
                              <button
                                type="button"
                                aria-label={BOOK_SEATS_TEXT.removeSeat}
                                onClick={() => selection.toggleSeat(seat.id)}
                                className="text-paper/45 transition-colors hover:text-signal"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {selection.limitReached && <p className="text-xs text-warm">{BOOK_SEATS_TEXT.maxSeatsNotice}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="grid text-left sm:text-right">
                        <span className={MONO_LABEL_CLASS_NAME}>{BOOK_SEATS_TEXT.totalLabel}</span>
                        <span className="font-mono text-2xl leading-tight font-medium tabular-nums">{formatRubles(selection.totalAmount)}</span>
                      </div>
                      <Button disabled={selection.selectedSeats.length === 0} onClick={() => setStep("checkout")} className="min-w-36">
                        {BOOK_SEATS_TEXT.continueButton}
                      </Button>
                    </div>
                  </div>
                }
              />
            ) : (
              <CheckoutForm
                sessionId={data.sessionId}
                ageRating={data.film.ageRating}
                selectedSeats={selection.selectedSeats}
                totalAmount={selection.totalAmount}
                customer={customer}
                onBackToSeats={() => setStep("seats")}
                onOrderCreated={(order) => {
                  setActiveOrder(order);
                  if (!order) {
                    selection.clearSelection();
                    setStep("seats");
                  }
                }}
                activeOrder={activeOrder}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};
