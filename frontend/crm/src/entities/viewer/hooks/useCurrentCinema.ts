"use client";

import { use } from "react";
import { CurrentCinemaContext, type ICurrentCinemaState } from "@/entities/viewer/services/current-cinema.context";

export const useCurrentCinema = (): ICurrentCinemaState => {
  const state = use(CurrentCinemaContext);
  if (!state) throw new Error("useCurrentCinema используется вне CurrentCinemaProvider");

  return state;
};
