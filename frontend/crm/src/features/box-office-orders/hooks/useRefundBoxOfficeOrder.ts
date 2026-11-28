"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boxOfficeService, type IBoxOfficeRefundPayload } from "@/entities/box-office";

interface IRefundOrderVariables {
  orderId: string;
  payload: IBoxOfficeRefundPayload;
}

export const useRefundBoxOfficeOrder = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: IRefundOrderVariables) => boxOfficeService.refundOrder(cinemaId, orderId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["box-office", "orders", cinemaId] });
      void queryClient.invalidateQueries({ queryKey: ["box-office", "seats", cinemaId] });
    },
  });
};
