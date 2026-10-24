"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { cinemaService } from "@/entities/cinema/services/cinema.service";

export const useCinemas = () => useQuery({ queryKey: QUERY_KEYS.cinemas, queryFn: () => cinemaService.getAll() });
