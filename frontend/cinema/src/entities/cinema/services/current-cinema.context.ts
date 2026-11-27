import { createContext } from "react";
import type { ICurrentCinemaState } from "@/entities/cinema/interfaces/cinema.interface";

export const CurrentCinemaContext = createContext<ICurrentCinemaState | null>(null);
