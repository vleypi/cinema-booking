import { type IScheduleDay, type ISession, isOnDate } from "@/entities/session";
import { ALL_OPTION } from "@/features/filter-schedule/constants/filter-schedule.constant";
import type { IFilterOption } from "@/features/filter-schedule/interfaces/filter-schedule.interface";

const matchesOption = (value: string, selected: string): boolean => selected === ALL_OPTION || value === selected;

export const filterSessions = (sessions: readonly ISession[], date: string, filmId: string, hallId: string, timeZone: string): ISession[] =>
  sessions.filter((session) => isOnDate(session, date, timeZone) && matchesOption(session.filmId, filmId) && matchesOption(session.hallId, hallId));

export const findFirstBusyDay = (sessions: readonly ISession[], days: readonly IScheduleDay[], timeZone: string): string =>
  (days.find(({ date }) => sessions.some((session) => isOnDate(session, date, timeZone))) ?? days[0]).date;

const toSortedOptions = (options: IFilterOption[]): IFilterOption[] =>
  [...new Map(options.map((option) => [option.id, option])).values()].toSorted((first, second) => first.label.localeCompare(second.label, "ru"));

export const collectFilmOptions = (sessions: readonly ISession[]): IFilterOption[] => toSortedOptions(sessions.map(({ film }) => ({ id: film.id, label: film.title })));

export const collectHallOptions = (sessions: readonly ISession[]): IFilterOption[] => toSortedOptions(sessions.map(({ hall }) => ({ id: hall.id, label: hall.name })));
