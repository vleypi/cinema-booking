import { generateTicketQrPng, signTicketQrPayload, verifyTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';

const TEST_SECRET = 'test-secret-for-ticket-qr-signing-32-chars';

describe('ticket-qr.util', () => {
  it('signs and verifies a ticket QR payload', () => {
    const code = 'A7K9M2P4Q8';
    const payload = signTicketQrPayload(code, TEST_SECRET);

    expect(payload.startsWith(`LUCH:v1:${code}:`)).toBe(true);
    expect(verifyTicketQrPayload(payload, TEST_SECRET)).toBe(code);
  });

  it('rejects tampered codes, forged signatures, wrong secrets, and malformed payloads', () => {
    const code = 'A7K9M2P4Q8';
    const payload = signTicketQrPayload(code, TEST_SECRET);
    const [, , , signature] = payload.split(':');

    expect(verifyTicketQrPayload(`LUCH:v1:B7K9M2P4Q8:${signature}`, TEST_SECRET)).toBeNull();
    expect(verifyTicketQrPayload(`LUCH:v1:${code}:${signature.slice(0, -1)}Z`, TEST_SECRET)).toBeNull();
    expect(verifyTicketQrPayload(payload, 'different-secret-that-does-not-match-32')).toBeNull();
    expect(verifyTicketQrPayload('INVALID:PAYLOAD', TEST_SECRET)).toBeNull();
  });

  it('generates a PNG buffer for the QR payload', async () => {
    const png = await generateTicketQrPng(signTicketQrPayload('A7K9M2P4Q8', TEST_SECRET));

    expect(png.subarray(0, 4).toString('hex')).toBe('89504e47');
  });
});
