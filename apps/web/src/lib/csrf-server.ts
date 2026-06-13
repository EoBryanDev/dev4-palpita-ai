import { headers } from 'next/headers';

/**
 * Valida a origem da requisição (Origin e Referer) para mitigar ataques CSRF em Server Actions.
 */
export async function validarOrigem(): Promise<void> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const referer = headersList.get('referer');

  // APP_URL configurada ou fallback padrão
  const allowedOrigin = process.env.APP_URL || 'http://localhost:3000';

  if (origin && !origin.startsWith(allowedOrigin)) {
    throw new Error('Origem inválida.');
  }

  if (referer && !referer.startsWith(allowedOrigin)) {
    throw new Error('Referer inválido.');
  }
}
