import { getTodayInTimeZone, shiftDate, toDateInTimeZone } from "@luch/shared/lib";
import { RELATIVE_DAY_TITLES, SCHEDULE_DAYS_COUNT } from "@/entities/session/constants/session.constant";
import type { IFilmSessions, IScheduleDay, ISession } from "@/entities/session/interfaces/session.interface";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "short" });
const DAY_MONTH_FORMAT = new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", day: "numeric", month: "short" });
const LONG_DAY_FORMAT = new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });

export const getScheduleDays = (timeZone: string): IScheduleDay[] => {
  const today = getTodayInTimeZone(timeZone);

  return Array.from({ length: SCHEDULE_DAYS_COUNT }, (_, offset) => {
    const date = shiftDate(today, offset);
    const instant = new Date(date);

    return { date, title: RELATIVE_DAY_TITLES[offset] ?? WEEKDAY_FORMAT.format(instant), caption: DAY_MONTH_FORMAT.format(instant) };
  });
};

export const getRelativeDayTitle = (date: string, timeZone: string): string => {
  const offset = getScheduleDays(timeZone).findIndex((day) => day.date === date);

  return RELATIVE_DAY_TITLES[offset] ?? LONG_DAY_FORMAT.format(new Date(date));
};

export const isOnDate = (session: ISession, date: string, timeZone: string): boolean => toDateInTimeZone(session.startsAt, timeZone) === date;

export const groupByFilm = (sessions: readonly ISession[]): IFilmSessions[] => {
  const groups = new Map<string, IFilmSessions>();
  for (const session of sessions) {
    const group = groups.get(session.filmId) ?? { film: session.film, sessions: [] };
    group.sessions.push(session);
    groups.set(session.filmId, group);
  }

  return [...groups.values()];
};

export const groupByDate = (sessions: readonly ISession[], timeZone: string): [string, ISession[]][] =>
  Object.entries(Object.groupBy(sessions, (session) => toDateInTimeZone(session.startsAt, timeZone))).map(([date, daySessions = []]) => [date, daySessions]);
