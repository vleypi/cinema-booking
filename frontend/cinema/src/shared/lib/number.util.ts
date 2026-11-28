const ORDINAL_DIGITS = 2;

export const padOrdinal = (value: number): string => String(value).padStart(ORDINAL_DIGITS, "0");
