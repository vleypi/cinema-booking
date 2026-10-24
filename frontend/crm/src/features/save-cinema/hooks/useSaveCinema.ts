"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { cinemaService } from "@/entities/cinema";
import type { CinemaFormValues } from "@/features/save-cinema/schemas/cinema-form.schema";

export const useSaveCinema = (cinemaId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CinemaFormValues) => (cinemaId ? cinemaService.update(cinemaId, values) : cinemaService.create(values)),
    onSuccess: () =>
      Promise.all([queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cinemas }), queryClient.invalidateQueries({ queryKey: QUERY_KEYS.viewer })]),
  });
};
