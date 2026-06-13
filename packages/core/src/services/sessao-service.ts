import { SignJWT, jwtVerify } from 'jose';
import { type ISessaoPayload, Sessao } from '../domain/sessao';
import type { Usuario } from '../domain/usuario.entity';

const JWT_ALGORITHM = 'HS256';
const encoder = new TextEncoder();

function obterChave(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return encoder.encode(secret);
}

function obterExpiracaoMs(): number {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export async function criarToken(usuario: Usuario): Promise<string> {
  const segredo = obterChave();
  const agora = Math.floor(Date.now() / 1000);
  const expSegundos = Math.floor(obterExpiracaoMs() / 1000);

  const token = await new SignJWT({
    sub: usuario.id,
    cargo: usuario.cargo,
    nome: usuario.nome,
    email: usuario.email,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt(agora)
    .setExpirationTime(agora + expSegundos)
    .sign(segredo);

  return token;
}

export async function verificarToken(token: string): Promise<Sessao | null> {
  try {
    const segredo = obterChave();
    const { payload } = await jwtVerify(token, segredo, {
      algorithms: [JWT_ALGORITHM],
    });
    return new Sessao(payload as unknown as ISessaoPayload);
  } catch {
    return null;
  }
}

export function obterSegredoParaValidacao(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
}
