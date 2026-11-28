"use client";

import { ApiError } from "@luch/shared/api";
import { formatRubles, joinClassNames } from "@luch/shared/lib";
import { useState } from "react";
import { Button, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { type IOrder, type ISessionSeat, useCreateOnlinePayment, useCreateOrder } from "@/entities/order";
import { ADULT_AGE_RATING, BOOK_SEATS_TEXT, SEAT_TYPE_LABELS } from "@/features/book-seats/constants/book-seats.constant";
import { useHoldTimer } from "@/features/book-seats/hooks/useHoldTimer";
import { createCheckoutSchema } from "@/features/book-seats/schemas/checkout.schema";

interface ICheckoutFormProps {
  sessionId: string;
  ageRating: string;
  selectedSeats: readonly ISessionSeat[];
  totalAmount: number;
  onBackToSeats: () => void;
  onOrderCreated: (order: IOrder | null) => void;
  activeOrder: IOrder | null;
}

const INPUT_CLASS_NAME =
  "w-full rounded-frame border border-paper/18 bg-ink px-3.5 py-2.5 text-sm text-paper placeholder:text-paper/32 focus:border-warm focus:outline-none";

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const fieldMessages = Object.values(error.fieldErrors).flat();

    return fieldMessages[0] ?? error.message;
  }

  return BOOK_SEATS_TEXT.fallbackError;
};

