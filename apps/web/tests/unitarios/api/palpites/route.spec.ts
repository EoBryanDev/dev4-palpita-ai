import { GET } from '@/app/api/palpites/route';
import { obterPalpitesUsuariosAtivos } from '@/services/palpites.service';
import { obterPartidas } from '@/services/partidas.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/services/partidas.service', () => ({
  obterPartidas: vi.fn(),
}));

vi.mock('@/services/palpites.service', () => ({
  obterPalpitesUsuariosAtivos: vi.fn(),
}));

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

    const mockObterPartidas = obterPartidas as Mock;
    const mockObterPalpites = obterPalpitesUsuariosAtivos as Mock;

    mockObterPartidas.mockResolvedValue(mockMatches);
    mockObterPalpites.mockResolvedValue(mockGuesses);

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

    // Como os palpites são liberados por padrão com a Copa iniciada, palpites individuais devem estar disponíveis
    expect(matchStats.palpitesIndividuaisLiberados).toBe(true);
    expect(matchStats.palpitesIndividuais).toEqual([
      {
        id: 'p1',
        usuarioNome: 'Alice',
        golsTimeA: 2,
        golsTimeB: 1,
      },
      {
        id: 'p2',
        usuarioNome: 'Bob',
        golsTimeA: 3,
        golsTimeB: 0,
      },
      {
        id: 'p3',
        usuarioNome: 'Charlie',
        golsTimeA: 1,
        golsTimeB: 1,
      },
    ]);
  });

  it('deve liberar palpites individuais se a partida ja tiver iniciado', async () => {
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

    const mockObterPartidas = obterPartidas as Mock;
    const mockObterPalpites = obterPalpitesUsuariosAtivos as Mock;

    mockObterPartidas.mockResolvedValue(mockMatches);
    mockObterPalpites.mockResolvedValue(mockGuesses);

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
    const mockObterPartidas = obterPartidas as Mock;
    mockObterPartidas.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Erro interno ao buscar estatísticas.');
  });
});
