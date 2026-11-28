"use client";

import { ApiError } from "@luch/shared/api";
import { formatRubles, joinClassNames } from "@luch/shared/lib";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ROUTES } from "@/shared/config";
import { Button, CONTAINER_CLASS_NAME, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { type ICustomerRefundResult, useRefundByToken, useRefundByTokenPreview } from "@/entities/customer";
import { REFUND_PAGE_TEXT } from "@/views/refund/constants/refund.constant";

interface IRefundByTokenViewProps {
  token: string;
}

const formatSessionDateTime = (iso: string): string =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const RefundByTokenView = ({ token }: IRefundByTokenViewProps) => {
  const { data: preview, isPending, error } = useRefundByTokenPreview(token);
  const refundMutation = useRefundByToken();
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<ICustomerRefundResult | null>(null);

  const activeTickets = useMemo(
    () => preview?.tickets.filter((ticket) => ticket.status === "ACTIVE") ?? [],
    [preview],
  );

  const effectiveSelectedIds = useMemo(
    () => selectedIds ?? activeTickets.map((ticket) => ticket.id),
    [selectedIds, activeTickets],
  );

  const selectedTickets = useMemo(() => {
    const selectedSet = new Set(effectiveSelectedIds);
    return activeTickets.filter((ticket) => selectedSet.has(ticket.id));
  }, [activeTickets, effectiveSelectedIds]);

  const totalAmount = useMemo(() => selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0), [selectedTickets]);

  const handleToggle = (ticketId: string) => {
    setSelectedIds((prev) => {
      const current = prev ?? activeTickets.map((ticket) => ticket.id);
      return current.includes(ticketId) ? current.filter((id) => id !== ticketId) : [...current, ticketId];
    });
    setSubmitError(null);
  };

  const handleConfirm = async () => {
    if (selectedTickets.length === 0) return;
    setSubmitError(null);
    try {
      const result = await refundMutation.mutateAsync({
        token,
        ticketIds: selectedTickets.map((ticket) => ticket.id),
      });
      setCompleted(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      }
    }
  };

  return (
    <section className="px-gutter py-12 sm:py-16">
      <div className={joinClassNames(CONTAINER_CLASS_NAME, "max-w-2xl")}>
        <div className="mb-8 space-y-2">
          <p className={MONO_LABEL_CLASS_NAME}>{REFUND_PAGE_TEXT.eyebrow}</p>
          <h1 className="font-display text-3xl font-medium uppercase sm:text-4xl">{REFUND_PAGE_TEXT.title}</h1>
        </div>

        {!token && (
          <div className={joinClassNames(PANEL_CLASS_NAME, "space-y-4 bg-ink-2 p-6 sm:p-8")}>
            <h2 className="font-display text-xl font-medium uppercase">{REFUND_PAGE_TEXT.missingTokenTitle}</h2>
            <p className="text-sm text-paper/68">{REFUND_PAGE_TEXT.missingTokenDescription}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={ROUTES.home}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/28 px-5 text-sm font-medium hover:border-paper"
              >
                {REFUND_PAGE_TEXT.backHome}
              </Link>
              <Link
                href={ROUTES.cabinet}
                prefetch={false}
                className="inline-flex min-h-11 items-center rounded-full bg-warm px-5 text-sm font-medium text-ink hover:bg-warm/90"
              >
                {REFUND_PAGE_TEXT.goToCabinet}
              </Link>
            </div>
          </div>
        )}

        {token && isPending && <div className="h-64 animate-pulse rounded-frame bg-ink-2" />}

        {token && error && !completed && (
          <div className={joinClassNames(PANEL_CLASS_NAME, "space-y-4 bg-ink-2 p-6 sm:p-8")}>
            <h2 className="font-display text-xl font-medium uppercase">{REFUND_PAGE_TEXT.errorTitle}</h2>
            <p className="text-sm text-paper/72">{error instanceof ApiError ? error.message : REFUND_PAGE_TEXT.missingTokenDescription}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={ROUTES.home}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/28 px-5 text-sm font-medium hover:border-paper"
              >
                {REFUND_PAGE_TEXT.backHome}
              </Link>
            </div>
          </div>
        )}

        {completed && (
          <div className={joinClassNames(PANEL_CLASS_NAME, "space-y-4 bg-ink-2 p-6 sm:p-8")}>
            <h2 className="font-display text-2xl font-medium text-warm uppercase">{REFUND_PAGE_TEXT.successTitle}</h2>
            <p className="text-sm text-paper/80">{REFUND_PAGE_TEXT.successDescription(formatRubles(completed.amount))}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={ROUTES.home}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/28 px-5 text-sm font-medium hover:border-paper"
              >
                {REFUND_PAGE_TEXT.backHome}
              </Link>
              <Link
                href={ROUTES.cabinet}
                prefetch={false}
                className="inline-flex min-h-11 items-center rounded-full bg-warm px-5 text-sm font-medium text-ink hover:bg-warm/90"
              >
                {REFUND_PAGE_TEXT.goToCabinet}
              </Link>
            </div>
          </div>
        )}

        {preview && !completed && (
          <div className={joinClassNames(PANEL_CLASS_NAME, "space-y-6 bg-ink-2 p-6 sm:p-8")}>
            <div className="space-y-1.5">
              <p className={MONO_LABEL_CLASS_NAME}>{preview.orderNumber}</p>
              <h2 className="font-display text-2xl font-medium uppercase">{preview.filmTitle}</h2>
              <p className="text-sm text-paper/68">
                {preview.cinemaName}, {preview.hallName}, {formatSessionDateTime(preview.startsAt)}
              </p>
            </div>

            {activeTickets.length === 0 ? (
              <p className="text-sm text-paper/68">{REFUND_PAGE_TEXT.noActiveTickets}</p>
            ) : (
              <>
                <div className="space-y-3 border-t border-paper/13 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-paper/85">{REFUND_PAGE_TEXT.selectTicketsLabel}</span>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase">
                      <button
                        type="button"
                        onClick={() => setSelectedIds(activeTickets.map((ticket) => ticket.id))}
                        className="text-warm hover:underline"
                      >
                        {REFUND_PAGE_TEXT.selectAll}
                      </button>
                      <button type="button" onClick={() => setSelectedIds([])} className="text-paper/60 hover:text-paper">
                        {REFUND_PAGE_TEXT.clearAll}
                      </button>
                    </div>
                  </div>

                  <ul className="grid gap-2.5">
                    {activeTickets.map((ticket) => {
                      const isChecked = effectiveSelectedIds.includes(ticket.id);
                      return (
                        <li key={ticket.id}>
                          <label
                            className={joinClassNames(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-frame border p-3.5 transition-colors",
                              isChecked ? "border-warm bg-warm/10" : "border-paper/15 bg-ink-3 hover:border-paper/35",
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggle(ticket.id)}
                                className="size-4 accent-warm"
                              />
                              <span className="text-sm text-paper">{REFUND_PAGE_TEXT.seatLabel(ticket.row, ticket.number)}</span>
                              <span className="font-mono text-xs text-paper/56">{ticket.code}</span>
                            </span>
                            <span className="font-mono text-sm font-medium tabular-nums">{formatRubles(ticket.price)}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper/13 pt-5">
                  <div>
                    <p className={MONO_LABEL_CLASS_NAME}>{REFUND_PAGE_TEXT.totalLabel}</p>
                    <p className="font-mono text-2xl font-medium tabular-nums">{formatRubles(totalAmount)}</p>
                  </div>
                  <Button disabled={selectedTickets.length === 0 || refundMutation.isPending} onClick={() => void handleConfirm()}>
                    {refundMutation.isPending ? REFUND_PAGE_TEXT.submittingLabel : REFUND_PAGE_TEXT.submitLabel}
                  </Button>
                </div>

                {submitError && (
                  <p role="alert" className="rounded-frame border border-signal/40 bg-signal/15 px-4 py-3 text-sm text-paper">
                    {submitError}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
