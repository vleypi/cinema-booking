"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IReportPeriod } from "@/entities/report/interfaces/report.interface";
import { reportService } from "@/entities/report/services/report.service";

export const useRevenueReport = (cinemaId: string, period: IReportPeriod, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.revenueReport(cinemaId, period.from, period.to),
    queryFn: () => reportService.getRevenue(cinemaId, period),
    enabled: enabled && Boolean(cinemaId),
  });

export const useOccupancyReport = (cinemaId: string, period: IReportPeriod, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.occupancyReport(cinemaId, period.from, period.to),
    queryFn: () => reportService.getOccupancy(cinemaId, period),
    enabled: enabled && Boolean(cinemaId),
  });
