import { buildOrderTicketsPdf } from '@/modules/tickets/ticket-pdf.util.js';

const TEST_SECRET = 'test-secret-for-ticket-pdf-generation-32';

describe('ticket-pdf.util', () => {
  it('generates a valid PDF with one page per ticket', async () => {
    const pdf = await buildOrderTicketsPdf(
      {
        orderNumber: 'LUCH-TEST0001',
        filmTitle: 'Интерстеллар',
        format: 'IMAX',
        cinemaName: 'Луч Центральный',
        cinemaAddress: 'Москва, ул. Тверская, 12',
        cinemaTimezone: 'Europe/Moscow',
        hallName: 'Зал 1 IMAX',
        startsAt: new Date('2026-12-01T16:30:00.000Z'),
        tickets: [
          { code: 'A7K9M2P4Q8', row: 5, number: 7, price: 65000 },
          { code: 'C3D5E8F2H9', row: 5, number: 8, price: 65000 },
        ],
      },
      TEST_SECRET,
    );

    const raw = pdf.toString('latin1');
    const pageMatches = raw.match(/\/Type \/Page\b/g) ?? [];

    expect(raw.startsWith('%PDF-')).toBe(true);
    expect(pageMatches).toHaveLength(2);
  });
});
