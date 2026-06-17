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

      const scoreOrStatusChanged =
        partida.golsTimeA !== parsed.golsTimeA ||
        partida.golsTimeB !== parsed.golsTimeB ||
        partida.status !== parsed.status;

      if (scoreOrStatusChanged) {
        await atualizarResultado(
          partida.id,
          parsed.golsTimeA,
          parsed.golsTimeB,
          parsed.status,
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
