"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type IListRequest, QUERY_KEYS } from "@/shared/api";
import type { StaffSortField } from "@/entities/staff/constants/staff.constant";
import { staffService } from "@/entities/staff/services/staff.service";

export const useCinemaStaff = (cinemaId: string, request: IListRequest<StaffSortField>) =>
  useQuery({
    queryKey: QUERY_KEYS.cinemaStaff(cinemaId, request),
    queryFn: () => staffService.getPageByCinema(cinemaId, request),
    placeholderData: keepPreviousData,
  });
