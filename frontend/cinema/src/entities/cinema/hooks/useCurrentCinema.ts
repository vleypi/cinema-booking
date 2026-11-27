"use client";

import { use } from "react";
import type { ICurrentCinemaState } from "@/entities/cinema/interfaces/cinema.interface";
import { CurrentCinemaContext } from "@/entities/cinema/services/current-cinema.context";

export const useCurrentCinema = (): ICurrentCinemaState => {
  const state = use(CurrentCinemaContext);
  if (!state) throw new Error("useCurrentCinema используется вне CurrentCinemaProvider");

  return state;
};
