"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { boxOfficeService, type ICreateBoxOfficeOrderPayload } from "@/entities/box-office";

export const useCreateBoxOfficeOrder = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICreateBoxOfficeOrderPayload) => boxOfficeService.createOrder(cinemaId, payload),
    onSuccess: (_order, variables) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boxOfficeSessionSeats(cinemaId, variables.sessionId) });
      void queryClient.invalidateQueries({ queryKey: ["box-office", "orders", cinemaId] });
    },
  });
};
