"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService } from "@/entities/hall";
import type { HallFormValues } from "@/features/save-hall/schemas/hall-form.schema";
import { toHallPayload } from "@/features/save-hall/utils/hall-form.util";

export const useSaveHall = (cinemaId: string, hallId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: HallFormValues) =>
      hallId ? hallService.update(hallId, toHallPayload(values, false)) : hallService.create(cinemaId, toHallPayload(values, true)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cinemaHalls(cinemaId) }),
  });
};
