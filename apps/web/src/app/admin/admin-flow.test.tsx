import { obterSessao } from '@/app/actions/auth';
import { db } from '@palpita/db';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import AdminDashboardPage from './page';

vi.mock('@/app/actions/auth', () => ({
  obterSessao: vi.fn(),
}));

const mockRedirect = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  return {
    db: {
      select: mockSelect,
      query: {
        rodadas: {
          findFirst: vi.fn(),
        },
        configuracoes: {
          findFirst: vi.fn(),
        },
      },
    },
    usuarios: {
      id: 'usuarios.id',
      status: 'usuarios.status',
    },
    partidas: {
      id: 'partidas.id',
      rodadaId: 'partidas.rodadaId',
    },
    palpites: {
      id: 'palpites.id',
      partidaId: 'palpites.partidaId',
      usuarioId: 'palpites.usuarioId',
    },
    rodadas: {
      id: 'rodadas.id',
      numero: 'rodadas.numero',
      nome: 'rodadas.nome',
      ativa: 'rodadas.ativa',
    },
    configuracoes: {
      id: 'configuracoes.id',
      chave: 'configuracoes.chave',
      valor: 'configuracoes.valor',
    },
  };
});

describe('Admin Dashboard Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockClear();
  });

  it('deve redirecionar para /meu-espaco se o usuario nao for admin', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

    try {
      await AdminDashboardPage();
    } catch (_) {}

    expect(mockRedirect).toHaveBeenCalledWith('/meu-espaco');
  });

  it('deve carregar estatisticas e renderizar dashboard corretamente para o administrador', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

    // Mock usuários: 3 cadastrados, 2 LIBERADO e 1 PENDENTE
    const mockUsers = [
      { id: 'u1', status: 'LIBERADO' },
      { id: 'u2', status: 'LIBERADO' },
      { id: 'u3', status: 'PENDENTE' },
    ];

    const mockSelect = db.select as Mock;
    // Primeiro select: buscar todos os usuários
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => Promise.resolve(mockUsers)),
    }));

    // Mock da rodada ativa
    const mockRodada = {
      id: 'r1',
      numero: 1,
      nome: 'Rodada 1',
      ativa: true,
    };
    (db.query.rodadas.findFirst as Mock).mockResolvedValueOnce(mockRodada);
    (db.query.configuracoes.findFirst as Mock).mockResolvedValueOnce({
      chave: 'valor_palpite',
      valor: '50.00',
    });

    // Mock partidas da rodada: 2 partidas
    const mockPartidas = [{ id: 'p1' }, { id: 'p2' }];
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockPartidas)),
      })),
    }));

    // Mock palpites realizados pelos usuários liberados nas partidas da rodada:
    // Total esperado: 2 usuários liberados * 2 partidas = 4 palpites
    // Simular que foram feitos 3 palpites
    const mockPalpites = [{ id: 'g1' }, { id: 'g2' }, { id: 'g3' }];
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockPalpites)),
      })),
    }));

    // Renderizar o componente assíncrono (Server Component)
    const result = await AdminDashboardPage();
    render(result);

    // Assert total de usuários (3)
    expect(screen.getByText('3')).toBeDefined();

    // Assert confirmados liberados (2)
    expect(screen.getByText('2')).toBeDefined();

    // Assert pendentes (1)
    expect(screen.getByText('1')).toBeDefined();

    // Assert rodada atual (Rodada 1)
    expect(screen.getByText('Rodada 1')).toBeDefined();

    // Assert percentual palpites (3/4 = 75%)
    expect(screen.getByText('75%')).toBeDefined();
  });
});
