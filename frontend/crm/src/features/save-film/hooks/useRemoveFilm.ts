"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film";

export const useRemoveFilm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filmId: string) => filmService.remove(filmId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.films }),
  });
};
