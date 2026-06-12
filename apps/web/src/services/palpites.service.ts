import type { IPartidaDashboard } from '@/interface/IDashboard';
import { db, palpites, partidas, rodadas, times, usuarios } from '@palpita/db';
import { and, asc, count, eq, gt, inArray, ne, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

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
    .where(
      and(
        or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')),
        ne(usuarios.cargo, 'ADMIN'),
      ),
    );

  return dbPalpites;
}

export async function obterTotalPalpitesSalvosFuturos(
  usuarioId: string,
): Promise<number> {
  const agora = new Date();

  const result = await db
    .select({ value: count() })
    .from(palpites)
    .innerJoin(partidas, eq(palpites.partidaId, partidas.id))
    .where(
      and(
        eq(palpites.usuarioId, usuarioId),
        ne(partidas.status, 'FINALIZADO'),
        ne(partidas.status, 'FINALIZADA'),
      ),
    );

  return result[0]?.value ?? 0;
}

export async function obterPalpitesSalvosFuturosPaginados(
  usuarioId: string,
  limit: number,
  offset: number,
): Promise<IPartidaDashboard[]> {
  const timeA = alias(times, 'time_a');
  const timeB = alias(times, 'time_b');
  const agora = new Date();

  const queryResult = await db
    .select({
      id: partidas.id,
      timeA: timeA.nome,
      timeB: timeB.nome,
      timeAEmoji: timeA.emoji,
      timeBEmoji: timeB.emoji,
      dataInicio: partidas.dataInicio,
      status: partidas.status,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      palpiteGolsA: palpites.golsTimeA,
      palpiteGolsB: palpites.golsTimeB,
      rodadaNome: rodadas.nome,
    })
    .from(palpites)
    .innerJoin(partidas, eq(palpites.partidaId, partidas.id))
    .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .where(
      and(
        eq(palpites.usuarioId, usuarioId),
        ne(partidas.status, 'FINALIZADO'),
        ne(partidas.status, 'FINALIZADA'),
      ),
    )
    .orderBy(
      sql`CASE WHEN ${partidas.dataInicio} >= ${agora} THEN 0 ELSE 1 END`,
      asc(partidas.dataInicio),
    )
    .limit(limit)
    .offset(offset);

  return queryResult.map((item) => ({
    id: item.id,
    timeA: item.timeA,
    timeB: item.timeB,
    timeAEmoji: item.timeAEmoji ?? undefined,
    timeBEmoji: item.timeBEmoji ?? undefined,
    dataInicio: item.dataInicio.toISOString(),
    status: item.status,
    golsTimeA: item.golsTimeA,
    golsTimeB: item.golsTimeB,
    palpiteGolsA: item.palpiteGolsA,
    palpiteGolsB: item.palpiteGolsB,
    jaPalpitou: true,
    rodadaNome: item.rodadaNome,
  }));
}

export async function obterTodosPalpitesUsuario(
  usuarioId: string,
): Promise<IPartidaDashboard[]> {
  const timeA = alias(times, 'time_a');
  const timeB = alias(times, 'time_b');

  const queryResult = await db
    .select({
      id: partidas.id,
      timeA: timeA.nome,
      timeB: timeB.nome,
      timeAEmoji: timeA.emoji,
      timeBEmoji: timeB.emoji,
      dataInicio: partidas.dataInicio,
      status: partidas.status,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      palpiteGolsA: palpites.golsTimeA,
      palpiteGolsB: palpites.golsTimeB,
      rodadaNome: rodadas.nome,
    })
    .from(palpites)
    .innerJoin(partidas, eq(palpites.partidaId, partidas.id))
    .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .where(eq(palpites.usuarioId, usuarioId))
    .orderBy(asc(partidas.dataInicio));

  return queryResult.map((item) => ({
    id: item.id,
    timeA: item.timeA,
    timeB: item.timeB,
    timeAEmoji: item.timeAEmoji ?? undefined,
    timeBEmoji: item.timeBEmoji ?? undefined,
    dataInicio: item.dataInicio.toISOString(),
    status: item.status,
    golsTimeA: item.golsTimeA,
    golsTimeB: item.golsTimeB,
    palpiteGolsA: item.palpiteGolsA,
    palpiteGolsB: item.palpiteGolsB,
    jaPalpitou: true,
    rodadaNome: item.rodadaNome,
  }));
}
