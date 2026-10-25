"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService } from "@/entities/hall";
import type { PriceZoneFormValues } from "@/features/save-price-zone/schemas/price-zone-form.schema";

export const useSavePriceZone = (cinemaId: string, hallId: string, priceZoneId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PriceZoneFormValues) =>
      priceZoneId ? hallService.updatePriceZone(priceZoneId, values) : hallService.createPriceZone(hallId, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cinemaHalls(cinemaId) }),
  });
};
