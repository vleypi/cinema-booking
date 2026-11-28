"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

export const useRefundByTokenPreview = (token: string) =>
  useQuery({
    queryKey: QUERY_KEYS.refundByToken(token),
    queryFn: () => customerService.previewRefundByToken(token),
    enabled: Boolean(token),
    retry: false,
  });

export const useRefundByToken = () =>
  useMutation({
    mutationFn: ({ token, ticketIds }: { token: string; ticketIds: string[] }) =>
      customerService.refundByToken(token, ticketIds),
  });
