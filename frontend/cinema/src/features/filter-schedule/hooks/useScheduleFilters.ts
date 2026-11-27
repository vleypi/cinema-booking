"use client";

import { useState } from "react";
import { getScheduleDays, type ISession } from "@/entities/session";
import { ALL_OPTION } from "@/features/filter-schedule/constants/filter-schedule.constant";
import type { IScheduleFilters } from "@/features/filter-schedule/interfaces/filter-schedule.interface";
import {
  collectFilmOptions,
  collectHallOptions,
  filterSessions,
  findFirstBusyDay,
} from "@/features/filter-schedule/utils/filter-schedule.util";

const INITIAL_FILTERS: IScheduleFilters = { date: null, filmId: ALL_OPTION, hallId: ALL_OPTION };

export const useScheduleFilters = (sessions: readonly ISession[], timeZone: string) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const days = getScheduleDays(timeZone);
  const date = filters.date ?? findFirstBusyDay(sessions, days, timeZone);
  const change = (changes: Partial<IScheduleFilters>) => setFilters((current) => ({ ...current, ...changes }));

  return {
    days,
    date,
    filmId: filters.filmId,
    hallId: filters.hallId,
    filmOptions: collectFilmOptions(sessions),
    hallOptions: collectHallOptions(sessions),
    visibleSessions: filterSessions(sessions, date, filters.filmId, filters.hallId, timeZone),
    isFiltered: filters.filmId !== ALL_OPTION || filters.hallId !== ALL_OPTION,
    selectDate: (nextDate: string) => change({ date: nextDate }),
    selectFilm: (filmId: string) => change({ filmId }),
    selectHall: (hallId: string) => change({ hallId }),
    reset: () => setFilters(INITIAL_FILTERS),
  };
};
