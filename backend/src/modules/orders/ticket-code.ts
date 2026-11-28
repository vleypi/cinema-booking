import { randomBytes } from 'node:crypto';

export const TICKET_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const TICKET_CODE_LENGTH = 10;
export const ORDER_NUMBER_RANDOM_LENGTH = 8;
export const ORDER_NUMBER_PREFIX = 'L-';

const randomFromAlphabet = (length: number): string => {
  const bytes = randomBytes(length);
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += TICKET_CODE_ALPHABET[bytes[index] % TICKET_CODE_ALPHABET.length];
  }

  return result;
};

export const generateTicketCode = (): string => randomFromAlphabet(TICKET_CODE_LENGTH);

export const generateOrderNumber = (): string => `${ORDER_NUMBER_PREFIX}${randomFromAlphabet(ORDER_NUMBER_RANDOM_LENGTH)}`;
