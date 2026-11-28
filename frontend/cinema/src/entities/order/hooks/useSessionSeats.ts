import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { orderService } from "@/entities/order/services/order.service";

const SEATS_REFETCH_INTERVAL_MS = 15_000;

export const useSessionSeats = (sessionId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.sessionSeats(sessionId),
    queryFn: () => orderService.getSessionSeats(sessionId),
    refetchInterval: SEATS_REFETCH_INTERVAL_MS,
  });
