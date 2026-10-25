"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { timeBandService } from "@/entities/time-band/services/time-band.service";

export const useCinemaTimeBands = (cinemaId: string) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaTimeBands(cinemaId), queryFn: () => timeBandService.getByCinema(cinemaId) });
