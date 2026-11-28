"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IStaffListRequest } from "@/entities/staff/interfaces/staff.interface";
import { staffService } from "@/entities/staff/services/staff.service";

export const useCinemaStaff = (cinemaId: string, request: IStaffListRequest) =>
  useQuery({
    queryKey: QUERY_KEYS.cinemaStaff(cinemaId, request),
    queryFn: () => staffService.getPageByCinema(cinemaId, request),
    placeholderData: keepPreviousData,
  });
