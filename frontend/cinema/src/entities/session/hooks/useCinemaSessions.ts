"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { sessionService } from "@/entities/session/services/session.service";

export const useCinemaSessions = (cinemaId: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.cinemaSessions(cinemaId ?? ""),
    queryFn: () => sessionService.getByCinema(cinemaId ?? ""),
    enabled: Boolean(cinemaId),
  });
