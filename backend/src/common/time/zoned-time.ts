export const MINUTE_MS = 60_000;
export const MIDNIGHT = '00:00';

const DAY_MS = 24 * 60 * MINUTE_MS;
const DATE_LENGTH = 10;

const offsetMinutes = (instant: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    .formatToParts(instant)
    .reduce<Record<string, number>>((result, { type, value }) => ({ ...result, [type]: Number(value) }), {});
  const wallClock = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);

  return Math.round((wallClock - instant.getTime()) / MINUTE_MS);
};

export const toUtc = (date: string, time: string, timeZone: string): Date => {
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  const firstGuess = wallClock - offsetMinutes(new Date(wallClock), timeZone) * MINUTE_MS;

  return new Date(wallClock - offsetMinutes(new Date(firstGuess), timeZone) * MINUTE_MS);
};

export const formatTime = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('ru-RU', { timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).format(instant);

export const addDays = (date: string, days: number): string => new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, DATE_LENGTH);
