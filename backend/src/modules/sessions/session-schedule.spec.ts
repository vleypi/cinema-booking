import { fitsOpeningHours } from '@/modules/sessions/session-schedule.js';

const AFTER_MIDNIGHT = { opensAt: '10:00', closesAt: '02:00' };
const SAME_DAY = { opensAt: '09:00', closesAt: '23:00' };
const ROUND_THE_CLOCK = { opensAt: '00:00', closesAt: '00:00' };

describe('fitsOpeningHours', () => {
  it.each([
    ['10:00', 120, AFTER_MIDNIGHT, true],
    ['23:30', 150, AFTER_MIDNIGHT, true],
    ['00:30', 120, AFTER_MIDNIGHT, false],
    ['09:30', 90, AFTER_MIDNIGHT, false],
    ['21:00', 120, SAME_DAY, true],
    ['21:30', 120, SAME_DAY, false],
    ['23:00', 90, SAME_DAY, false],
    ['03:00', 180, ROUND_THE_CLOCK, true],
  ])('a session at %s for %i minutes fits %o: %s', (startTime, duration, hours, expected) => {
    expect(fitsOpeningHours(startTime, duration, hours)).toBe(expected);
  });
});
