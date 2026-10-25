"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { sessionService } from "@/entities/session/services/session.service";

export const useCinemaSessions = (cinemaId: string, date: string) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaSessions(cinemaId, date), queryFn: () => sessionService.getByCinemaDay(cinemaId, date) });
