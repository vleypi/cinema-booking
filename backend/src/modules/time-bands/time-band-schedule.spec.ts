import { buildTimeBands, coversDayStart } from '@/modules/time-bands/time-band-schedule.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';

describe('buildTimeBands', () => {
  it('sorts the bands and ends each one where the next begins', () => {
    const bands = [
      { name: 'Вечер', startsAt: '17:00', multiplier: 1.2 },
      { name: 'Утро', startsAt: '00:00', multiplier: 0.825 },
      { name: 'День', startsAt: '12:00', multiplier: 1 },
    ];

    expect(buildTimeBands('7', bands)).toEqual([
      { cinemaId: '7', name: 'Утро', startsAt: '00:00', endsAt: '12:00', multiplier: 0.825 },
      { cinemaId: '7', name: 'День', startsAt: '12:00', endsAt: '17:00', multiplier: 1 },
      { cinemaId: '7', name: 'Вечер', startsAt: '17:00', endsAt: '24:00', multiplier: 1.2 },
    ]);
  });

  it('lets a single band cover the whole day', () => {
    expect(buildTimeBands('7', [{ name: 'Весь день', startsAt: '00:00', multiplier: 1 }])).toEqual([
      { cinemaId: '7', name: 'Весь день', startsAt: '00:00', endsAt: '24:00', multiplier: 1 },
    ]);
  });
});

describe('coversDayStart', () => {
  it('requires a band that starts at midnight', () => {
    expect(coversDayStart(DEFAULT_TIME_BANDS)).toBe(true);
    expect(coversDayStart([{ name: 'День', startsAt: '12:00', multiplier: 1 }])).toBe(false);
  });
});
