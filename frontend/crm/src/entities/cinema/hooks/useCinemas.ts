"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type IListRequest, QUERY_KEYS } from "@/shared/api";
import type { CinemaSortField } from "@/entities/cinema/constants/cinema.constant";
import { cinemaService } from "@/entities/cinema/services/cinema.service";

export const useCinemas = (request: IListRequest<CinemaSortField>) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaPage(request), queryFn: () => cinemaService.getPage(request), placeholderData: keepPreviousData });
