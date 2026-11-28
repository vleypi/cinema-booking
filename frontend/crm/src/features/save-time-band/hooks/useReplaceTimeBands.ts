"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { type ITimeBandInput, timeBandService } from "@/entities/time-band";

export const useReplaceTimeBands = (cinemaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bands: ITimeBandInput[]) => timeBandService.replace(cinemaId, bands),
    onSuccess: (bands) => queryClient.setQueryData(QUERY_KEYS.cinemaTimeBands(cinemaId), bands),
  });
};
