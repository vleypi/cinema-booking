import { hashPassword, verifyPassword } from '@/common/security/password.js';

describe('password', () => {
  it('never stores the password itself and salts every hash', async () => {
    const [first, second] = await Promise.all([hashPassword('Secret-123'), hashPassword('Secret-123')]);

    expect(first).not.toContain('Secret-123');
    expect(first).not.toBe(second);
  });

  it('accepts the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('Secret-123');

    await expect(verifyPassword('Secret-123', hash)).resolves.toBe(true);
    await expect(verifyPassword('secret-123', hash)).resolves.toBe(false);
  });

  it('rejects a malformed hash instead of throwing', async () => {
    await expect(verifyPassword('Secret-123', 'not-a-hash')).resolves.toBe(false);
  });
});
