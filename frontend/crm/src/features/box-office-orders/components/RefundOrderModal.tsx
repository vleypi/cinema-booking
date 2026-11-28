"use client";

import { ApiError } from "@luch/shared/api";
import { formatRubles, joinClassNames } from "@luch/shared/lib";
import { Button, FormError, Modal, ModalFooter } from "@luch/shared/ui";
import { useMemo, useState } from "react";
import {
  BOX_OFFICE_PAYMENT_METHOD_LABELS,
  type BoxOfficePaymentMethod,
  type IBoxOfficeOrder,
  type IBoxOfficeRefund,
} from "@/entities/box-office";
import { BOX_OFFICE_ORDERS_TEXT } from "@/features/box-office-orders/constants/box-office-orders.constant";
import { useRefundBoxOfficeOrder } from "@/features/box-office-orders/hooks/useRefundBoxOfficeOrder";

interface IRefundOrderModalProps {
  cinemaId: string;
  order: IBoxOfficeOrder | null;
  onClose: () => void;
  onRefunded: (order: IBoxOfficeOrder, refund: IBoxOfficeRefund) => void;
}

const REFUND_METHODS: readonly BoxOfficePaymentMethod[] = ["CASH", "CARD_TERMINAL"];

export const RefundOrderModal = ({ cinemaId, order, onClose, onRefunded }: IRefundOrderModalProps) => {
  const activeTickets = useMemo(() => order?.tickets.filter((ticket) => ticket.status === "ACTIVE") ?? [], [order]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>(() => activeTickets.map((ticket) => ticket.id));
  const [refundMethod, setRefundMethod] = useState<BoxOfficePaymentMethod>("CASH");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const refundMutation = useRefundBoxOfficeOrder(cinemaId);

  const selectedTickets = useMemo(() => {
    const selectedSet = new Set(selectedTicketIds);
    return activeTickets.filter((ticket) => selectedSet.has(ticket.id));
  }, [activeTickets, selectedTicketIds]);

  const totalAmount = useMemo(() => selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0), [selectedTickets]);

  const handleToggleTicket = (ticketId: string) => {
    setSelectedTicketIds((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]));
    setErrorMessage(null);
  };

  const handleConfirm = async () => {
    if (!order || selectedTickets.length === 0) return;

    try {
      const refund = await refundMutation.mutateAsync({
        orderId: order.id,
        payload: {
          ticketIds: selectedTickets.map((ticket) => ticket.id),
          ...(order.channel === "BOX_OFFICE" && { refundMethod }),
        },
      });
      onRefunded(order, refund);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <Modal isOpen={order !== null} title={order ? BOX_OFFICE_ORDERS_TEXT.refundModalTitle(order.number) : ""} onClose={onClose}>
      {order && (
        <div className="space-y-5 pb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">{BOX_OFFICE_ORDERS_TEXT.refundSelectTicketsLabel}</span>
              <div className="flex items-center gap-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedTicketIds(activeTickets.map((ticket) => ticket.id))}
                  className="text-brand hover:underline"
                >
                  {BOX_OFFICE_ORDERS_TEXT.refundSelectAll}
                </button>
                <button type="button" onClick={() => setSelectedTicketIds([])} className="text-gray-500 hover:text-ink">
                  {BOX_OFFICE_ORDERS_TEXT.refundClearAll}
                </button>
              </div>
            </div>

            <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {activeTickets.map((ticket) => {
                const isChecked = selectedTicketIds.includes(ticket.id);
                return (
                  <li key={ticket.id}>
                    <label
                      className={joinClassNames(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        isChecked ? "border-brand bg-brand-soft/40" : "border-gray-200 bg-white hover:bg-gray-50",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTicket(ticket.id)}
                          className="size-4 rounded border-gray-300 text-brand focus:ring-brand"
                        />
                        <span className="text-ink">{BOX_OFFICE_ORDERS_TEXT.seatSummary(ticket.row, ticket.number)}</span>
                        <span className="font-mono text-xs text-gray-500">{ticket.code}</span>
                      </span>
                      <span className="font-medium text-ink tabular-nums">{formatRubles(ticket.price)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {order.channel === "BOX_OFFICE" ? (
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">{BOX_OFFICE_ORDERS_TEXT.refundMethodLabel}</span>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setRefundMethod(method)}
                    className={joinClassNames(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      refundMethod === method
                        ? "border-brand bg-brand text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {BOX_OFFICE_PAYMENT_METHOD_LABELS[method]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">{BOX_OFFICE_ORDERS_TEXT.refundOnlineHint}</p>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-medium text-gray-600">{BOX_OFFICE_ORDERS_TEXT.refundTotalLabel}</span>
            <span className="font-display text-lg font-bold text-ink tabular-nums">{formatRubles(totalAmount)}</span>
          </div>

          <FormError message={errorMessage ?? undefined} />

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              {BOX_OFFICE_ORDERS_TEXT.refundCancel}
            </Button>
            <Button disabled={selectedTickets.length === 0 || refundMutation.isPending} onClick={() => void handleConfirm()}>
              {refundMutation.isPending ? BOX_OFFICE_ORDERS_TEXT.refundSubmitting : BOX_OFFICE_ORDERS_TEXT.refundConfirm}
            </Button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
};
