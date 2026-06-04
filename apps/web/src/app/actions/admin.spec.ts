import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import {
  alterarStatusUsuario,
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from './admin';
import { obterSessao } from './auth';

vi.mock('./auth', () => ({
  obterSessao: vi.fn(),
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
      },
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
});
