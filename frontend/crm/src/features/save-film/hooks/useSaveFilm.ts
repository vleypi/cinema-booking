"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film";
import type { FilmFormValues } from "@/features/save-film/schemas/film-form.schema";
import { toFilmPayload } from "@/features/save-film/utils/film-form.util";

export const useSaveFilm = (filmId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: FilmFormValues) => {
      const payload = toFilmPayload(values);
      const film = filmId ? await filmService.update(filmId, payload) : await filmService.create(payload);

      return values.poster ? filmService.uploadPoster(film.id, values.poster) : film;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.films }),
  });
};
