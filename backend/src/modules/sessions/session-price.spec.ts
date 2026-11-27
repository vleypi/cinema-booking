import { calculateSeatPrice, calculateSessionSeatPrice, findTimeBandMultiplier } from '@/modules/sessions/session-price.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { buildTimeBands } from '@/modules/time-bands/time-band-schedule.js';

const BANDS = buildTimeBands('1', DEFAULT_TIME_BANDS);

describe('calculateSeatPrice', () => {
  it.each([
    [40000, 1, 1, 40000],
    [40000, 0.825, 1, 33000],
    [45000, 1.2, 1.3, 70000],
    [35000, 0.825, 1, 29000],
  ])('rounds %i × %d × %d to %i kopecks', (basePrice, band, zone, expected) => {
    expect(calculateSeatPrice(basePrice, band, zone)).toBe(expected);
  });
});

describe('findTimeBandMultiplier', () => {
  it.each([
    ['00:00', 0.825],
    ['11:59', 0.825],
    ['12:00', 1],
    ['16:59', 1],
    ['17:00', 1.2],
    ['23:59', 1.2],
  ])('a session at %s takes the multiplier %d', (time, expected) => {
    expect(findTimeBandMultiplier(BANDS, time)).toBe(expected);
  });

  it('keeps the base price when the cinema has no time bands', () => {
    expect(findTimeBandMultiplier([], '19:00')).toBe(1);
  });
});

describe('calculateSessionSeatPrice', () => {
  const MORNING = new Date('2030-03-15T07:00:00.000Z');
  const hall = { basePrice: 40000, useTimeBands: true };

  it('applies the time band of the local start time and the price zone', () => {
    expect(calculateSessionSeatPrice({ basePriceOverride: null, startsAt: MORNING, hall }, BANDS, 'Europe/Moscow', 1.5)).toBe(50000);
  });

  it('takes the base price of the session before the price of the hall', () => {
    expect(calculateSessionSeatPrice({ basePriceOverride: 60000, startsAt: MORNING, hall }, BANDS, 'Europe/Moscow', 1)).toBe(50000);
  });

  it('ignores time bands in a hall with a fixed price', () => {
    expect(calculateSessionSeatPrice({ basePriceOverride: null, startsAt: MORNING, hall: { ...hall, useTimeBands: false } }, BANDS, 'Europe/Moscow', 1)).toBe(40000);
  });
});
