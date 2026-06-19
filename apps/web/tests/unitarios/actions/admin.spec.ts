import {
  alterarStatusUsuario,
  aprovarSolicitacao,
  criarPartida,
  criarRodada,
  lancarResultadoOficial,
  rejeitarSolicitacao,
} from '@/app/actions/admin';
import { obterSessao } from '@/app/actions/auth';
import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/app/actions/auth', () => ({
  obterSessao: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
    }),
  ),
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }),
  ),
}));

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockTransaction = vi.fn((cb) => cb({}));

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      transaction: mockTransaction,
      query: {
        usuarios: {
          findFirst: vi.fn(),
        },
        tokensConvite: {
          findFirst: vi.fn(),
        },
        rodadas: {
          findFirst: vi.fn(),
        },
        partidas: {
          findFirst: vi.fn(),
        },
        times: {
          findFirst: vi.fn(),
        },
      },
    },
    usuarios: {
      id: 'usuarios.id',
      status: 'usuarios.status',
    },
    tokensConvite: {
      id: 'tokensConvite.id',
      usuarioId: 'tokensConvite.usuarioId',
    },
    rodadas: {
      id: 'rodadas.id',
      numero: 'rodadas.numero',
      nome: 'rodadas.nome',
    },
    partidas: {
      id: 'partidas.id',
      rodadaId: 'partidas.rodadaId',
      status: 'partidas.status',
    },
    times: {
      id: 'times.id',
      nome: 'times.nome',
    },
  };
});

