import { db, tokensConvite, usuarios } from '@palpita/db';
import { desc, eq } from 'drizzle-orm';

export interface IUsuarioResumo {
  id: string;
  status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
}

export interface IUsuarioDetalhista {
  id: string;
  nome: string;
  email: string;
  status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
  cargo: 'ADMIN' | 'COLABORADOR';
  dataCriacao: string;
  tokenId?: string | null;
}

export interface ITokenEUsuario {
  token: {
    id: string;
    usuarioId: string;
    dataCriacao: Date;
    usado: boolean;
  } | null;
  usuario: {
    id: string;
    nome: string;
    status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
  } | null;
}

export async function obterResumoStatusUsuarios(): Promise<IUsuarioResumo[]> {
  const dbUsers = await db
    .select({
      id: usuarios.id,
      status: usuarios.status,
    })
    .from(usuarios);

  return dbUsers;
}

export async function obterUsuariosComToken(): Promise<IUsuarioDetalhista[]> {
  const result = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      status: usuarios.status,
      cargo: usuarios.cargo,
      dataCriacao: usuarios.dataCriacao,
      tokenId: tokensConvite.id,
      tokenUsado: tokensConvite.usado,
    })
    .from(usuarios)
    .leftJoin(tokensConvite, eq(usuarios.id, tokensConvite.usuarioId))
    .orderBy(desc(usuarios.dataCriacao));

  // Deduplicar e mapear
  const uniqueUsersMap = new Map<string, IUsuarioDetalhista>();

  for (const r of result) {
    const existing = uniqueUsersMap.get(r.id);
    const hasUnusedToken = r.tokenId && !r.tokenUsado;

    if (!existing || (!existing.tokenId && hasUnusedToken)) {
      uniqueUsersMap.set(r.id, {
        id: r.id,
        nome: r.nome,
        email: r.email,
        status: r.status,
        cargo: r.cargo,
        dataCriacao: r.dataCriacao.toISOString(),
        tokenId: hasUnusedToken ? r.tokenId : null,
      });
    }
  }

  return Array.from(uniqueUsersMap.values());
}

export async function obterTokenEUsuario(
  tokenId: string,
): Promise<ITokenEUsuario> {
  const tokenData = await db.query.tokensConvite.findFirst({
    where: eq(tokensConvite.id, tokenId),
  });

  if (!tokenData) {
    return { token: null, usuario: null };
  }

  const usuarioData = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, tokenData.usuarioId),
  });

  return {
    token: {
      id: tokenData.id,
      usuarioId: tokenData.usuarioId,
      dataCriacao: tokenData.dataCriacao,
      usado: tokenData.usado,
    },
    usuario: usuarioData
      ? {
          id: usuarioData.id,
          nome: usuarioData.nome,
          status: usuarioData.status,
        }
      : null,
  };
}

export async function obterUsuarioPorId(id: string) {
  const user = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, id),
  });
  return user || null;
}
