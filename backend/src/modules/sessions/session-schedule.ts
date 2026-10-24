import type { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * MINUTES_PER_HOUR + minutes;
};

const minutesAfter = (from: number, to: number): number => (to - from + MINUTES_PER_DAY) % MINUTES_PER_DAY;

export const fitsOpeningHours = (startTime: string, durationMinutes: number, { opensAt, closesAt }: Pick<Cinema, 'opensAt' | 'closesAt'>): boolean => {
  const opens = toMinutes(opensAt);
  const openMinutes = minutesAfter(opens, toMinutes(closesAt)) || MINUTES_PER_DAY;

  return minutesAfter(opens, toMinutes(startTime)) + durationMinutes <= openMinutes;
};
