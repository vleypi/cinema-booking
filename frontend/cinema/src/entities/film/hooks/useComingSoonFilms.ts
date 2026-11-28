"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { filmService } from "@/entities/film/services/film.service";

export const useComingSoonFilms = () => useQuery({ queryKey: QUERY_KEYS.comingSoonFilms, queryFn: () => filmService.getComingSoon() });
