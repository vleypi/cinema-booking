"use client";

import { formatCalendarDate, formatRubles, formatTimeInZone, joinClassNames, toDateInTimeZone } from "@luch/shared/lib";
import { Button, Icon } from "@luch/shared/ui";
import { type FormEvent, useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { Badge, CARD_CLASS_NAME, EmptyState } from "@/shared/ui";
import {
  boxOfficeService,
  type IBoxOfficeOrder,
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_META,
  PRINT_FORMAT_LABELS,
  TICKET_STATUS_META,
  useBoxOfficeOrders,
} from "@/entities/box-office";
import { RefundOrderModal } from "@/features/box-office-orders/components/RefundOrderModal";
import { BOX_OFFICE_ORDERS_TEXT } from "@/features/box-office-orders/constants/box-office-orders.constant";

interface IBoxOfficeOrdersTabProps {
  cinema: ICinemaSummary;
  canSell: boolean;
  canRefund: boolean;
}

const formatSessionDateTime = (isoDate: string, timeZone: string): string => {
  const formattedDate = formatCalendarDate(toDateInTimeZone(isoDate, timeZone));
  const formattedTime = formatTimeInZone(isoDate, timeZone);
  return `${formattedDate}, ${formattedTime}`;
};

export const BoxOfficeOrdersTab = ({ cinema, canSell, canRefund }: IBoxOfficeOrdersTabProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [refundTarget, setRefundTarget] = useState<IBoxOfficeOrder | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [renderedAtMs] = useState(() => Date.now());

  const { data: orders, isPending } = useBoxOfficeOrders(cinema.id, submittedQuery);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(searchInput.trim());
    setSuccessNotice(null);
  };

  const handleClear = () => {
    setSearchInput("");
    setSubmittedQuery("");
    setSuccessNotice(null);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={BOX_OFFICE_ORDERS_TEXT.searchPlaceholder}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-ink placeholder:text-gray-400 focus:border-brand focus:outline-none"
          />
        </div>
        <Button type="submit">{BOX_OFFICE_ORDERS_TEXT.searchButton}</Button>
        {submittedQuery && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            {BOX_OFFICE_ORDERS_TEXT.clearSearch}
          </Button>
        )}
      </form>

      {successNotice && (
        <div className="rounded-lg border border-brand/25 bg-brand-soft/60 px-4 py-3 text-sm font-medium text-brand">
          {successNotice}
        </div>
      )}

      {isPending && <div className="h-48 animate-pulse rounded-xl bg-gray-100" />}

      {!isPending && (!orders || orders.length === 0) && (
        <EmptyState
          icon="search"
          title={BOX_OFFICE_ORDERS_TEXT.emptyTitle}
          description={BOX_OFFICE_ORDERS_TEXT.emptyDescription}
        />
      )}

      {!isPending && orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusMeta = ORDER_STATUS_META[order.status] ?? { label: order.status, tone: "neutral" as const };
            const hasActiveTickets = order.tickets.some((ticket) => ticket.status === "ACTIVE");
            const canRefundOrder =
              canRefund && hasActiveTickets && new Date(order.session.startsAt).getTime() > renderedAtMs;
            const canPrintOrder = canSell && (order.status === "PAID" || order.status === "PARTIALLY_REFUNDED");
            const contacts = [order.customerName, order.contactEmail, order.customerPhone].filter(Boolean).join(", ");

            return (
              <div key={order.id} className={joinClassNames(CARD_CLASS_NAME, "space-y-4 p-5")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-bold text-ink">{order.number}</span>
                      <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                      <Badge tone="neutral">{ORDER_CHANNEL_LABELS[order.channel]}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {order.session.filmTitle}, {formatSessionDateTime(order.session.startsAt, cinema.timezone)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.session.hallName}, {order.session.format}
                      {contacts ? `, ${contacts}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-2 font-display text-lg font-bold text-ink tabular-nums">
                      {formatRubles(order.totalAmount)}
                    </span>
                    {canPrintOrder && (
                      <>
                        <a
                          href={boxOfficeService.getOrderPdfUrl(cinema.id, order.id, "a4")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-gray-50"
                        >
                          <Icon name="printer" className="size-3.5" />
                          <span>{PRINT_FORMAT_LABELS.a4}</span>
                        </a>
                        <a
                          href={boxOfficeService.getOrderPdfUrl(cinema.id, order.id, "receipt")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-gray-50"
                        >
                          <Icon name="printer" className="size-3.5" />
                          <span>{PRINT_FORMAT_LABELS.receipt}</span>
                        </a>
                      </>
                    )}
                    {canRefundOrder && (
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setRefundTarget(order)}>
                        {BOX_OFFICE_ORDERS_TEXT.refundButton}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <p className="text-xs font-medium text-gray-500">{BOX_OFFICE_ORDERS_TEXT.ticketsHeading}</p>
                  <div className="flex flex-wrap gap-2">
                    {order.tickets.map((ticket) => {
                      const ticketMeta = TICKET_STATUS_META[ticket.status] ?? { label: ticket.status, tone: "neutral" as const };
                      return (
                        <div
                          key={ticket.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs"
                        >
                          <span className="font-medium text-ink">
                            {BOX_OFFICE_ORDERS_TEXT.seatSummary(ticket.row, ticket.number)}
                          </span>
                          <span className="font-mono text-gray-600">{ticket.code}</span>
                          <span className="text-gray-500 tabular-nums">{formatRubles(ticket.price)}</span>
                          <Badge tone={ticketMeta.tone}>{ticketMeta.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RefundOrderModal
        key={refundTarget?.id ?? "closed"}
        cinemaId={cinema.id}
        order={refundTarget}
        onClose={() => setRefundTarget(null)}
        onRefunded={(order, refund) =>
          setSuccessNotice(BOX_OFFICE_ORDERS_TEXT.refundSuccess(order.number, formatRubles(refund.amount)))
        }
      />
    </div>
  );
};