describe('Ações Administrativas (admin.ts)', () => {
  // biome-ignore lint/suspicious/noExplicitAny: mock transaction object
  let txMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    txMock = {
      query: {
        usuarios: {
          findFirst: vi.fn(),
        },
        tokensConvite: {
          findFirst: vi.fn(),
        },
        rodadas: {
          findFirst: vi.fn(),
        },
        partidas: {
          findFirst: vi.fn(),
        },
        times: {
          findFirst: vi.fn(),
        },
      },
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'new-token-uuid' }])),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      })),
    };

    (db.transaction as Mock).mockImplementation((cb) => cb(txMock));
  });

  describe('aprovarSolicitacao', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await aprovarSolicitacao('user-id');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se o id do usuário não for fornecido', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

      const res = await aprovarSolicitacao('');
      expect(res.success).toBe(false);
      expect(res.message).toContain('ID do usuário inválido');
    });

    it('deve retornar erro se o usuário não for encontrado', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      txMock.query.usuarios.findFirst.mockResolvedValueOnce(null);

      const res = await aprovarSolicitacao('non-existent-user');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Usuário não encontrado');
    });

    it('deve retornar erro se o usuário já estiver com outro status', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      txMock.query.usuarios.findFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'ATIVO',
      });

      const res = await aprovarSolicitacao('user-id');
      expect(res.success).toBe(false);
      expect(res.message).toContain('já possui status: ATIVO');
    });

    it('deve gerar token e link de ativação com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      txMock.query.usuarios.findFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'PENDENTE',
      });

      const res = await aprovarSolicitacao('user-id');
      expect(res.success).toBe(true);
      expect(res.link).toBe('/validation-user/new-token-uuid');
      expect(txMock.delete).toHaveBeenCalled();
      expect(txMock.insert).toHaveBeenCalled();
    });
  });

  describe('rejeitarSolicitacao', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await rejeitarSolicitacao('user-id');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se o usuário não for encontrado', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      // Para busca fora de transação do query.usuarios
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce(null);

      const res = await rejeitarSolicitacao('non-existent-user');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Usuário não encontrado');
    });

    it('deve retornar erro se o usuário não estiver com status PENDENTE', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'ATIVO',
      });

      const res = await rejeitarSolicitacao('user-id');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Somente usuários com status PENDENTE');
    });

    it('deve desativar a solicitação com sucesso se estiver PENDENTE', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'PENDENTE',
      });

      const mockUpdate = db.update as Mock;
      mockUpdate.mockImplementationOnce(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const res = await rejeitarSolicitacao('user-id');
      expect(res.success).toBe(true);
      expect(res.message).toContain('rejeitada com sucesso');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('alterarStatusUsuario', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await alterarStatusUsuario('user-id', 'LIBERADO');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se o usuário estiver PENDENTE', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'PENDENTE',
      });

      const res = await alterarStatusUsuario('user-id', 'LIBERADO');
      expect(res.success).toBe(false);
      expect(res.message).toContain('devem primeiro ativar sua conta');
    });

    it('deve alterar status para LIBERADO com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'ATIVO',
      });

      const mockUpdate = db.update as Mock;
      mockUpdate.mockImplementationOnce(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const res = await alterarStatusUsuario('user-id', 'LIBERADO');
      expect(res.success).toBe(true);
      expect(res.message).toContain('liberado para palpitar');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('deve alterar status para ATIVO com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirst = db.query.usuarios.findFirst as Mock;
      mockFindFirst.mockResolvedValueOnce({
        id: 'user-id',
        status: 'LIBERADO',
      });

      const mockUpdate = db.update as Mock;
      mockUpdate.mockImplementationOnce(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      }));

      const res = await alterarStatusUsuario('user-id', 'ATIVO');
      expect(res.success).toBe(true);
      expect(res.message).toContain('Usuário ativado');
    });
  });

  describe('criarRodada', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await criarRodada(1, 'Rodada 1');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se o numero for invalido', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

      const res = await criarRodada(0, 'Rodada 1');
      expect(res.success).toBe(false);
      expect(res.message).toContain('maior que zero');
    });

    it('deve retornar erro se o nome estiver vazio', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

      const res = await criarRodada(1, '');
      expect(res.success).toBe(false);
      expect(res.message).toContain('obrigatório');
    });

    it('deve cadastrar a rodada com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockInsert = db.insert as Mock;
      mockInsert.mockImplementationOnce(() => ({
        values: vi.fn(() => Promise.resolve()),
      }));

      const res = await criarRodada(1, 'Rodada 1');
      expect(res.success).toBe(true);
      expect(res.message).toContain('criada com sucesso');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('criarPartida', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await criarPartida(
        'rodada-id',
        'time-a-id',
        'time-b-id',
        '2026-06-15T15:00:00Z',
      );
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se os times forem iguais', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

      const res = await criarPartida(
        'rodada-id',
        'time-a-id',
        'time-a-id',
        '2026-06-15T15:00:00Z',
      );
      expect(res.success).toBe(false);
      expect(res.message).toContain('devem ser diferentes');
    });

    it('deve retornar erro se a rodada não for encontrada', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirstRodada = db.query.rodadas.findFirst as Mock;
      mockFindFirstRodada.mockResolvedValueOnce(null);

      const res = await criarPartida(
        'rodada-id',
        'time-a-id',
        'time-b-id',
        '2026-06-15T15:00:00Z',
      );
      expect(res.success).toBe(false);
      expect(res.message).toContain('Rodada não encontrada');
    });

    it('deve retornar erro se um ou ambos os times nao forem encontrados', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirstRodada = db.query.rodadas.findFirst as Mock;
      mockFindFirstRodada.mockResolvedValueOnce({ id: 'rodada-id' });

      const mockFindFirstTimes = db.query.times.findFirst as Mock;
      mockFindFirstTimes.mockResolvedValueOnce(null); // Time A não encontrado

      const res = await criarPartida(
        'rodada-id',
        'time-a-id',
        'time-b-id',
        '2026-06-15T15:00:00Z',
      );
      expect(res.success).toBe(false);
      expect(res.message).toContain(
        'Um ou ambos os times não foram encontrados',
      );
    });

    it('deve cadastrar a partida com sucesso se a rodada e os times existirem', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const mockFindFirstRodada = db.query.rodadas.findFirst as Mock;
      mockFindFirstRodada.mockResolvedValueOnce({ id: 'rodada-id' });

      const mockFindFirstTimes = db.query.times.findFirst as Mock;
      mockFindFirstTimes
        .mockResolvedValueOnce({ id: 'time-a-id' }) // Primeira chamada (Time A)
        .mockResolvedValueOnce({ id: 'time-b-id' }); // Segunda chamada (Time B)

      const mockInsert = db.insert as Mock;
      mockInsert.mockImplementationOnce(() => ({
        values: vi.fn(() => Promise.resolve()),
      }));

      const res = await criarPartida(
        'rodada-id',
        'time-a-id',
        'time-b-id',
        '2026-06-15T15:00:00Z',
      );
      expect(res.success).toBe(true);
      expect(res.message).toContain('criada com sucesso');
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('lancarResultadoOficial', () => {
    it('deve retornar erro se o usuário não for administrador', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'COLABORADOR' });

      const res = await lancarResultadoOficial('partida-id', 2, 1);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Acesso negado');
    });

    it('deve retornar erro se os gols forem negativos', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });

      const res = await lancarResultadoOficial('partida-id', -1, 1);
      expect(res.success).toBe(false);
      expect(res.message).toContain('não podem ser valores negativos');
    });

    it('deve retornar erro se a partida não for encontrada', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      txMock.query.partidas.findFirst.mockResolvedValueOnce(null);

      const res = await lancarResultadoOficial('partida-id', 2, 1);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Partida não encontrada');
    });

    it('deve permitir atualizar partida mesmo se já estiver finalizada (revisão de placar)', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const umaHoraNoPassado = new Date(Date.now() - 60 * 60 * 1000);
      txMock.query.partidas.findFirst.mockResolvedValueOnce({
        id: 'partida-id',
        status: 'FINALIZADO',
        dataInicio: umaHoraNoPassado,
      });

      const res = await lancarResultadoOficial('partida-id', 2, 1);
      expect(res.success).toBe(true);
      expect(res.message).toContain('lançado e partida finalizada');
      expect(txMock.update).toHaveBeenCalled();
    });

    it('deve retornar erro se a partida ainda não começou (data de início no futuro)', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const umaHoraNoFuturo = new Date(Date.now() + 60 * 60 * 1000);
      txMock.query.partidas.findFirst.mockResolvedValueOnce({
        id: 'partida-id',
        status: 'AGENDADO',
        dataInicio: umaHoraNoFuturo,
      });

      const res = await lancarResultadoOficial('partida-id', 2, 1);
      expect(res.success).toBe(false);
      expect(res.message).toContain('antes do seu inicio');
      expect(txMock.update).not.toHaveBeenCalled();
    });

    it('deve lançar resultado e finalizar partida com sucesso', async () => {
      (obterSessao as Mock).mockResolvedValueOnce({ cargo: 'ADMIN' });
      const umaHoraNoPassado = new Date(Date.now() - 60 * 60 * 1000);
      txMock.query.partidas.findFirst.mockResolvedValueOnce({
        id: 'partida-id',
        status: 'AGENDADO',
        dataInicio: umaHoraNoPassado,
      });

      const res = await lancarResultadoOficial('partida-id', 2, 1);
      expect(res.success).toBe(true);
      expect(res.message).toContain('lançado e partida finalizada');
      expect(txMock.update).toHaveBeenCalled();
    });
  });
});
