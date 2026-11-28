import { formatKopecksToRubles, parseRublesToKopecks } from '@/modules/payments/yookassa.util.js';

describe('yookassa.util', () => {
  it('formats kopecks as a two-decimal ruble string', () => {
    expect(formatKopecksToRubles(0)).toBe('0.00');
    expect(formatKopecksToRubles(50)).toBe('0.50');
    expect(formatKopecksToRubles(45000)).toBe('450.00');
    expect(formatKopecksToRubles(123456)).toBe('1234.56');
  });

  it('parses valid ruble strings to integer kopecks and rejects invalid formats', () => {
    expect(parseRublesToKopecks('0.00')).toBe(0);
    expect(parseRublesToKopecks('450')).toBe(45000);
    expect(parseRublesToKopecks('450.5')).toBe(45050);
    expect(parseRublesToKopecks('1234.56')).toBe(123456);
    expect(parseRublesToKopecks('-10.00')).toBeNull();
    expect(parseRublesToKopecks('10.123')).toBeNull();
    expect(parseRublesToKopecks('abc')).toBeNull();
  });
});
