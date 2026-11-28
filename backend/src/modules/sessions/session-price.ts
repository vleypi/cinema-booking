import { formatTime } from '@/common/time/zoned-time.js';
import type { Hall } from '@/modules/halls/entities/hall.entity.js';
import type { Session } from '@/modules/sessions/entities/session.entity.js';
import type { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

export const PRICE_STEP_KOPECKS = 1000;
const NEUTRAL_MULTIPLIER = 1;

type PricedTimeBand = Pick<TimeBand, 'startsAt' | 'endsAt' | 'multiplier'>;
type PricedHall = Pick<Hall, 'basePrice' | 'useTimeBands'>;
type PricedSession = Pick<Session, 'basePriceOverride' | 'startsAt'> & { hall: PricedHall };

export const calculateSeatPrice = (basePrice: number, timeBandMultiplier: number, zoneMultiplier: number): number =>
  Math.round((basePrice * timeBandMultiplier * zoneMultiplier) / PRICE_STEP_KOPECKS) * PRICE_STEP_KOPECKS;

export const findTimeBandMultiplier = (bands: readonly PricedTimeBand[], localTime: string): number =>
  bands.find(({ startsAt, endsAt }) => startsAt <= localTime && localTime < endsAt)?.multiplier ?? NEUTRAL_MULTIPLIER;

export const calculateHallSeatPrice = (
  { basePrice, useTimeBands }: PricedHall,
  timeBandMultiplier: number,
  zoneMultiplier: number,
  basePriceOverride: number | null = null,
): number => calculateSeatPrice(basePriceOverride ?? basePrice, useTimeBands ? timeBandMultiplier : NEUTRAL_MULTIPLIER, zoneMultiplier);

export const calculateSessionSeatPrice = (
  { basePriceOverride, startsAt, hall }: PricedSession,
  bands: readonly PricedTimeBand[],
  timeZone: string,
  zoneMultiplier: number,
): number => calculateHallSeatPrice(hall, findTimeBandMultiplier(bands, formatTime(startsAt, timeZone)), zoneMultiplier, basePriceOverride);
