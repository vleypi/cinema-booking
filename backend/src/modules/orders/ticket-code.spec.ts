import { generateOrderNumber, generateTicketCode, ORDER_NUMBER_PREFIX, ORDER_NUMBER_RANDOM_LENGTH, TICKET_CODE_ALPHABET, TICKET_CODE_LENGTH } from '@/modules/orders/ticket-code.js';

describe('ticket-code', () => {
  it('generates a 10-character code using only non-ambiguous uppercase characters', () => {
    const allowed = new Set(TICKET_CODE_ALPHABET);
    const forbidden = ['0', 'O', '1', 'I', 'L'];

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const code = generateTicketCode();
      expect(code).toHaveLength(TICKET_CODE_LENGTH);
      for (const char of code) {
        expect(allowed.has(char)).toBe(true);
        expect(forbidden).not.toContain(char);
      }
    }
  });

  it('generates an order number with the expected prefix and length', () => {
    const orderNumber = generateOrderNumber();

    expect(orderNumber.startsWith(ORDER_NUMBER_PREFIX)).toBe(true);
    expect(orderNumber).toHaveLength(ORDER_NUMBER_PREFIX.length + ORDER_NUMBER_RANDOM_LENGTH);
  });
});
