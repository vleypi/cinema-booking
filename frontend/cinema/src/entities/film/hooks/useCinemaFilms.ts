"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film/services/film.service";

export const useCinemaFilms = (cinemaId: string | undefined, search = "") =>
  useQuery({
    queryKey: QUERY_KEYS.cinemaFilms(cinemaId ?? "", search),
    queryFn: () => filmService.getByCinema(cinemaId ?? "", search),
    enabled: Boolean(cinemaId),
    placeholderData: keepPreviousData,
  });
