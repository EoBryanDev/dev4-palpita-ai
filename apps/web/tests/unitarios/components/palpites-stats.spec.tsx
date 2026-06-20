import { useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { PalpitesStats } from '@/components/palpites-stats';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

function makeMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: (overrides.id as string) ?? 'm1',
    timeA: (overrides.timeA as string) ?? 'Brasil',
    timeB: (overrides.timeB as string) ?? 'Uruguai',
    golsTimeA: (overrides.golsTimeA as number | null) ?? null,
    golsTimeB: (overrides.golsTimeB as number | null) ?? null,
    dataInicio: (overrides.dataInicio as string) ?? '2026-06-03T18:00:00Z',
    status: (overrides.status as string) ?? 'AGENDADO',
    rodadaNome: (overrides.rodadaNome as string) ?? 'Rodada 1',
    estatisticas: {
      total: (overrides.total as number) ?? 0,
      vitoriasA: (overrides.vitoriasA as number) ?? 0,
      vitoriasB: (overrides.vitoriasB as number) ?? 0,
      empates: (overrides.empates as number) ?? 0,
      pctVitoriasA: (overrides.pctVitoriasA as number) ?? 0,
      pctVitoriasB: (overrides.pctVitoriasB as number) ?? 0,
      pctEmpates: (overrides.pctEmpates as number) ?? 0,
    },
    palpitesIndividuaisLiberados:
      (overrides.palpitesIndividuaisLiberados as boolean) ?? false,
    palpitesIndividuais:
      (overrides.palpitesIndividuais as Array<{
        id: string;
        usuarioNome: string;
        golsTimeA: number;
        golsTimeB: number;
      }>) ?? [],
  };
}

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

    render(<PalpitesStats nomeUsuario={null} />);

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

    render(<PalpitesStats nomeUsuario={null} />);

    expect(screen.getByText(/Erro ao carregar estatísticas/i)).toBeDefined();
  });

  it('deve exibir as estatisticas coletivas e o aviso de bloqueio se o jogo nao tiver começado', async () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        makeMatch({
          status: 'AGENDADO',
          total: 5,
          vitoriasA: 3,
          vitoriasB: 1,
          empates: 1,
          pctVitoriasA: 60,
          pctVitoriasB: 20,
          pctEmpates: 20,
        }),
      ],
    });

    render(<PalpitesStats nomeUsuario={null} />);

    expect(screen.getByText('Brasil')).toBeDefined();
    expect(screen.getByText('Uruguai')).toBeDefined();
    expect(screen.getByText('5 palpites')).toBeDefined();

    const toggleBtn = screen.getByRole('button', {
      name: /Ver palpites individuais/i,
    });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Bloqueado por Segurança/i)).toBeDefined();
    expect(screen.queryByText('Alice')).toBeNull();
  });

  it('deve exibir a lista de palpites individuais se o jogo ja tiver começado', async () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        makeMatch({
          status: 'FINALIZADO',
          golsTimeA: 2,
          golsTimeB: 1,
          total: 1,
          vitoriasA: 1,
          pctVitoriasA: 100,
          palpitesIndividuaisLiberados: true,
          palpitesIndividuais: [
            { id: 'p1', usuarioNome: 'Gabriel', golsTimeA: 2, golsTimeB: 1 },
          ],
        }),
      ],
    });

    render(<PalpitesStats nomeUsuario={null} />);

    fireEvent.click(screen.getByText('Todos'));

    const toggleBtn = screen.getByRole('button', {
      name: /Ver palpites individuais/i,
    });
    fireEvent.click(toggleBtn);

    expect(screen.queryByText(/Bloqueado por Segurança/i)).toBeNull();
    expect(screen.getByText('Gabriel')).toBeDefined();
    expect(screen.getByText('2 x 1')).toBeDefined();
  });

  describe('Status Labels', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-12T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function renderMatch(overrides: Record<string, unknown> = {}) {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [makeMatch(overrides)],
      });
      render(<PalpitesStats nomeUsuario={null} />);
      fireEvent.click(screen.getByText('Todos'));
    }

    it('deve exibir status "Encerrado" quando o status da partida for FINALIZADO', () => {
      renderMatch({
        id: 'm-encerrado',
        timeA: 'Brasil',
        timeB: 'Argentina',
        dataInicio: '2026-06-12T10:00:00Z',
        status: 'FINALIZADO',
        rodadaNome: 'Oitavas',
      });

      expect(screen.getByText('Encerrado')).toBeDefined();
    });

    it('deve exibir status "Agendado" se o jogo ainda não começou', () => {
      renderMatch({
        id: 'm-agendado',
        timeA: 'Brasil',
        timeB: 'Argentina',
        dataInicio: '2026-06-12T13:00:00Z',
        status: 'AGENDADO',
        rodadaNome: 'Oitavas',
      });

      expect(screen.getByText('Agendado')).toBeDefined();
    });

    it('deve exibir status "Em Andamento" se o jogo começou há menos de 115 minutos e não está finalizado', () => {
      renderMatch({
        id: 'm-andamento',
        timeA: 'Brasil',
        timeB: 'Argentina',
        dataInicio: '2026-06-12T11:00:00Z',
        status: 'INICIADO',
        rodadaNome: 'Oitavas',
      });

      expect(screen.getByText('Em Andamento')).toBeDefined();
    });

    it('deve exibir status "Calculando Encerramento" se o jogo começou há 115 minutos ou mais e não está finalizado', () => {
      renderMatch({
        id: 'm-calculando',
        timeA: 'Brasil',
        timeB: 'Argentina',
        dataInicio: '2026-06-12T10:00:00Z',
        status: 'INICIADO',
        rodadaNome: 'Oitavas',
      });

      expect(screen.getByText('Calculando Encerramento')).toBeDefined();
    });
  });

  describe('Ordenação e Paginação', () => {
    it('deve ordenar jogos ativos primeiro (ordem cronológica) e finalizados por último (ordem cronológica)', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            id: 'm-completed-2',
            timeA: 'Time Comp 2',
            timeB: 'Outro',
            golsTimeA: 1,
            golsTimeB: 1,
            dataInicio: '2026-06-12T15:00:00Z',
            status: 'FINALIZADO',
            rodadaNome: 'Oitavas',
          }),
          makeMatch({
            id: 'm-active-1',
            timeA: 'Time Active 1',
            timeB: 'Outro',
            dataInicio: '2026-06-12T14:00:00Z',
            status: 'AGENDADO',
            rodadaNome: 'Oitavas',
          }),
          makeMatch({
            id: 'm-completed-1',
            timeA: 'Time Comp 1',
            timeB: 'Outro',
            golsTimeA: 2,
            golsTimeB: 0,
            dataInicio: '2026-06-12T16:00:00Z',
            status: 'FINALIZADO',
            rodadaNome: 'Oitavas',
          }),
          makeMatch({
            id: 'm-active-2',
            timeA: 'Time Active 2',
            timeB: 'Outro',
            dataInicio: '2026-06-12T13:00:00Z',
            status: 'AGENDADO',
            rodadaNome: 'Oitavas',
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);
      fireEvent.click(screen.getByText('Todos'));

      const elActive2 = screen.getByText('Time Active 2');
      const elActive1 = screen.getByText('Time Active 1');
      const elComp2 = screen.getByText('Time Comp 2');
      const elComp1 = screen.getByText('Time Comp 1');

      expect(elActive2.compareDocumentPosition(elActive1) & 4).toBe(4);
      expect(elActive1.compareDocumentPosition(elComp2) & 4).toBe(4);
      expect(elComp2.compareDocumentPosition(elComp1) & 4).toBe(4);
    });

    it('deve limitar a exibição a 6 jogos inicialmente, exibir "Visualizar mais" e resetar limite ao buscar', () => {
      const mockData = Array.from({ length: 8 }, (_, i) =>
        makeMatch({
          id: `m-${i}`,
          timeA: `Time ${i + 1}`,
          timeB: 'Outro',
          dataInicio: `2026-06-12T1${i}:00:00Z`,
          status: 'AGENDADO',
          rodadaNome: 'Oitavas',
        }),
      );

      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: mockData,
      });

      render(<PalpitesStats nomeUsuario={null} />);

      for (let i = 1; i <= 6; i++) {
        expect(screen.getByText(`Time ${i}`)).toBeDefined();
      }
      expect(screen.queryByText('Time 7')).toBeNull();
      expect(screen.queryByText('Time 8')).toBeNull();

      const loadMoreBtn = screen.getByRole('button', {
        name: /Visualizar mais/i,
      });
      expect(loadMoreBtn).toBeDefined();

      fireEvent.click(loadMoreBtn);

      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(`Time ${i}`)).toBeDefined();
      }
      expect(
        screen.queryByRole('button', { name: /Visualizar mais/i }),
      ).toBeNull();

      const searchInput = screen.getByPlaceholderText(
        /Filtrar jogos pelo nome de uma seleção/i,
      );
      fireEvent.change(searchInput, { target: { value: 'Time' } });

      expect(screen.queryByText('Time 7')).toBeNull();
      expect(screen.queryByText('Time 8')).toBeNull();
      expect(
        screen.getByRole('button', { name: /Visualizar mais/i }),
      ).toBeDefined();
    });
  });

  describe('Filtro de Status', () => {
    it('deve exibir apenas partidas pendentes por padrão', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            id: 'm1',
            timeA: 'Pendente',
            status: 'AGENDADO',
          }),
          makeMatch({
            id: 'm2',
            timeA: 'Finalizado',
            golsTimeA: 2,
            golsTimeB: 1,
            status: 'FINALIZADO',
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);

      expect(screen.getByText('Pendente')).toBeDefined();
      expect(screen.queryByText('Finalizado')).toBeNull();
    });

    it('deve filtrar por cada opção do filtro de status', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            id: 'm1',
            timeA: 'Pendente',
            status: 'AGENDADO',
          }),
          makeMatch({
            id: 'm2',
            timeA: 'Finalizado',
            golsTimeA: 2,
            golsTimeB: 1,
            status: 'FINALIZADO',
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);

      expect(screen.getByText('Pendente')).toBeDefined();
      expect(screen.queryByText('Finalizado')).toBeNull();

      fireEvent.click(screen.getByText('Todos'));

      expect(screen.getByText('Pendente')).toBeDefined();
      expect(screen.getByText('Finalizado')).toBeDefined();

      fireEvent.click(screen.getByText('Finalizados'));

      expect(screen.queryByText('Pendente')).toBeNull();
      expect(screen.getByText('Finalizado')).toBeDefined();
    });
  });

  describe('Modal de Votação', () => {
    it('deve abrir modal com todos os palpites ao clicar no total', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            total: 2,
            vitoriasA: 1,
            empates: 1,
            pctVitoriasA: 50,
            pctEmpates: 50,
            palpitesIndividuaisLiberados: true,
            palpitesIndividuais: [
              { id: 'v1', usuarioNome: 'Alice', golsTimeA: 2, golsTimeB: 0 },
              { id: 'v2', usuarioNome: 'Bob', golsTimeA: 1, golsTimeB: 1 },
            ],
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);

      fireEvent.click(screen.getByText('2 palpites'));

      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.getByText('Bob')).toBeDefined();
      expect(screen.getByText('2 x 0')).toBeDefined();
      expect(screen.getByText('1 x 1')).toBeDefined();
    });

    it('deve abrir modal filtrado por vitória do time A', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            timeA: 'Brasil',
            timeB: 'Argentina',
            total: 3,
            vitoriasA: 1,
            empates: 2,
            vitoriasB: 0,
            pctVitoriasA: 33,
            pctEmpates: 67,
            pctVitoriasB: 0,
            palpitesIndividuaisLiberados: true,
            palpitesIndividuais: [
              { id: 'v1', usuarioNome: 'Alice', golsTimeA: 2, golsTimeB: 0 },
              { id: 'v2', usuarioNome: 'Bob', golsTimeA: 1, golsTimeB: 1 },
              { id: 'v3', usuarioNome: 'Carol', golsTimeA: 0, golsTimeB: 0 },
            ],
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);

      const botoesStats = screen.getAllByRole('button');
      const btnVitoriaA = botoesStats.find((btn) =>
        btn
          .closest('.flex.justify-between.text-xs')
          ?.textContent?.includes('33%'),
      );
      if (btnVitoriaA) fireEvent.click(btnVitoriaA);

      expect(screen.getByText('Alice')).toBeDefined();
      expect(screen.queryByText('Bob')).toBeNull();
      expect(screen.queryByText('Carol')).toBeNull();
    });

    it('deve fechar modal ao clicar no X', () => {
      (useQuery as Mock).mockReturnValue({
        isLoading: false,
        isError: false,
        data: [
          makeMatch({
            total: 1,
            vitoriasA: 1,
            pctVitoriasA: 100,
            palpitesIndividuaisLiberados: true,
            palpitesIndividuais: [
              { id: 'v1', usuarioNome: 'Alice', golsTimeA: 2, golsTimeB: 0 },
            ],
          }),
        ],
      });

      render(<PalpitesStats nomeUsuario={null} />);

      fireEvent.click(screen.getByText('1 palpites'));
      expect(screen.getByText('Alice')).toBeDefined();

      const closeBtn = screen.getByRole('button', { name: '' });
      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find((btn) =>
        btn.innerHTML.includes('lucide lucide-x'),
      );
      if (xButton) fireEvent.click(xButton);

      expect(screen.queryByText('Alice')).toBeNull();
    });
  });
});
