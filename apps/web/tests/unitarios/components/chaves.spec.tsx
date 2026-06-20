import ChavesPage from '@/app/chaves/page';
import { db } from '@palpita/db';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  return {
    db: {
      select: mockSelect,
    },
    times: {
      id: 'times.id',
      nome: 'times.nome',
      emoji: 'times.emoji',
      grupo: 'times.grupo',
    },
    partidas: {
      id: 'partidas.id',
      timeAId: 'partidas.timeAId',
      timeBId: 'partidas.timeBId',
      golsTimeA: 'partidas.golsTimeA',
      golsTimeB: 'partidas.golsTimeB',
      status: 'partidas.status',
    },
  };
});

vi.mock('@/components/chaves-client', () => {
  return {
    default: ({
      grupos,
    }: {
      grupos: {
        nome: string;
        times: { nome: string; emoji: string; pontos: number }[];
      }[];
    }) => {
      return (
        <div data-testid="chaves-client" data-grupos={JSON.stringify(grupos)} />
      );
    },
  };
});

describe('ChavesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular os pontos das seleções baseados nos resultados das partidas e ordenar de acordo com as regras da FIFA', async () => {
    const mockTimes = [
      { id: 't-brasil', nome: 'Brasil', emoji: '🇧🇷', grupo: 'Grupo A' },
      { id: 't-alemanha', nome: 'Alemanha', emoji: '🇩🇪', grupo: 'Grupo A' },
      { id: 't-argentina', nome: 'Argentina', emoji: '🇦🇷', grupo: 'Grupo A' },
    ];

    const mockPartidas = [
      // Brasil 2 x 0 Alemanha -> Brasil (+2 saldo, 2 gols pro, 3 pts) | Alemanha (-2 saldo, 0 gols pro, 0 pts)
      {
        id: 'p1',
        timeAId: 't-brasil',
        timeBId: 't-alemanha',
        golsTimeA: 2,
        golsTimeB: 0,
        status: 'FINALIZADO',
      },
      // Alemanha 3 x 0 Argentina -> Alemanha (+1 saldo, 3 gols pro, 3 pts) | Argentina (-3 saldo, 0 gols pro, 0 pts)
      {
        id: 'p2',
        timeAId: 't-alemanha',
        timeBId: 't-argentina',
        golsTimeA: 3,
        golsTimeB: 0,
        status: 'FINALIZADO',
      },
      // Argentina 1 x 0 Brasil -> Argentina (-2 saldo, 1 gols pro, 3 pts) | Brasil (+1 saldo, 2 gols pro, 3 pts)
      {
        id: 'p3',
        timeAId: 't-argentina',
        timeBId: 't-brasil',
        golsTimeA: 1,
        golsTimeB: 0,
        status: 'FINALIZADO',
      },
    ];

    const mockSelect = db.select as Mock;
    // Primeira chamada: busca os times
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => Promise.resolve(mockTimes)),
      })),
    }));
    // Segunda chamada: busca as partidas
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockPartidas)),
      })),
    }));

    // Renderiza a página RSC
    const rscNode = await ChavesPage();
    render(rscNode);

    const clientContainer = screen.getByTestId('chaves-client');
    const grupos = JSON.parse(
      clientContainer.getAttribute('data-grupos') || '[]',
    );

    expect(grupos).toHaveLength(1);
    expect(grupos[0].nome).toBe('Grupo A');

    const timesGrupoA = grupos[0].times;
    expect(timesGrupoA).toHaveLength(3);

    // 1º Alemanha (3 pts, saldo +1, 3 gols marcados)
    expect(timesGrupoA[0].nome).toBe('Alemanha');
    expect(timesGrupoA[0].pontos).toBe(3);

    // 2º Brasil (3 pts, saldo +1, 2 gols marcados)
    expect(timesGrupoA[1].nome).toBe('Brasil');
    expect(timesGrupoA[1].pontos).toBe(3);

    // 3º Argentina (3 pts, saldo -2, 1 gol marcado)
    expect(timesGrupoA[2].nome).toBe('Argentina');
    expect(timesGrupoA[2].pontos).toBe(3);
  });

  it('deve retornar o chaveamento contendo a fase de 16 avos de final preenchida', async () => {
    const { obterGruposClassificados } = await import(
      '@/services/chaves.service'
    );

    const mockTimes = [
      { id: 't-mexico', nome: 'México', emoji: '🇲🇽', grupo: 'Grupo A' },
      { id: 't-africa', nome: 'África do Sul', emoji: '🇿🇦', grupo: 'Grupo A' },
      { id: 't-coreia', nome: 'Coreia do Sul', emoji: '🇰🇷', grupo: 'Grupo A' },
      {
        id: 't-tcheca',
        nome: 'República Tcheca',
        emoji: '🇨🇿',
        grupo: 'Grupo A',
      },
    ];

    const mockPartidas = [
      {
        id: 'p1',
        timeAId: 't-mexico',
        timeBId: 't-africa',
        golsTimeA: 2,
        golsTimeB: 1,
        status: 'FINALIZADO',
      },
    ];

    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => Promise.resolve(mockTimes)),
      })),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockPartidas)),
      })),
    }));

    const result = await obterGruposClassificados();

    expect(result).toHaveProperty('grupos');
    expect(result).toHaveProperty('bracket');
    expect(result.bracket).toHaveProperty('dezesseisAvos');
    expect(result.bracket.dezesseisAvos).toHaveLength(16);
    expect(result.bracket.oitavas).toHaveLength(8);
  });
});
