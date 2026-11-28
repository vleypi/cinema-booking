"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { ticketCheckInService } from "@/entities/ticket-check-in/services/ticket-check-in.service";

export const useScannerHalls = (cinemaId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.scannerHalls(cinemaId),
    queryFn: () => ticketCheckInService.listHalls(cinemaId),
    enabled: Boolean(cinemaId),
  });
