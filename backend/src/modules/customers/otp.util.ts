import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { OTP_LENGTH } from '@/modules/customers/customers.constant.js';

const OTP_MAX_EXCLUSIVE = 10 ** OTP_LENGTH;

export const generateOtpCode = (): string => String(randomInt(0, OTP_MAX_EXCLUSIVE)).padStart(OTP_LENGTH, '0');

export const hashOtpValue = (value: string): string => createHash('sha256').update(value).digest('hex');

export const verifyOtpHash = (code: string, expectedHash: string): boolean => {
  const actual = Buffer.from(hashOtpValue(code), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
};

export const buildOtpEmail = (code: string): { subject: string; text: string; html: string } => ({
  subject: `Код для входа в кинотеатр «Луч»: ${code}`,
  text: `Ваш одноразовый код для входа в личный кабинет кинотеатра «Луч»: ${code}\nКод действует 10 минут. Если вы не запрашивали вход, просто проигнорируйте это письмо.`,
  html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#060606;color:#ece6d8;">
  <h1 style="margin:0 0 16px;font-size:20px;">Кинотеатр «Луч»</h1>
  <p style="margin:0 0 16px;">Ваш одноразовый код для входа в личный кабинет:</p>
  <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:6px;color:#f0c779;">${code}</p>
  <p style="margin:0;font-size:13px;color:#a8a298;">Код действует 10 минут. Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>
</div>`,
});
