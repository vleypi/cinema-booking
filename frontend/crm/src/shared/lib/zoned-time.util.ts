const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_LOCALE = "en-CA";

export const getTodayInTimeZone = (timeZone: string): string => new Intl.DateTimeFormat(ISO_DATE_LOCALE, { timeZone }).format(new Date());

export const shiftDate = (date: string, days: number): string => new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);

export const formatTimeInZone = (instant: string, timeZone: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(instant));

export const formatDayTitle = (date: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(date));

export const formatCalendarDate = (date: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
