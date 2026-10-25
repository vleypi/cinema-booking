"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IFilmListRequest } from "@/entities/film/interfaces/film.interface";
import { filmService } from "@/entities/film/services/film.service";

export const useFilms = (request: IFilmListRequest) =>
  useQuery({ queryKey: QUERY_KEYS.filmPage(request), queryFn: () => filmService.getPage(request), placeholderData: keepPreviousData });
