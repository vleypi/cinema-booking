"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { ICinemaListRequest } from "@/entities/cinema/interfaces/cinema.interface";
import { cinemaService } from "@/entities/cinema/services/cinema.service";

export const useCinemas = (request: ICinemaListRequest) =>
  useQuery({ queryKey: QUERY_KEYS.cinemaPage(request), queryFn: () => cinemaService.getPage(request), placeholderData: keepPreviousData });
