import { db, partidas, rodadas, times } from '@palpita/db';
import { and, asc, eq, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export interface IPartidaCompleta {
  id: string;
  rodadaId: string;
  timeA: string;
  timeB: string;
  timeAEmoji: string;
  timeBEmoji: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: Date;
  status: string;
  rodadaNome: string;
}

export async function obterPartidas(
  rodadaId?: string,
  excluirFinalizadas = false,
): Promise<IPartidaCompleta[]> {
  const timeA = alias(times, 'time_a');
  const timeB = alias(times, 'time_b');

  const query = db
    .select({
      id: partidas.id,
      rodadaId: partidas.rodadaId,
      timeA: timeA.nome,
      timeB: timeB.nome,
      timeAEmoji: timeA.emoji,
      timeBEmoji: timeB.emoji,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      dataInicio: partidas.dataInicio,
      status: partidas.status,
      rodadaNome: rodadas.nome,
    })
    .from(partidas)
    .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .$dynamic();

  const conditions = [];

  if (rodadaId) {
    conditions.push(eq(partidas.rodadaId, rodadaId));
  }

  if (excluirFinalizadas) {
    conditions.push(ne(partidas.status, 'FINALIZADO'));
    conditions.push(ne(partidas.status, 'FINALIZADA'));
  }

  let finalQuery = query;
  if (conditions.length > 0) {
    finalQuery = query.where(and(...conditions));
  }

  return finalQuery.orderBy(asc(partidas.dataInicio));
}
