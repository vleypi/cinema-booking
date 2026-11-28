"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@luch/shared/api";
import {
  applyServerErrors,
  formatDayTitle,
  formatRubles,
  formatTimeInZone,
  getTodayInTimeZone,
  joinClassNames,
  SERVER_ERROR_FIELD,
  shiftDate,
} from "@luch/shared/lib";
import { Button, FormError, Icon, TextField } from "@luch/shared/ui";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { ICinemaSummary } from "@/shared/api";
import { Badge, CARD_CLASS_NAME, EmptyState, TOOLBAR_CONTROL_CLASS_NAME } from "@/shared/ui";
import {
  BOX_OFFICE_PAYMENT_METHOD_LABELS,
  type BoxOfficePaymentMethod,
  boxOfficeService,
  type IBoxOfficeOrder,
  PRINT_FORMAT_LABELS,
  useBoxOfficeSessions,
  useBoxOfficeSessionSeats,
} from "@/entities/box-office";
import { BoxOfficeSeatMap } from "@/features/box-office-sell/components/BoxOfficeSeatMap";
import { BOX_OFFICE_SELL_TEXT } from "@/features/box-office-sell/constants/box-office-sell.constant";
import { useCreateBoxOfficeOrder } from "@/features/box-office-sell/hooks/useCreateBoxOfficeOrder";
import { type BoxOfficeOrderFormValues, boxOfficeOrderSchema } from "@/features/box-office-sell/schemas/box-office-order.schema";

interface IBoxOfficeSellTabProps {
  cinema: ICinemaSummary;
}

const PAYMENT_METHODS: readonly BoxOfficePaymentMethod[] = ["CASH", "CARD_TERMINAL"];
const DAY_NAV_BUTTON_CLASS = joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "grid w-8 place-items-center text-gray-600");

