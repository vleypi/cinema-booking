"use client";

import { formatRubles, formatTimeInZone, joinClassNames } from "@luch/shared/lib";
import Image from "next/image";
import { useState } from "react";
import { Button, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { customerService, type ICustomerOrder } from "@/entities/customer";
import { CABINET_TEXT, ORDER_STATUS_LABELS, TICKET_STATUS_LABELS } from "@/views/cabinet/constants/cabinet.constant";

interface IOrderCardProps {
  order: ICustomerOrder;
}

const formatOrderDate = (iso: string, timeZone: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export const OrderCard = ({ order }: IOrderCardProps) => {
  const [openQrId, setOpenQrId] = useState<string | null>(null);
  const canDownloadPdf = order.tickets.some((ticket) => ticket.status === "ACTIVE" || ticket.status === "USED");

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

        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </div>

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
