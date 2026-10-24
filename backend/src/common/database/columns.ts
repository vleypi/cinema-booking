import type { ColumnOptions } from 'typeorm';

const HOURS_MINUTES_LENGTH = 5;

export const MULTIPLIER_PRECISION = 4;
export const MULTIPLIER_SCALE = 3;

export const TIME_COLUMN: ColumnOptions = {
  type: 'time',
  transformer: { to: (time: string) => time, from: (time: string | null) => time?.slice(0, HOURS_MINUTES_LENGTH) ?? null },
};

export const MULTIPLIER_COLUMN: ColumnOptions = {
  type: 'numeric',
  precision: MULTIPLIER_PRECISION,
  scale: MULTIPLIER_SCALE,
  transformer: { to: (value: number) => value, from: (value: string | null) => (value === null ? null : Number(value)) },
};
