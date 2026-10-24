"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { staffService } from "@/entities/staff/services/staff.service";

export const useCinemaStaff = (cinemaId: string) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaStaff(cinemaId), queryFn: () => staffService.getByCinema(cinemaId) });
