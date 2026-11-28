import { useMemo, useState } from "react";
import type { ISessionSeat } from "@/entities/order";
import { MAX_ONLINE_SEATS } from "@/features/book-seats/constants/book-seats.constant";

export const useSeatSelection = (seats: readonly ISessionSeat[]) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);

  const availableIds = useMemo(() => new Set(seats.filter((seat) => seat.isAvailable).map((seat) => seat.id)), [seats]);

  const activeSelectedIds = useMemo(() => selectedIds.filter((id) => availableIds.has(id)), [selectedIds, availableIds]);

  const selectedSeats = useMemo(() => {
    const selectedSet = new Set(activeSelectedIds);

    return seats
      .filter((seat) => selectedSet.has(seat.id))
      .toSorted((first, second) => first.row - second.row || first.number - second.number);
  }, [seats, activeSelectedIds]);

  const totalAmount = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

  const toggleSeat = (seatId: string) => {
    if (!availableIds.has(seatId)) return;

    setSelectedIds((current) => {
      const cleaned = current.filter((id) => availableIds.has(id));
      if (cleaned.includes(seatId)) {
        setLimitReached(false);

        return cleaned.filter((id) => id !== seatId);
      }
      if (cleaned.length >= MAX_ONLINE_SEATS) {
        setLimitReached(true);

        return cleaned;
      }

      setLimitReached(false);

      return [...cleaned, seatId];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setLimitReached(false);
  };

  return {
    selectedIds: activeSelectedIds,
    selectedSeats,
    totalAmount,
    limitReached,
    toggleSeat,
    clearSelection,
  };
};
