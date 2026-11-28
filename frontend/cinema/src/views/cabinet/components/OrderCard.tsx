"use client";

import { ApiError } from "@luch/shared/api";
import { formatRubles, formatTimeInZone, joinClassNames } from "@luch/shared/lib";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { customerService, type ICustomerOrder, useCustomerRefundOrder } from "@/entities/customer";
import { CABINET_TEXT, ORDER_STATUS_LABELS, TICKET_STATUS_LABELS } from "@/views/cabinet/constants/cabinet.constant";

interface IOrderCardProps {
  order: ICustomerOrder;
}

const formatOrderDate = (iso: string, timeZone: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export const OrderCard = ({ order }: IOrderCardProps) => {
  const [openQrId, setOpenQrId] = useState<string | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [selectedRefundIds, setSelectedRefundIds] = useState<string[]>([]);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);
  const [renderedAtMs] = useState(() => Date.now());
  const refundMutation = useCustomerRefundOrder();

  const activeTickets = useMemo(() => order.tickets.filter((ticket) => ticket.status === "ACTIVE"), [order.tickets]);
  const canDownloadPdf = order.tickets.some((ticket) => ticket.status === "ACTIVE" || ticket.status === "USED");
  const canRefund = activeTickets.length > 0 && new Date(order.session.startsAt).getTime() > renderedAtMs;

  const selectedRefundTickets = useMemo(() => {
    const selectedSet = new Set(selectedRefundIds);
    return activeTickets.filter((ticket) => selectedSet.has(ticket.id));
  }, [activeTickets, selectedRefundIds]);

  const refundTotal = useMemo(
    () => selectedRefundTickets.reduce((sum, ticket) => sum + ticket.price, 0),
    [selectedRefundTickets],
  );

  const handleToggleRefundPanel = () => {
    if (!isRefundOpen) {
      setSelectedRefundIds(activeTickets.map((ticket) => ticket.id));
      setRefundError(null);
      setRefundSuccess(null);
    }
    setIsRefundOpen((prev) => !prev);
  };

  const handleToggleRefundTicket = (ticketId: string) => {
    setSelectedRefundIds((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]));
    setRefundError(null);
  };

  const handleConfirmRefund = async () => {
    if (selectedRefundTickets.length === 0) return;
    setRefundError(null);
    try {
      const result = await refundMutation.mutateAsync({
        orderId: order.id,
        ticketIds: selectedRefundTickets.map((ticket) => ticket.id),
      });
      setIsRefundOpen(false);
      setRefundSuccess(CABINET_TEXT.refundSuccess(formatRubles(result.amount)));
    } catch (error) {
      if (error instanceof ApiError) {
        setRefundError(error.message);
      }
    }
  };

  return (
    <article className={joinClassNames(PANEL_CLASS_NAME, "grid gap-5 bg-ink-2 p-5 sm:p-7")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className={MONO_LABEL_CLASS_NAME}>{CABINET_TEXT.orderNumber(order.number)}</span>
            <span className="font-mono text-xs text-warm uppercase">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
          </div>
          <h3 className="font-display text-2xl leading-tight font-medium uppercase sm:text-3xl">
            {order.session.filmTitle} <span className="text-paper/45">{order.session.format}</span>
          </h3>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-paper/64">
            <span>{order.cinema.name}</span>
            <span>{order.session.hallName}</span>
            <span className="text-paper">
              {formatOrderDate(order.session.startsAt, order.cinema.timezone)}, {formatTimeInZone(order.session.startsAt, order.cinema.timezone)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xl font-medium tabular-nums">{formatRubles(order.totalAmount)}</span>
          {canDownloadPdf && (
            <a
              href={customerService.getOrderPdfUrl(order.id)}
              download={`tickets-${order.number}.pdf`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-paper/28 px-4.5 text-[0.9rem] font-medium transition-colors hover:border-paper"
            >
              {CABINET_TEXT.downloadPdf}
            </a>
          )}
          {canRefund && (
            <Button variant="ghost" size="small" onClick={handleToggleRefundPanel}>
              {isRefundOpen ? CABINET_TEXT.refundClose : CABINET_TEXT.refundButton}
            </Button>
          )}
        </div>
      </div>

      {refundSuccess && (
        <p className="rounded-frame border border-warm/40 bg-warm/10 px-4 py-3 text-sm text-paper">{refundSuccess}</p>
      )}

      {isRefundOpen && canRefund && (
        <div className="grid gap-4 rounded-frame border border-paper/20 bg-ink-3 p-4">
          <p className="text-sm text-paper/76">{CABINET_TEXT.refundHint}</p>
          <ul className="grid gap-2">
            {activeTickets.map((ticket) => {
              const isChecked = selectedRefundIds.includes(ticket.id);
              return (
                <li key={ticket.id}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-frame border border-paper/15 bg-ink-2 px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRefundTicket(ticket.id)}
                        className="size-4 accent-warm"
                      />
                      <span>{CABINET_TEXT.seatLabel(ticket.row, ticket.number)}</span>
                      <span className="font-mono text-xs text-paper/56">{ticket.code}</span>
                    </span>
                    <span className="font-mono text-sm tabular-nums">{formatRubles(ticket.price)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {refundError && (
            <p role="alert" className="text-sm text-signal">
              {refundError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-3">
            <span className="font-mono text-sm text-paper/80">
              {CABINET_TEXT.refundTotal}: <strong className="text-paper">{formatRubles(refundTotal)}</strong>
            </span>
            <Button
              size="small"
              disabled={selectedRefundTickets.length === 0 || refundMutation.isPending}
              onClick={() => void handleConfirmRefund()}
            >
              {refundMutation.isPending ? CABINET_TEXT.refundSubmitting : CABINET_TEXT.refundConfirm}
            </Button>
          </div>
        </div>
      )}

      <ul className="grid gap-2.5 border-t border-paper/13 pt-4">
        {order.tickets.map((ticket) => {
          const isQrOpen = openQrId === ticket.id;
          const canShowQr = Boolean(ticket.qrPayload) || ticket.status === "ACTIVE";

          return (
            <li key={ticket.id} className="grid gap-4 rounded-frame bg-ink-3 p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium text-paper">{CABINET_TEXT.seatLabel(ticket.row, ticket.number)}</span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs text-paper/56">
                    <span>
                      {CABINET_TEXT.ticketCodeLabel} {ticket.code}
                    </span>
                    <span>{TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{formatRubles(ticket.price)}</span>
                  {canShowQr && (
                    <Button variant="ghost" size="small" onClick={() => setOpenQrId(isQrOpen ? null : ticket.id)}>
                      {isQrOpen ? CABINET_TEXT.hideQr : CABINET_TEXT.showQr}
                    </Button>
                  )}
                </div>
              </div>

              {isQrOpen && (
                <div className="flex flex-col items-center gap-3 border-t border-paper/10 pt-4">
                  <div className="rounded-frame bg-white p-3">
                    <Image
                      src={customerService.getTicketQrUrl(order.id, ticket.id)}
                      alt={`${CABINET_TEXT.ticketCodeLabel} ${ticket.code}`}
                      width={200}
                      height={200}
                      unoptimized
                      className="h-48 w-48"
                    />
                  </div>
                  <span className="font-mono text-sm tracking-[0.14em] text-paper">{ticket.code}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
};
