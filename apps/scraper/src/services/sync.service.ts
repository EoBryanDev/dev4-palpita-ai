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
  status: z.enum(['AGENDADO', 'EM_ANDAMENTO', 'FINALIZADO']),
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
      );

      if (!resultado) {
        log('sync_skip', {
          matchId: partida.id,
          reason: 'no data from engine',
        });
        continue;
      }

      const parsed = resultadoSchema.parse(resultado);

      const oldScore = `${partida.golsTimeA ?? '?'}x${partida.golsTimeB ?? '?'}`;
      const newScore = `${parsed.golsTimeA}x${parsed.golsTimeB}`;

      if (
        partida.golsTimeA === parsed.golsTimeA &&
        partida.golsTimeB === parsed.golsTimeB &&
        partida.status === parsed.status
      ) {
        log('sync_no_change', {
          matchId: partida.id,
          score: oldScore,
        });
        continue;
      }

      await atualizarResultado(
        partida.id,
        parsed.golsTimeA,
        parsed.golsTimeB,
        parsed.status,
      );

      let eventosInseridos = 0;
      if (resultado.eventos && resultado.eventos.length > 0) {
        const existentes = await buscarEventosExistentes(partida.id);
        eventosInseridos = await inserirEventos(
          partida.id,
          resultado.eventos,
          existentes,
        );
      }

      log('sync_updated', {
        matchId: partida.id,
        timeA: partida.timeANome,
        timeB: partida.timeBNome,
        oldScore,
        newScore,
        newStatus: parsed.status,
        eventosInseridos,
      });
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
