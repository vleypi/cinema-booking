import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export interface IRefundTokenPayload {
  orderId: string;
  jti: string;
  exp: number;
}

const deriveKey = (secret: string): Buffer => createHash('sha256').update(`refund-link-key:${secret}`).digest();

const signBody = (encodedBody: string, secret: string): string =>
  createHmac('sha256', deriveKey(secret)).update(encodedBody).digest('base64url');

export const createRefundToken = (orderId: string, expiresAt: Date, secret: string): string => {
  const payload: IRefundTokenPayload = {
    orderId,
    jti: randomUUID(),
    exp: Math.floor(expiresAt.getTime() / 1000),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${encoded}.${signBody(encoded, secret)}`;
};

export const verifyRefundToken = (token: string, secret: string, nowMs = Date.now()): IRefundTokenPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expected = signBody(encoded, secret);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<IRefundTokenPayload>;
    if (!parsed.orderId || !parsed.jti || typeof parsed.exp !== 'number') return null;
    if (parsed.exp * 1000 <= nowMs) return null;

    return { orderId: parsed.orderId, jti: parsed.jti, exp: parsed.exp };
  } catch {
    return null;
  }
};
