"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

interface IRefundOrderVariables {
  orderId: string;
  ticketIds: string[];
}

export const useCustomerRefundOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, ticketIds }: IRefundOrderVariables) => customerService.refundOrder(orderId, ticketIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerOrders });
    },
  });
};
