"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { timeBandService } from "@/entities/time-band";
import type { TimeBandsFormValues } from "@/features/edit-time-bands/schemas/time-bands-form.schema";

export const useSaveTimeBands = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bands }: TimeBandsFormValues) => timeBandService.replace(cinemaId, bands),
    onSuccess: (bands) => queryClient.setQueryData(QUERY_KEYS.cinemaTimeBands(cinemaId), bands),
  });
};
