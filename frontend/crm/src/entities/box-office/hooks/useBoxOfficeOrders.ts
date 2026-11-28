"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { boxOfficeService } from "@/entities/box-office/services/box-office.service";

export const useBoxOfficeOrders = (cinemaId: string, query: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.boxOfficeOrders(cinemaId, query.trim()),
    queryFn: () => boxOfficeService.searchOrders(cinemaId, query),
    enabled: enabled && Boolean(cinemaId),
  });
