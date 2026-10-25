"use client";

import { MAX_PAGE_SIZE } from "@/shared/config";
import { FILM_SORT_FIELDS, SCHEDULABLE_FILM_STATUSES } from "@/entities/film/constants/film.constant";
import { useFilms } from "@/entities/film/hooks/useFilms";

const SCHEDULABLE_FILMS_REQUEST = { status: SCHEDULABLE_FILM_STATUSES, sort: FILM_SORT_FIELDS.title, pageSize: MAX_PAGE_SIZE };

export const useSchedulableFilms = () => {
  const { data } = useFilms(SCHEDULABLE_FILMS_REQUEST);
  return data?.items ?? [];
};
