import { db, eventosPartida, partidas, times } from '@palpita/db';
import { and, asc, eq, gte, lte, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { IScrapeEvent } from '../types.js';

const timeA = alias(times, 'time_a');
const timeB = alias(times, 'time_b');

export interface IPartidaPendente {
  id: string;
  rodadaId: string;
  timeAId: string;
  timeBId: string;
  timeANome: string;
  timeBNome: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: Date;
  status: string;
}

export async function buscarPartidasPendentes(): Promise<IPartidaPendente[]> {
  const agora = new Date();
  const tresHorasAtras = new Date(agora.getTime() - 3 * 60 * 60 * 1000);
  const rows = await db
    .select({
      id: partidas.id,
      rodadaId: partidas.rodadaId,
      timeAId: partidas.timeAId,
      timeBId: partidas.timeBId,
      timeANome: timeA.nome,
      timeBNome: timeB.nome,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      dataInicio: partidas.dataInicio,
      status: partidas.status,
    })
    .from(partidas)
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .where(
      and(
        lte(partidas.dataInicio, agora),
        or(
          eq(partidas.status, 'EM_ANDAMENTO'),
          and(
            or(
              eq(partidas.status, 'AGENDADO'),
              eq(partidas.status, 'AGENDADA'),
            ),
            gte(partidas.dataInicio, tresHorasAtras),
          ),
        ),
      ),
    )
    .orderBy(asc(partidas.dataInicio));

  return rows;
}

export async function atualizarResultado(
  partidaId: string,
  golsA: number,
  golsB: number,
  status: string,
): Promise<void> {
  await db
    .update(partidas)
    .set({
      golsTimeA: golsA,
      golsTimeB: golsB,
      status: status as 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO',
    })
    .where(eq(partidas.id, partidaId));
}

export async function buscarEventosExistentes(
  partidaId: string,
): Promise<IScrapeEvent[]> {
  const rows = await db
    .select()
    .from(eventosPartida)
    .where(eq(eventosPartida.partidaId, partidaId));

  return rows.map((r) => ({
    tipo: r.tipo as IScrapeEvent['tipo'],
    timeId: r.timeId ?? '',
    jogador: r.jogador ?? '',
    minuto: r.minuto,
    acrescimos: r.acrescimos ?? undefined,
    info: r.info ?? undefined,
  }));
}

export async function inserirEventos(
  partidaId: string,
  eventos: IScrapeEvent[],
  eventosExistentes: IScrapeEvent[],
): Promise<number> {
  const existsSet = new Set(
    eventosExistentes.map((e) => `${e.minuto}|${e.tipo}|${e.jogador}`),
  );

  const novos = eventos.filter(
    (e) => !existsSet.has(`${e.minuto}|${e.tipo}|${e.jogador}`),
  );

  if (novos.length === 0) return 0;

  for (const evento of novos) {
    await db.insert(eventosPartida).values({
      partidaId,
      tipo: evento.tipo,
      timeId: evento.timeId || null,
      jogador: evento.jogador || null,
      minuto: evento.minuto,
      acrescimos: evento.acrescimos ?? null,
      info: evento.info ?? null,
    });
  }

  return novos.length;
}
