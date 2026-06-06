import { db, palpites, usuarios } from '@palpita/db';
import { and, eq, inArray, or } from 'drizzle-orm';

export interface IPalpiteServiceData {
  id: string;
  partidaId: string;
  usuarioId: string;
  golsTimeA: number;
  golsTimeB: number;
  dataCriacao: Date;
}

export async function obterPalpitesUsuario(
  usuarioId: string,
): Promise<IPalpiteServiceData[]> {
  const dbPalpites = await db
    .select()
    .from(palpites)
    .where(eq(palpites.usuarioId, usuarioId));

  return dbPalpites.map((p) => ({
    id: p.id,
    partidaId: p.partidaId,
    usuarioId: p.usuarioId,
    golsTimeA: p.golsTimeA,
    golsTimeB: p.golsTimeB,
    dataCriacao: p.dataCriacao,
  }));
}

export async function obterPalpitesConfirmadosCount(
  partidaIds: string[],
  usuarioIds: string[],
): Promise<number> {
  if (partidaIds.length === 0 || usuarioIds.length === 0) {
    return 0;
  }

  const resultPalpites = await db
    .select({ id: palpites.id })
    .from(palpites)
    .where(
      and(
        inArray(palpites.partidaId, partidaIds),
        inArray(palpites.usuarioId, usuarioIds),
      ),
    );

  return resultPalpites.length;
}

export interface IPalpiteComUsuario {
  id: string;
  partidaId: string;
  golsTimeA: number;
  golsTimeB: number;
  usuarioNome: string;
}

export async function obterPalpitesUsuariosAtivos(): Promise<
  IPalpiteComUsuario[]
> {
  const dbPalpites = await db
    .select({
      id: palpites.id,
      partidaId: palpites.partidaId,
      golsTimeA: palpites.golsTimeA,
      golsTimeB: palpites.golsTimeB,
      usuarioNome: usuarios.nome,
    })
    .from(palpites)
    .innerJoin(usuarios, eq(palpites.usuarioId, usuarios.id))
    .where(or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')));

  return dbPalpites;
}
