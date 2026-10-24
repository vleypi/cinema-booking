import { addDays, formatTime, toUtc } from '@/common/time/zoned-time.js';

describe('toUtc', () => {
  it('converts the local time of a cinema to UTC', () => {
    expect(toUtc('2026-10-25', '19:45', 'Europe/Moscow').toISOString()).toBe('2026-10-25T16:45:00.000Z');
    expect(toUtc('2026-10-25', '01:30', 'Asia/Yekaterinburg').toISOString()).toBe('2026-10-24T20:30:00.000Z');
  });

  it('follows daylight saving time', () => {
    expect(toUtc('2026-01-15', '12:00', 'Europe/Berlin').toISOString()).toBe('2026-01-15T11:00:00.000Z');
    expect(toUtc('2026-07-15', '12:00', 'Europe/Berlin').toISOString()).toBe('2026-07-15T10:00:00.000Z');
  });
});

describe('formatTime', () => {
  it('shows an instant in the time zone of the cinema', () => {
    expect(formatTime(new Date('2026-10-25T21:30:00.000Z'), 'Europe/Moscow')).toBe('00:30');
  });
});

describe('addDays', () => {
  it('moves a calendar date across months and years', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
