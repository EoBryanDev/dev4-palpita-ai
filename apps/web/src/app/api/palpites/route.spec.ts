import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { GET } from './route';

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  return {
    db: {
      select: mockSelect,
    },
    partidas: {
      id: 'partidas.id',
      timeAId: 'partidas.timeAId',
      timeBId: 'partidas.timeBId',
      golsTimeA: 'partidas.golsTimeA',
      golsTimeB: 'partidas.golsTimeB',
      dataInicio: 'partidas.dataInicio',
      status: 'partidas.status',
      rodadaId: 'partidas.rodadaId',
    },
    rodadas: {
      nome: 'rodadas.nome',
      id: 'rodadas.id',
    },
    palpites: {
      id: 'palpites.id',
      partidaId: 'palpites.partidaId',
      golsTimeA: 'palpites.golsTimeA',
      golsTimeB: 'palpites.golsTimeB',
      usuarioId: 'palpites.usuarioId',
    },
    usuarios: {
      id: 'usuarios.id',
      nome: 'usuarios.nome',
      status: 'usuarios.status',
    },
    times: {
      id: 'times.id',
      nome: 'times.nome',
      emoji: 'times.emoji',
    },
  };
});

describe('GET /api/palpites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve calcular estatisticas coletivas de palpites corretamente', async () => {
    // Configura tempo do servidor para antes do inicio das partidas
    vi.setSystemTime(new Date('2026-06-03T12:00:00Z'));

    const mockMatches = [
      {
        id: 'm1',
        timeA: 'Brasil',
        timeB: 'Uruguai',
        timeAEmoji: '🇧🇷',
        timeBEmoji: '🇺🇾',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-03T18:00:00Z'),
        status: 'AGENDADO',
        rodadaNome: 'Rodada 1',
      },
    ];

    const mockGuesses = [
      // 3 palpites no total: 2 para vitoria do Brasil (A), 1 para Empate, 0 para Uruguai (B)
      {
        id: 'p1',
        partidaId: 'm1',
        golsTimeA: 2,
        golsTimeB: 1,
        usuarioNome: 'Alice',
      },
      {
        id: 'p2',
        partidaId: 'm1',
        golsTimeA: 3,
        golsTimeB: 0,
        usuarioNome: 'Bob',
      },
      {
        id: 'p3',
        partidaId: 'm1',
        golsTimeA: 1,
        golsTimeB: 1,
        usuarioNome: 'Charlie',
      },
    ];

    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => {
        // biome-ignore lint/suspicious/noExplicitAny: mock query builder
        const query: any = {
          innerJoin: vi.fn(() => query),
          // biome-ignore lint/suspicious/noThenProperty: thenable mock query
          then: (resolve: (value: unknown) => void) => resolve(mockMatches),
        };
        return query;
      }),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => {
        // biome-ignore lint/suspicious/noExplicitAny: mock query builder
        const query: any = {
          innerJoin: vi.fn(() => query),
          where: vi.fn(() => query),
          // biome-ignore lint/suspicious/noThenProperty: thenable mock query
          then: (resolve: (value: unknown) => void) => resolve(mockGuesses),
        };
        return query;
      }),
    }));

    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveLength(1);

    const matchStats = json[0];
    expect(matchStats.timeAEmoji).toBe('🇧🇷');
    expect(matchStats.timeBEmoji).toBe('🇺🇾');
    expect(matchStats.estatisticas).toEqual({
      total: 3,
      vitoriasA: 2,
      vitoriasB: 0,
      empates: 1,
      pctVitoriasA: 67, // 2/3 = 66.6% -> 67%
      pctVitoriasB: 0,
      pctEmpates: 33, // 1/3 = 33.3% -> 33%
    });

    // Como o jogo não começou, palpites individuais devem estar bloqueados (RN03)
    expect(matchStats.palpitesIndividuaisLiberados).toBe(false);
    expect(matchStats.palpitesIndividuais).toEqual([]);
  });

  it('deve liberar palpites individuais se a partida ja tiver iniciado (RN03)', async () => {
    // Configura tempo do servidor para após o inicio da partida
    vi.setSystemTime(new Date('2026-06-03T19:00:00Z'));

    const mockMatches = [
      {
        id: 'm1',
        timeA: 'Brasil',
        timeB: 'Uruguai',
        timeAEmoji: '🇧🇷',
        timeBEmoji: '🇺🇾',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-03T18:00:00Z'),
        status: 'AGENDADO',
        rodadaNome: 'Rodada 1',
      },
    ];

    const mockGuesses = [
      {
        id: 'p1',
        partidaId: 'm1',
        golsTimeA: 2,
        golsTimeB: 1,
        usuarioNome: 'Alice',
      },
    ];

    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => {
        // biome-ignore lint/suspicious/noExplicitAny: mock query builder
        const query: any = {
          innerJoin: vi.fn(() => query),
          // biome-ignore lint/suspicious/noThenProperty: thenable mock query
          then: (resolve: (value: unknown) => void) => resolve(mockMatches),
        };
        return query;
      }),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => {
        // biome-ignore lint/suspicious/noExplicitAny: mock query builder
        const query: any = {
          innerJoin: vi.fn(() => query),
          where: vi.fn(() => query),
          // biome-ignore lint/suspicious/noThenProperty: thenable mock query
          then: (resolve: (value: unknown) => void) => resolve(mockGuesses),
        };
        return query;
      }),
    }));

    const response = await GET();
    const json = await response.json();

    const matchStats = json[0];
    expect(matchStats.palpitesIndividuaisLiberados).toBe(true);
    expect(matchStats.palpitesIndividuais).toEqual([
      {
        id: 'p1',
        usuarioNome: 'Alice',
        golsTimeA: 2,
        golsTimeB: 1,
      },
    ]);
  });

  it('deve retornar status 500 se houver um erro no banco', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await GET();
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Erro interno ao buscar estatísticas.');
  });
});
