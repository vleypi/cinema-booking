import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const deriveKey = promisify(argon2);
const ARGON2_OPTIONS = { memory: 19456, passes: 2, parallelism: 1, tagLength: 32 };
const SALT_LENGTH = 16;

const derive = (password: string, salt: Buffer) => deriveKey('argon2id', { message: password, nonce: salt, ...ARGON2_OPTIONS });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH);
  return `${salt.toString('base64')}:${(await derive(password, salt)).toString('base64')}`;
};

export const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) return false;

  return timingSafeEqual(await derive(password, Buffer.from(salt, 'base64')), Buffer.from(hash, 'base64'));
};
