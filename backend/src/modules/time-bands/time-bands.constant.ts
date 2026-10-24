export const DAY_START = '00:00';
export const DAY_END = '24:00';

export const TIME_BAND_NAME_MAX_LENGTH = 50;
export const TIME_BANDS_MAX = 12;

export const DEFAULT_TIME_BANDS = [
  { name: 'Утро', startsAt: DAY_START, multiplier: 0.825 },
  { name: 'День', startsAt: '12:00', multiplier: 1 },
  { name: 'Вечер', startsAt: '17:00', multiplier: 1.2 },
] as const;

export const TIME_BAND_MESSAGES = {
  dayStartMissing: 'Первый интервал должен начинаться в 00:00',
  duplicateStart: 'Два интервала не могут начинаться в одно время',
} as const;
