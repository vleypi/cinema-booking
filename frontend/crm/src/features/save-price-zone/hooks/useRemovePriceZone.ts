"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService } from "@/entities/hall";

export const useRemovePriceZone = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priceZoneId: string) => hallService.removePriceZone(priceZoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cinemaHalls(cinemaId) }),
  });
};
