"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film/services/film.service";

export const useFilm = (filmId: string) => useQuery({ queryKey: QUERY_KEYS.film(filmId), queryFn: () => filmService.getById(filmId) });
