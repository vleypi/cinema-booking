"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film/services/film.service";

export const useFilms = () => useQuery({ queryKey: QUERY_KEYS.films, queryFn: () => filmService.getAll() });
