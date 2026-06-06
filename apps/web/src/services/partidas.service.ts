import { db, partidas, rodadas, times } from '@palpita/db';
import { asc, eq } from 'drizzle-orm';
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
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id));

  if (rodadaId) {
    // Drizzle handles dynamic where clauses perfectly
    const filteredQuery = query.where(eq(partidas.rodadaId, rodadaId));
    return filteredQuery.orderBy(asc(partidas.dataInicio));
  }

  return query.orderBy(asc(partidas.dataInicio));
}
