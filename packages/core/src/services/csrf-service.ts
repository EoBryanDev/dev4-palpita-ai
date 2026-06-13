import { randomUUID, createHmac } from 'node:crypto';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('CSRF_SECRET must be at least 16 characters long');
  }
  return secret;
}

function hmacToken(value: string): string {
  return createHmac('sha256', getCsrfSecret()).update(value).digest('hex');
}

export function gerarTokenCsrf(): string {
  const raw = randomUUID();
  const signature = hmacToken(raw);
  return `${raw}.${signature}`;
}

export function validarTokenCsrf(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [raw, signature] = parts;
  const expected = hmacToken(raw);
  if (signature !== expected) return false;
  return true;
}

export function validarCsrf(
  cookieToken: string | undefined,
  headerToken: string | undefined,
): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;
  return validarTokenCsrf(cookieToken);
}

export const CSRF_CONFIG = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
} as const;