export const BoxOfficeSellTab = ({ cinema }: IBoxOfficeSellTabProps) => {
  const today = useMemo(() => getTodayInTimeZone(cinema.timezone), [cinema.timezone]);
  const [date, setDate] = useState(today);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [completedOrder, setCompletedOrder] = useState<IBoxOfficeOrder | null>(null);

  const { data: sessions, isPending: areSessionsPending } = useBoxOfficeSessions(cinema.id, date);
  const activeSessionId = sessions?.some((session) => session.id === selectedSessionId) ? selectedSessionId : null;
  const { data: seatsData, isPending: areSeatsPending, refetch: refetchSeats } = useBoxOfficeSessionSeats(cinema.id, activeSessionId);
  const createOrder = useCreateBoxOfficeOrder(cinema.id);

  const form = useForm<BoxOfficeOrderFormValues>({
    resolver: zodResolver(boxOfficeOrderSchema),
    defaultValues: {
      paymentMethod: "CASH",
      email: "",
      name: "",
      phone: "",
    },
  });

  const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" });

  const selectedSeats = useMemo(() => {
    if (!seatsData) return [];
    const selectedSet = new Set(selectedSeatIds);
    return seatsData.seats
      .filter((seat) => seat.isAvailable && selectedSet.has(seat.id))
      .toSorted((first, second) => first.row - second.row || first.number - second.number);
  }, [seatsData, selectedSeatIds]);

  const totalAmount = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    setSelectedSessionId(null);
    setSelectedSeatIds([]);
    setCompletedOrder(null);
    form.clearErrors();
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSelectedSeatIds([]);
    setCompletedOrder(null);
    form.clearErrors();
  };

  const handleToggleSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => (prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]));
    form.clearErrors("root");
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!activeSessionId || selectedSeats.length === 0) return;

    try {
      const order = await createOrder.mutateAsync({
        sessionId: activeSessionId,
        seatIds: selectedSeats.map((seat) => seat.id),
        paymentMethod: values.paymentMethod,
        ...(values.email && { email: values.email }),
        ...(values.name && { name: values.name }),
        ...(values.phone && { phone: values.phone }),
      });

      setCompletedOrder(order);
      setSelectedSeatIds([]);
      form.reset({ paymentMethod: values.paymentMethod, email: "", name: "", phone: "" });
    } catch (error) {
      if (error instanceof ApiError) {
        const seatError = error.fieldErrors.seatIds?.[0];
        if (seatError) {
          form.setError(SERVER_ERROR_FIELD, { message: seatError });
        } else {
          applyServerErrors(error, form.setError);
        }
        void refetchSeats();
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDateChange(shiftDate(date, -1))}
            aria-label={BOX_OFFICE_SELL_TEXT.previousDay}
            className={DAY_NAV_BUTTON_CLASS}
          >
            <Icon name="chevronLeft" className="size-4" />
          </button>
          <input
            type="date"
            value={date}
            aria-label={BOX_OFFICE_SELL_TEXT.dateLabel}
            onChange={(event) => event.target.value && handleDateChange(event.target.value)}
            className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
          />
          <button
            type="button"
            onClick={() => handleDateChange(shiftDate(date, 1))}
            aria-label={BOX_OFFICE_SELL_TEXT.nextDay}
            className={DAY_NAV_BUTTON_CLASS}
          >
            <Icon name="chevronRight" className="size-4" />
          </button>
        </div>
        <p className="text-base font-semibold text-ink first-letter:uppercase">{formatDayTitle(date)}</p>
        {date !== today && (
          <Button variant="ghost" className="px-3 py-1.5" onClick={() => handleDateChange(today)}>
            {BOX_OFFICE_SELL_TEXT.today}
          </Button>
        )}
      </div>

      {areSessionsPending && <div className="h-28 animate-pulse rounded-xl bg-gray-100" />}

      {!areSessionsPending && (!sessions || sessions.length === 0) && (
        <EmptyState
          icon="calendar"
          title={BOX_OFFICE_SELL_TEXT.noSessionsTitle}
          description={BOX_OFFICE_SELL_TEXT.noSessionsDescription}
        />
      )}

      {!areSessionsPending && sessions && sessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">{BOX_OFFICE_SELL_TEXT.sessionsHeading}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const isSelected = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelectSession(session.id)}
                  className={joinClassNames(
                    "flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                    isSelected
                      ? "border-brand bg-brand-soft/60 ring-1 ring-brand"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-bold text-ink tabular-nums">
                      {formatTimeInZone(session.startsAt, cinema.timezone)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge tone="brand">{session.format}</Badge>
                      <Badge tone="neutral">{session.film.ageRating}</Badge>
                    </div>
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold text-ink">{session.film.title}</p>
                  <p className="text-xs text-gray-500">{session.hall.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {completedOrder && (
        <div className={joinClassNames(CARD_CLASS_NAME, "border-brand/30 bg-brand-soft/40 p-5")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold text-ink">
                {BOX_OFFICE_SELL_TEXT.successTitle(completedOrder.number)}
              </h3>
              <p className="text-sm text-gray-600">{BOX_OFFICE_SELL_TEXT.successSubtitle}</p>
              {completedOrder.contactEmail && (
                <p className="text-xs text-gray-600">{BOX_OFFICE_SELL_TEXT.successEmailSent(completedOrder.contactEmail)}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={boxOfficeService.getOrderPdfUrl(cinema.id, completedOrder.id, "a4")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-forest"
              >
                <Icon name="printer" className="size-4" />
                <span>{PRINT_FORMAT_LABELS.a4}</span>
              </a>
              <a
                href={boxOfficeService.getOrderPdfUrl(cinema.id, completedOrder.id, "receipt")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-gray-50"
              >
                <Icon name="printer" className="size-4" />
                <span>{PRINT_FORMAT_LABELS.receipt}</span>
              </a>
              <Button variant="ghost" onClick={() => setCompletedOrder(null)}>
                {BOX_OFFICE_SELL_TEXT.newSaleLabel}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-brand/15 pt-3">
            {completedOrder.tickets.map((ticket) => (
              <span
                key={ticket.id}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-ink"
              >
                <span>{BOX_OFFICE_SELL_TEXT.seatSummary(ticket.row, ticket.number)}</span>
                <span className="font-mono font-semibold text-brand">{ticket.code}</span>
                <span className="text-gray-500">{formatRubles(ticket.price)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!activeSessionId && sessions && sessions.length > 0 && !completedOrder && (
        <EmptyState
          icon="seats"
          title={BOX_OFFICE_SELL_TEXT.selectSessionTitle}
          description={BOX_OFFICE_SELL_TEXT.selectSessionDescription}
        />
      )}

      {activeSessionId && areSeatsPending && <div className="h-80 animate-pulse rounded-xl bg-gray-100" />}

      {activeSessionId && seatsData && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-ink">{seatsData.film.title}</h3>
                <p className="text-sm text-gray-500">
                  {formatTimeInZone(seatsData.startsAt, seatsData.cinema.timezone)}, {seatsData.hall.name}, {seatsData.format}
                </p>
              </div>
              <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => void refetchSeats()}>
                {BOX_OFFICE_SELL_TEXT.refreshSeatsLabel}
              </Button>
            </div>

            <BoxOfficeSeatMap
              seats={seatsData.seats}
              priceZones={seatsData.priceZones}
              selectedIds={selectedSeatIds}
              disabled={createOrder.isPending}
              onToggleSeat={handleToggleSeat}
            />
          </div>

          <form onSubmit={handleSubmit} className={joinClassNames(CARD_CLASS_NAME, "h-fit space-y-5 p-5")}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-ink">{BOX_OFFICE_SELL_TEXT.orderSummaryHeading}</h3>
              {selectedSeats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSeatIds([])}
                  className="text-xs font-medium text-gray-500 hover:text-ink"
                >
                  {BOX_OFFICE_SELL_TEXT.clearSelection}
                </button>
              )}
            </div>

            {selectedSeats.length === 0 ? (
              <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                {BOX_OFFICE_SELL_TEXT.selectedSeatsEmpty}
              </p>
            ) : (
              <div className="space-y-2">
                <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                  {selectedSeats.map((seat) => (
                    <li
                      key={seat.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-ink">{BOX_OFFICE_SELL_TEXT.seatSummary(seat.row, seat.number)}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink tabular-nums">{formatRubles(seat.price)}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSeat(seat.id)}
                          aria-label={BOX_OFFICE_SELL_TEXT.clearSelection}
                          className="text-gray-400 hover:text-ink"
                        >
                          <Icon name="close" className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-medium text-gray-600">{BOX_OFFICE_SELL_TEXT.totalLabel}</span>
                  <span className="font-display text-xl font-bold text-ink tabular-nums">{formatRubles(totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">{BOX_OFFICE_SELL_TEXT.paymentMethodLabel}</span>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => form.setValue("paymentMethod", method)}
                    className={joinClassNames(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      paymentMethod === method
                        ? "border-brand bg-brand text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {BOX_OFFICE_PAYMENT_METHOD_LABELS[method]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {BOX_OFFICE_SELL_TEXT.customerHeading}
              </p>
              <TextField
                label={BOX_OFFICE_SELL_TEXT.emailLabel}
                type="email"
                placeholder={BOX_OFFICE_SELL_TEXT.emailPlaceholder}
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <TextField
                label={BOX_OFFICE_SELL_TEXT.nameLabel}
                placeholder={BOX_OFFICE_SELL_TEXT.namePlaceholder}
                error={form.formState.errors.name?.message}
                {...form.register("name")}
              />
              <TextField
                label={BOX_OFFICE_SELL_TEXT.phoneLabel}
                placeholder={BOX_OFFICE_SELL_TEXT.phonePlaceholder}
                error={form.formState.errors.phone?.message}
                {...form.register("phone")}
              />
            </div>

            <FormError message={form.formState.errors.root?.server?.message} />

            <Button type="submit" disabled={selectedSeats.length === 0 || createOrder.isPending} className="w-full">
              {createOrder.isPending ? BOX_OFFICE_SELL_TEXT.submittingLabel : BOX_OFFICE_SELL_TEXT.submitLabel}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
