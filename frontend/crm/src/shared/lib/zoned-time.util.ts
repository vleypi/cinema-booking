export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const DAY_MS = MINUTES_PER_DAY * 60 * 1000;
const ISO_DATE_LOCALE = "en-CA";

export const getTodayInTimeZone = (timeZone: string): string => new Intl.DateTimeFormat(ISO_DATE_LOCALE, { timeZone }).format(new Date());

export const shiftDate = (date: string, days: number): string => new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);

export const formatTimeInZone = (instant: string, timeZone: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(instant));

export const formatDayTitle = (date: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(date));

export const formatCalendarDate = (date: string): string =>
  new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(date));

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isCalendarDate = (value: string | null): value is string => {
  if (value === null || !CALENDAR_DATE_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
};

export const getMinutesFromDayStart = (instant: string | Date, date: string, timeZone: string): number => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(ISO_DATE_LOCALE, { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(instant))
      .map(({ type, value }) => [type, value]),
  );
  const dayOffset = Math.round((Date.parse(`${parts.year}-${parts.month}-${parts.day}`) - Date.parse(date)) / DAY_MS);
  return dayOffset * MINUTES_PER_DAY + Number(parts.hour) * MINUTES_PER_HOUR + Number(parts.minute);
};

export const formatMinutesAsTime = (minutes: number): string => {
  const dayMinutes = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return [Math.floor(dayMinutes / MINUTES_PER_HOUR), dayMinutes % MINUTES_PER_HOUR].map((part) => String(part).padStart(2, "0")).join(":");
};
