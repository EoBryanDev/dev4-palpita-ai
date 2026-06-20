import { describe, expect, it, vi } from 'vitest';
import * as queries from '../db/queries.js';
import { syncOnce } from '../services/sync.service.js';

describe('SyncService', () => {
  it('should log sync_start and sync_complete when no pending matches', async () => {
    vi.spyOn(queries, 'buscarPartidasPendentes').mockResolvedValue([]);
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args[0]);

    const mockEngine = { scrapeMatch: vi.fn() };
    await syncOnce(mockEngine);

    expect(logs.some((l) => l.includes('sync_start'))).toBe(true);
    expect(logs.some((l) => l.includes('sync_complete'))).toBe(true);

    console.log = originalLog;
  });

  it('should call scrapeMatch for each pending match', async () => {
    const mockPartida = {
      id: 'abc-123',
      rodadaId: 'rod-1',
      timeAId: 'ta-1',
      timeBId: 'tb-1',
      timeANome: 'Brasil',
      timeBNome: 'Argentina',
      golsTimeA: null,
      golsTimeB: null,
      dataInicio: new Date('2024-01-01'),
      status: 'AGENDADO',
    };

    vi.spyOn(queries, 'buscarPartidasPendentes').mockResolvedValue([
      mockPartida,
    ]);
    vi.spyOn(queries, 'atualizarResultado').mockResolvedValue(undefined);
    vi.spyOn(queries, 'buscarEventosExistentes').mockResolvedValue([]);
    vi.spyOn(queries, 'inserirEventos').mockResolvedValue(0);

    const mockEngine = {
      scrapeMatch: vi.fn().mockResolvedValue({
        golsTimeA: 2,
        golsTimeB: 1,
        status: 'FINALIZADO',
        eventos: [{ tipo: 'GOL', timeId: '', jogador: 'Neymar', minuto: 45 }],
      }),
    };

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args[0]);

    await syncOnce(mockEngine);

    expect(mockEngine.scrapeMatch).toHaveBeenCalledWith(
      'Brasil',
      'Argentina',
      mockPartida.dataInicio,
    );
    expect(logs.some((l) => l.includes('sync_updated'))).toBe(true);
    expect(queries.atualizarResultado).toHaveBeenCalledWith(
      'abc-123',
      2,
      1,
      'FINALIZADO',
    );

    console.log = originalLog;
  });
});
