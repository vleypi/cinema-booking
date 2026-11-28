import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import { TICKET_QR_PREFIX } from '@/modules/tickets/tickets.constant.js';

const QR_SIGNATURE_LENGTH = 22;
const QR_IMAGE_WIDTH = 220;

const deriveSigningKey = (secret: string): Buffer => createHash('sha256').update(`ticket-qr-key:${secret}`).digest();

const computeSignature = (code: string, secret: string): string =>
  createHmac('sha256', deriveSigningKey(secret)).update(code).digest('base64url').slice(0, QR_SIGNATURE_LENGTH);

export const signTicketQrPayload = (code: string, secret: string): string => `${TICKET_QR_PREFIX}:${code}:${computeSignature(code, secret)}`;

export const verifyTicketQrPayload = (payload: string, secret: string): string | null => {
  const parts = payload.split(':');
  if (parts.length !== 4 || `${parts[0]}:${parts[1]}` !== TICKET_QR_PREFIX) return null;

  const [, , code, providedSignature] = parts;
  if (!code || !providedSignature) return null;

  const expectedSignature = computeSignature(code, secret);
  const actualBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length) return null;

  return timingSafeEqual(actualBuffer, expectedBuffer) ? code : null;
};

export const generateTicketQrPng = (payload: string): Promise<Buffer> =>
  QRCode.toBuffer(payload, {
    type: 'png',
    width: QR_IMAGE_WIDTH,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
