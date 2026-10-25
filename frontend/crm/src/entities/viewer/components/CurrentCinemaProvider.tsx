"use client";

import { writeCookie } from "@luch/shared/lib";
import { type ReactNode, useState } from "react";
import { COOKIE_KEYS } from "@/shared/config";
import { useCinemaQuery } from "@/entities/viewer/hooks/useCinemaQuery";
import { useViewer } from "@/entities/viewer/hooks/useViewer";
import { CurrentCinemaContext } from "@/entities/viewer/services/current-cinema.context";

interface ICurrentCinemaProviderProps {
  initialCinemaId: string | null;
  children: ReactNode;
}

export const CurrentCinemaProvider = ({ initialCinemaId, children }: ICurrentCinemaProviderProps) => {
  const { data: viewer } = useViewer();
  const [selectedId, setSelectedId] = useState(initialCinemaId);
  const cinemas = viewer?.cinemas ?? [];

  const select = (cinemaId: string) => {
    writeCookie(COOKIE_KEYS.cinemaId, cinemaId);
    setSelectedId(cinemaId);
  };

  const queriedCinema = useCinemaQuery(viewer?.cinemas, select);
  const cinema = queriedCinema ?? cinemas.find(({ id }) => id === selectedId) ?? cinemas[0] ?? null;

  return <CurrentCinemaContext value={{ cinema, select }}>{children}</CurrentCinemaContext>;
};
