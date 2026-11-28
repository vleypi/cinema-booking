const KOPECKS_PER_RUBLE = 100;

export const formatKopecksToRubles = (kopecks: number): string => (kopecks / KOPECKS_PER_RUBLE).toFixed(2);

export const parseRublesToKopecks = (value: string): number | null => {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [rublesPart, kopecksPart = ''] = value.split('.');
  const rubles = Number(rublesPart);
  const kopecks = Number(kopecksPart.padEnd(2, '0'));

  return rubles * KOPECKS_PER_RUBLE + kopecks;
};
