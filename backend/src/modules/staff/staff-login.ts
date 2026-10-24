export const LOGIN_MAX_LENGTH = 64;
export const LOGIN_PATTERN = /^[a-z0-9._-]+$/;

export const normalizeLogin = (login: string): string => login.trim().toLowerCase();
