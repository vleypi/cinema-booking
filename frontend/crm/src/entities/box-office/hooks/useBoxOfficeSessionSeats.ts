"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { boxOfficeService } from "@/entities/box-office/services/box-office.service";

export const useBoxOfficeSessionSeats = (cinemaId: string, sessionId: string | null) =>
  useQuery({
    queryKey: QUERY_KEYS.boxOfficeSessionSeats(cinemaId, sessionId ?? ""),
    queryFn: () => boxOfficeService.getSessionSeats(cinemaId, sessionId ?? ""),
    enabled: Boolean(cinemaId && sessionId),
  });
