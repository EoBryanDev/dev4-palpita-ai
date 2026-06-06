import { useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { PalpitesStats } from '@/components/palpites-stats';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('PalpitesStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir spinner de carregamento quando isLoading for true', () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: [],
    });

    render(<PalpitesStats />);

    expect(
      screen.getByText(/Carregando as estatísticas coletivas/i),
    ).toBeDefined();
  });

  it('deve exibir mensagem de erro quando isError for true', () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Falha ao obter dados'),
      refetch: vi.fn(),
    });

    render(<PalpitesStats />);

    expect(screen.getByText(/Erro ao carregar estatísticas/i)).toBeDefined();
  });

  it('deve exibir as estatisticas coletivas e o aviso de bloqueio se o jogo nao tiver começado', async () => {
    const mockData = [
      {
        id: 'm1',
        timeA: 'Brasil',
        timeB: 'Uruguai',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: '2026-06-03T18:00:00Z',
        status: 'AGENDADO',
        rodadaNome: 'Rodada 1',
        estatisticas: {
          total: 5,
          vitoriasA: 3,
          vitoriasB: 1,
          empates: 1,
          pctVitoriasA: 60,
          pctVitoriasB: 20,
          pctEmpates: 20,
        },
        palpitesIndividuaisLiberados: false,
        palpitesIndividuais: [],
      },
    ];

    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData,
    });

    render(<PalpitesStats />);

    expect(screen.getByText('Brasil')).toBeDefined();
    expect(screen.getByText('Uruguai')).toBeDefined();
    expect(screen.getByText('5 palpites')).toBeDefined();

    // Expande os palpites individuais
    const toggleBtn = screen.getByRole('button', {
      name: /Ver palpites individuais/i,
    });
    fireEvent.click(toggleBtn);

    // Deve exibir o aviso de segurança
    expect(screen.getByText(/Bloqueado por Segurança/i)).toBeDefined();
    expect(screen.queryByText('Alice')).toBeNull();
  });

  it('deve exibir a lista de palpites individuais se o jogo ja tiver começado', async () => {
    const mockData = [
      {
        id: 'm1',
        timeA: 'Brasil',
        timeB: 'Uruguai',
        golsTimeA: 2,
        golsTimeB: 1,
        dataInicio: '2026-06-03T18:00:00Z',
        status: 'FINALIZADO',
        rodadaNome: 'Rodada 1',
        estatisticas: {
          total: 1,
          vitoriasA: 1,
          vitoriasB: 0,
          empates: 0,
          pctVitoriasA: 100,
          pctVitoriasB: 0,
          pctEmpates: 0,
        },
        palpitesIndividuaisLiberados: true,
        palpitesIndividuais: [
          {
            id: 'p1',
            usuarioNome: 'Gabriel',
            golsTimeA: 2,
            golsTimeB: 1,
          },
        ],
      },
    ];

    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData,
    });

    render(<PalpitesStats />);

    // Expande os palpites individuais
    const toggleBtn = screen.getByRole('button', {
      name: /Ver palpites individuais/i,
    });
    fireEvent.click(toggleBtn);

    // Não deve exibir o aviso de segurança, e sim a tabela
    expect(screen.queryByText(/Bloqueado por Segurança/i)).toBeNull();
    expect(screen.getByText('Gabriel')).toBeDefined();
    expect(screen.getByText('2 x 1')).toBeDefined();
  });
});
