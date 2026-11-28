"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IHallListRequest } from "@/entities/hall/interfaces/hall.interface";
import { hallService } from "@/entities/hall/services/hall.service";

const ALL_HALLS: IHallListRequest = {};

export const useCinemaHalls = (cinemaId: string, request: IHallListRequest = ALL_HALLS) =>
  useQuery({
    queryKey: QUERY_KEYS.cinemaHallList(cinemaId, request),
    queryFn: () => hallService.getByCinema(cinemaId, request),
    placeholderData: keepPreviousData,
  });
