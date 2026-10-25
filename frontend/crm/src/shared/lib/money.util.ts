const KOPECKS_PER_RUBLE = 100;

const RUBLES_FORMAT = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const MULTIPLIER_FORMAT = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 });

export const kopecksToRubles = (kopecks: number): number => kopecks / KOPECKS_PER_RUBLE;

export const rublesToKopecks = (rubles: number): number => Math.round(rubles * KOPECKS_PER_RUBLE);

export const formatRubles = (kopecks: number): string => RUBLES_FORMAT.format(kopecksToRubles(kopecks));

export const formatMultiplier = (multiplier: number): string => `×${MULTIPLIER_FORMAT.format(multiplier)}`;
