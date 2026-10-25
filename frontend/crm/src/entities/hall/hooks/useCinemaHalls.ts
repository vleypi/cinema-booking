"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { hallService } from "@/entities/hall/services/hall.service";

export const useCinemaHalls = (cinemaId: string) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaHalls(cinemaId), queryFn: () => hallService.getByCinema(cinemaId) });
