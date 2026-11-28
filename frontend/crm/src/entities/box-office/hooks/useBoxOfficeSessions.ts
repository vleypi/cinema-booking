"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { boxOfficeService } from "@/entities/box-office/services/box-office.service";

export const useBoxOfficeSessions = (cinemaId: string, date: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.boxOfficeSessions(cinemaId, date),
    queryFn: () => boxOfficeService.getSessionsByDay(cinemaId, date),
    enabled: enabled && Boolean(cinemaId && date),
  });
