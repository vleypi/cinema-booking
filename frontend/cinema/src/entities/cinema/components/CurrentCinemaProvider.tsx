"use client";

import { writeCookie } from "@luch/shared/lib";
import { type ReactNode, useState } from "react";
import { COOKIE_KEYS } from "@/shared/config";
import { useCinemas } from "@/entities/cinema/hooks/useCinemas";
import { CurrentCinemaContext } from "@/entities/cinema/services/current-cinema.context";

interface ICurrentCinemaProviderProps {
  initialCinemaId: string | null;
  children: ReactNode;
}

export const CurrentCinemaProvider = ({ initialCinemaId, children }: ICurrentCinemaProviderProps) => {
  const { data: cinemas = [], isLoading } = useCinemas();
  const [selectedId, setSelectedId] = useState(initialCinemaId);
  const cinema = cinemas.find(({ id }) => id === selectedId) ?? cinemas[0] ?? null;

  const select = (cinemaId: string) => {
    writeCookie(COOKIE_KEYS.cinemaId, cinemaId);
    setSelectedId(cinemaId);
  };

  return <CurrentCinemaContext value={{ cinema, cinemas, isLoading, select }}>{children}</CurrentCinemaContext>;
};
