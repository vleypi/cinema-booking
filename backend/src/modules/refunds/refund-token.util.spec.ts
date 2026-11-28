import { createRefundToken, verifyRefundToken } from '@/modules/refunds/refund-token.util.js';

const TEST_SECRET = 'test-refund-token-secret-32-chars-ok';

describe('refund-token.util', () => {
  it('signs and verifies a valid refund token before expiration', () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = createRefundToken('42', expiresAt, TEST_SECRET);
    const verified = verifyRefundToken(token, TEST_SECRET);

    expect(verified).not.toBeNull();
    expect(verified?.orderId).toBe('42');
    expect(verified?.jti).toBeTruthy();
  });

  it('rejects expired, tampered, or wrong-secret tokens', () => {
    const expiredToken = createRefundToken('42', new Date(Date.now() - 5_000), TEST_SECRET);
    expect(verifyRefundToken(expiredToken, TEST_SECRET)).toBeNull();

    const validToken = createRefundToken('42', new Date(Date.now() + 60_000), TEST_SECRET);
    expect(verifyRefundToken(`${validToken}x`, TEST_SECRET)).toBeNull();
    expect(verifyRefundToken(validToken, 'another-secret-32-chars-not-matching')).toBeNull();
  });
});