export const CheckoutForm = ({
  sessionId,
  ageRating,
  selectedSeats,
  totalAmount,
  onBackToSeats,
  onOrderCreated,
  activeOrder,
}: ICheckoutFormProps) => {
  const requiresAge = ageRating === ADULT_AGE_RATING;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createOrder = useCreateOrder();
  const createPayment = useCreateOnlinePayment();
  const timer = useHoldTimer(activeOrder?.holdExpiresAt ?? null);

  const proceedToPayment = async (orderId: string) => {
    setSubmitError(null);
    try {
      const payment = await createPayment.mutateAsync(orderId);
      if (payment.confirmationUrl) {
        window.location.assign(payment.confirmationUrl);

        return;
      }
      setSubmitError(BOOK_SEATS_TEXT.paymentReadyFallback);
    } catch (error) {
      setSubmitError(extractErrorMessage(error));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const parsed = createCheckoutSchema(requiresAge).safeParse({
      email,
      name: name || undefined,
      phone: phone || undefined,
      privacyAccepted,
      ageConfirmed,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);

      return;
    }

    setFieldErrors({});

    try {
      const order = await createOrder.mutateAsync({
        sessionId,
        seatIds: selectedSeats.map((seat) => seat.id),
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        privacyAccepted: parsed.data.privacyAccepted,
        ageConfirmed: requiresAge ? parsed.data.ageConfirmed : undefined,
      });
      onOrderCreated(order);
      await proceedToPayment(order.id);
    } catch (error) {
      setSubmitError(extractErrorMessage(error));
    }
  };

  if (activeOrder) {
    return (
      <div className={joinClassNames(PANEL_CLASS_NAME, "grid gap-5 bg-ink-2 p-5 sm:p-6")}>
        <div className="grid gap-1">
          <span className={MONO_LABEL_CLASS_NAME}>{BOOK_SEATS_TEXT.holdOrderNumber(activeOrder.number)}</span>
          <h2 className="font-display text-2xl font-medium uppercase">{BOOK_SEATS_TEXT.holdTitle}</h2>
        </div>

        <div className="flex items-baseline justify-between border-y border-paper/13 py-4">
          <span className="text-sm text-paper/64">{BOOK_SEATS_TEXT.holdTimerLabel}</span>
          <span className={joinClassNames("font-mono text-2xl font-medium tabular-nums", timer.isExpired ? "text-signal" : "text-warm")}>
            {timer.formattedTime}
          </span>
        </div>

        <div className="flex items-baseline justify-between text-base">
          <span className="text-paper/64">{BOOK_SEATS_TEXT.totalLabel}</span>
          <span className="font-mono text-xl font-medium">{formatRubles(activeOrder.totalAmount)}</span>
        </div>

        {timer.isExpired ? (
          <div className="grid gap-3">
            <p className="text-sm text-signal">{BOOK_SEATS_TEXT.holdExpired}</p>
            <Button variant="ghost" onClick={() => onOrderCreated(null)}>
              {BOOK_SEATS_TEXT.chooseAgainButton}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {submitError && <p className="text-sm text-signal">{submitError}</p>}
            <Button disabled={createPayment.isPending} onClick={() => void proceedToPayment(activeOrder.id)}>
              {createPayment.isPending ? BOOK_SEATS_TEXT.payingButton : BOOK_SEATS_TEXT.payButton}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className={joinClassNames(PANEL_CLASS_NAME, "mx-auto grid max-w-2xl gap-6 bg-ink-2 p-5 sm:p-8")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-display text-2xl font-medium uppercase">{BOOK_SEATS_TEXT.checkoutTitle}</h2>
          <p className="text-sm text-paper/64">{BOOK_SEATS_TEXT.checkoutNote}</p>
        </div>
        <Button variant="ghost" size="small" onClick={onBackToSeats}>
          {BOOK_SEATS_TEXT.changeSeatsButton}
        </Button>
      </div>

      <div className="grid gap-2 border-y border-paper/13 py-4">
        <ul className="grid gap-2">
          {selectedSeats.map((seat) => (
            <li key={seat.id} className="flex items-center justify-between gap-3 rounded-frame bg-ink-3 px-3.5 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-paper">{BOOK_SEATS_TEXT.seatSummary(seat.row, seat.number)}</p>
                <p className="text-xs text-paper/56">{SEAT_TYPE_LABELS[seat.type]}</p>
              </div>
              <span className="font-mono text-sm font-medium">{formatRubles(seat.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between pt-2">
          <span className="text-sm text-paper/64">{BOOK_SEATS_TEXT.totalLabel}</span>
          <span className="font-mono text-xl font-medium">{formatRubles(totalAmount)}</span>
        </div>
      </div>

      <div className="grid gap-3.5">
        <label className="grid gap-1.5 text-sm">
          <span className="text-paper/72">{BOOK_SEATS_TEXT.emailLabel}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={BOOK_SEATS_TEXT.emailPlaceholder}
            className={INPUT_CLASS_NAME}
          />
          {fieldErrors.email && <span className="text-xs text-signal">{fieldErrors.email}</span>}
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-paper/72">{BOOK_SEATS_TEXT.nameLabel}</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={BOOK_SEATS_TEXT.namePlaceholder}
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-paper/72">{BOOK_SEATS_TEXT.phoneLabel}</span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={BOOK_SEATS_TEXT.phonePlaceholder}
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label className="flex items-start gap-2.5 text-xs text-paper/72">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(event) => setPrivacyAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-warm"
          />
          <span>{BOOK_SEATS_TEXT.privacyLabel}</span>
        </label>
        {fieldErrors.privacyAccepted && <span className="text-xs text-signal">{fieldErrors.privacyAccepted}</span>}

        {requiresAge && (
          <>
            <label className="flex items-start gap-2.5 text-xs text-paper/72">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-warm"
              />
              <span>{BOOK_SEATS_TEXT.ageLabel}</span>
            </label>
            {fieldErrors.ageConfirmed && <span className="text-xs text-signal">{fieldErrors.ageConfirmed}</span>}
          </>
        )}
      </div>

      {submitError && <p className="text-sm text-signal">{submitError}</p>}

      <Button type="submit" disabled={selectedSeats.length === 0 || createOrder.isPending || createPayment.isPending}>
        {createOrder.isPending ? BOOK_SEATS_TEXT.reservingButton : BOOK_SEATS_TEXT.reserveButton}
      </Button>
    </form>
  );
};
