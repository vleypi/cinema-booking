import type { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';
import { DAY_END, DAY_START } from '@/modules/time-bands/time-bands.constant.js';

type TimeBandInput = Pick<TimeBand, 'name' | 'startsAt' | 'multiplier'>;
type TimeBandRow = Pick<TimeBand, 'cinemaId' | 'name' | 'startsAt' | 'endsAt' | 'multiplier'>;

export const coversDayStart = (bands: readonly TimeBandInput[]): boolean => bands.some(({ startsAt }) => startsAt === DAY_START);

export const buildTimeBands = (cinemaId: string, bands: readonly TimeBandInput[]): TimeBandRow[] => {
  const sorted = bands.toSorted((first, second) => first.startsAt.localeCompare(second.startsAt));

  return sorted.map(({ name, startsAt, multiplier }, index) => ({ cinemaId, name, startsAt, multiplier, endsAt: sorted[index + 1]?.startsAt ?? DAY_END }));
};
