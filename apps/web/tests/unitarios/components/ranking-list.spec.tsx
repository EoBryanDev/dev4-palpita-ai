import { useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { RankingList } from '@/components/ranking-list';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('RankingList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir spinner de carregamento quando isLoading for true', () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: [],
    });

    render(<RankingList />);

    expect(screen.getByText(/Carregando a classificação geral/i)).toBeDefined();
  });

  it('deve exibir mensagem de erro quando isError for true', () => {
    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Erro de conexao com a API'),
      refetch: vi.fn(),
    });

    render(<RankingList />);

    expect(screen.getByText(/Erro ao carregar ranking/i)).toBeDefined();
    expect(screen.getByText(/Erro de conexao com a API/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Tentar novamente/i }),
    ).toBeDefined();
  });

  it('deve renderizar o podio e a tabela com os usuarios carregados', () => {
    const mockUsers = [
      {
        id: '1',
        nome: 'Alice',
        email: 'alice@test.com',
        pontos: 15,
        posicao: 1,
        posicaoGrupo: 1,
        jogosPontuados: 10,
        palpitesCerteiros: 5,
      },
      {
        id: '2',
        nome: 'Bob',
        email: 'bob@test.com',
        pontos: 12,
        posicao: 2,
        posicaoGrupo: 2,
        jogosPontuados: 8,
        palpitesCerteiros: 4,
      },
      {
        id: '3',
        nome: 'Charlie',
        email: 'charlie@test.com',
        pontos: 10,
        posicao: 3,
        posicaoGrupo: 3,
        jogosPontuados: 6,
        palpitesCerteiros: 3,
      },
      {
        id: '4',
        nome: 'David',
        email: 'david@test.com',
        pontos: 8,
        posicao: 4,
        posicaoGrupo: 4,
        jogosPontuados: 4,
        palpitesCerteiros: 2,
      },
    ];

    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsers,
    });

    render(<RankingList />);

    // Verifica campeao
    expect(screen.getByText(/^Campeão$/i)).toBeDefined();
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);

    // Outros lugares
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0);
    expect(screen.getByText('David')).toBeDefined();
  });

  it('deve filtrar a lista conforme digita na caixa de busca', () => {
    const mockUsers = [
      {
        id: '1',
        nome: 'Alice',
        email: 'alice@test.com',
        pontos: 15,
        posicao: 1,
        posicaoGrupo: 1,
        jogosPontuados: 10,
        palpitesCerteiros: 5,
      },
      {
        id: '2',
        nome: 'Bob',
        email: 'bob@test.com',
        pontos: 12,
        posicao: 2,
        posicaoGrupo: 2,
        jogosPontuados: 8,
        palpitesCerteiros: 4,
      },
    ];

    (useQuery as Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsers,
    });

    render(<RankingList />);

    const searchInput = screen.getByPlaceholderText(
      /Buscar participante pelo nome/i,
    );

    // Digita "Bob"
    fireEvent.change(searchInput, { target: { value: 'Bob' } });

    expect(screen.queryByText('Alice')).toBeNull();
    expect(screen.getByText('Bob')).toBeDefined();
  });
});
