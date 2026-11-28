import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { ICreateOrderPayload } from "@/entities/order/interfaces/order.interface";
import { orderService } from "@/entities/order/services/order.service";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: (_order, payload) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessionSeats(payload.sessionId) });
    },
    onError: (_error, payload) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessionSeats(payload.sessionId) });
    },
  });
};
