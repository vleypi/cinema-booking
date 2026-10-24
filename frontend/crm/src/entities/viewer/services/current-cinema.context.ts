import { createContext } from "react";
import type { ICinemaSummary } from "@/shared/api";

export interface ICurrentCinemaState {
  cinema: ICinemaSummary | null;
  select: (cinemaId: string) => void;
}

export const CurrentCinemaContext = createContext<ICurrentCinemaState | null>(null);
