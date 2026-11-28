"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { replaceSearchParams } from "@/shared/lib";
import { CINEMA_QUERY_PARAM } from "@/entities/viewer/constants/viewer.constant";

export const useCinemaQuery = (cinemas: readonly ICinemaSummary[] | undefined, select: (cinemaId: string) => void): ICinemaSummary | undefined => {
  const searchParams = useSearchParams();
  const slug = searchParams.get(CINEMA_QUERY_PARAM);
  const queriedCinema = cinemas?.find((cinema) => cinema.slug === slug);

  useEffect(() => {
    if (!slug || !cinemas) return;
    if (queriedCinema) select(queriedCinema.id);
    replaceSearchParams({ [CINEMA_QUERY_PARAM]: undefined });
  }, [slug, cinemas, queriedCinema, select]);

  return queriedCinema;
};
