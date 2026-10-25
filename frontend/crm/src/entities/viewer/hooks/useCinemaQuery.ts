"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { CINEMA_QUERY_PARAM } from "@/entities/viewer/constants/viewer.constant";

export const useCinemaQuery = (cinemas: readonly ICinemaSummary[] | undefined, select: (cinemaId: string) => void): ICinemaSummary | undefined => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get(CINEMA_QUERY_PARAM);
  const queriedCinema = cinemas?.find((cinema) => cinema.slug === slug);

  useEffect(() => {
    if (!slug || !cinemas) return;
    if (queriedCinema) select(queriedCinema.id);

    const restParams = new URLSearchParams(searchParams);
    restParams.delete(CINEMA_QUERY_PARAM);
    const query = restParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [slug, cinemas, queriedCinema, select, searchParams, pathname, router]);

  return queriedCinema;
};
