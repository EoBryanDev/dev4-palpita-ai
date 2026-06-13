import jwt from 'jsonwebtoken';
import { Sessao, type ISessaoPayload } from '../domain/sessao.js';
import type { Usuario } from '../domain/usuario.entity.js';

const JWT_ALGORITHM = 'HS256';

function obterSegredo(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
}

function obterExpiracao(): number {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export function criarToken(usuario: Usuario): string {
  const segredo = obterSegredo();
  const agora = Date.now();
  const exp = agora + obterExpiracao();

  const payload: ISessaoPayload & { [key: string]: unknown } = {
    sub: usuario.id,
    cargo: usuario.cargo,
    iat: agora,
    exp,
  };

  return jwt.sign(payload, segredo, { algorithm: JWT_ALGORITHM });
}

export function verificarToken(token: string): Sessao | null {
  try {
    const segredo = obterSegredo();
    const payload = jwt.verify(token, segredo, { algorithms: [JWT_ALGORITHM] }) as ISessaoPayload;
    return new Sessao(payload);
  } catch {
    return null;
  }
}

export function obterSegredoParaValidacao(): string {
  return obterSegredo();
}
