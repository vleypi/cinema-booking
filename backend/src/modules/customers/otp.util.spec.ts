import { OTP_LENGTH } from '@/modules/customers/customers.constant.js';
import { buildOtpEmail, generateOtpCode, hashOtpValue, verifyOtpHash } from '@/modules/customers/otp.util.js';

describe('otp.util', () => {
  it('generates a zero-padded 6-digit numeric code', () => {
    for (let index = 0; index < 30; index++) {
      const code = generateOtpCode();
      expect(code).toHaveLength(OTP_LENGTH);
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it('verifies matching hashes and rejects wrong codes or malformed hashes', () => {
    const code = '042918';
    const hash = hashOtpValue(code);

    expect(verifyOtpHash(code, hash)).toBe(true);
    expect(verifyOtpHash('042919', hash)).toBe(false);
    expect(verifyOtpHash(code, 'not-a-valid-sha256-hex')).toBe(false);
  });

  it('includes the OTP code in subject, plain text, and html', () => {
    const code = '123456';
    const email = buildOtpEmail(code);

    expect(email.subject).toContain(code);
    expect(email.text).toContain(code);
    expect(email.html).toContain(code);
  });
});
