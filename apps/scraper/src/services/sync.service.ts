import { ZodError, z } from 'zod';
import {
  atualizarResultado,
  buscarEventosExistentes,
  buscarPartidasPendentes,
  inserirEventos,
} from '../db/queries.js';
import type { IScraperEngine } from '../types.js';

const resultadoSchema = z.object({
  golsTimeA: z.number().int().min(0),
  golsTimeB: z.number().int().min(0),
  status: z.string(),
  decididoEm: z.enum(['NORMAL', 'PRORROGACAO', 'PENALTIS']).optional(),
  timeVencedorPenaltis: z.enum(['A', 'B']).nullable().optional(),
});

function log(tipo: string, ...args: unknown[]) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      tipo,
      ...args.reduce<Record<string, unknown>>((acc, arg, i) => {
        if (typeof arg === 'object' && arg !== null) {
          Object.assign(acc, arg);
        } else {
          acc[`arg${i}`] = arg;
        }
        return acc;
      }, {}),
    }),
  );
}

export async function syncOnce(engine: IScraperEngine): Promise<void> {
  log('sync_start');

  const pendentes = await buscarPartidasPendentes();
  log('sync_pending', { total: pendentes.length });

  for (const partida of pendentes) {
    try {
      const resultado = await engine.scrapeMatch(
        partida.timeANome,
        partida.timeBNome,
        partida.dataInicio,
      );

      if (!resultado) {
        // Mesmo sem dados do engine, se o horário de início já passou
        // e o status ainda é AGENDADO, promove para EM_ANDAMENTO
        const agora = new Date();
        const jaDeveriaEstarEmAndamento =
          partida.dataInicio <= agora &&
          (partida.status === 'AGENDADO' || partida.status === 'AGENDADA');

        if (jaDeveriaEstarEmAndamento) {
          await atualizarResultado(
            partida.id,
            partida.golsTimeA ?? 0,
            partida.golsTimeB ?? 0,
            'EM_ANDAMENTO',
          );
          log('sync_promoted', {
            matchId: partida.id,
            timeA: partida.timeANome,
            timeB: partida.timeBNome,
            reason: 'match started but engine returned no data',
          });
        } else {
          log('sync_skip', {
            matchId: partida.id,
            reason: 'no data from engine',
          });
        }
        continue;
      }

      const parsed = resultadoSchema.parse(resultado);

      const oldScore = `${partida.golsTimeA ?? '?'}x${partida.golsTimeB ?? '?'}`;
      const newScore = `${parsed.golsTimeA}x${parsed.golsTimeB}`;

      // Se o engine retornou AGENDADO mas o horário já passou,
      // promove automaticamente para EM_ANDAMENTO
      const agora = new Date();
      if (parsed.status === 'AGENDADO' && partida.dataInicio <= agora) {
        parsed.status = 'EM_ANDAMENTO';
      }

      const scoreOrStatusChanged =
        partida.golsTimeA !== parsed.golsTimeA ||
        partida.golsTimeB !== parsed.golsTimeB ||
        partida.status !== parsed.status ||
        partida.decididoEm !== parsed.decididoEm ||
        partida.timeVencedorPenaltis !== parsed.timeVencedorPenaltis;

      if (scoreOrStatusChanged) {
        await atualizarResultado(
          partida.id,
          parsed.golsTimeA,
          parsed.golsTimeB,
          parsed.status,
          parsed.decididoEm,
          parsed.timeVencedorPenaltis,
        );
      }

      let eventosInseridos = 0;
      if (resultado.eventos && resultado.eventos.length > 0) {
        const eventosComTimeId = resultado.eventos.map((evt) => {
          let timeId: string | undefined = undefined;
          if (evt.timeNome === partida.timeANome) {
            timeId = partida.timeAId;
          } else if (evt.timeNome === partida.timeBNome) {
            timeId = partida.timeBId;
          }
          return {
            ...evt,
            timeId,
          };
        });

        const existentes = await buscarEventosExistentes(partida.id);
        eventosInseridos = await inserirEventos(
          partida.id,
          eventosComTimeId,
          existentes,
        );
      }

      if (scoreOrStatusChanged || eventosInseridos > 0) {
        log('sync_updated', {
          matchId: partida.id,
          timeA: partida.timeANome,
          timeB: partida.timeBNome,
          oldScore,
          newScore,
          newStatus: parsed.status,
          eventosInseridos,
        });
      } else {
        log('sync_no_change', {
          matchId: partida.id,
          score: oldScore,
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        log('sync_error', {
          matchId: partida.id,
          error: 'validation failed',
          details: error.errors,
        });
      } else {
        log('sync_error', {
          matchId: partida.id,
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    }
  }

  log('sync_complete');
}
