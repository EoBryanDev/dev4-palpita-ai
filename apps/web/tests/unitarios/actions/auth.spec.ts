import { loginUsuario, logoutUsuario, obterSessao } from '@/app/actions/auth';
import { db } from '@palpita/db';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

const mockCookiesStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookiesStore)),
  headers: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock('@palpita/core', () => ({
  Usuario: vi.fn(),
  criarToken: vi.fn(() => Promise.resolve('mock-jwt-token')),
  logAuditoria: vi.fn(),
  verificarRateLimit: vi.fn(() => ({ permitido: true, resetEmMs: 0 })),
  verificarToken: vi.fn(),
}));

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  const mockExecute = vi.fn().mockResolvedValue(undefined);
  const mockWhere = vi.fn(() => ({ execute: mockExecute }));
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));
  return {
    db: {
      select: mockSelect,
      update: mockUpdate,
    },
    usuarios: {
      email: 'email-col',
    },
  };
});

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('loginUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesStore.set.mockClear();
    mockCookiesStore.get.mockClear();
    mockCookiesStore.delete.mockClear();
  });

  it('deve retornar erro se o e-mail estiver vazio', async () => {
    const result = await loginUsuario('', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('O e-mail é obrigatório.');
  });

  it('deve retornar erro se a senha estiver vazia', async () => {
    const result = await loginUsuario('teste@empresa.com', '');
    expect(result.success).toBe(false);
    expect(result.message).toBe('A senha é obrigatória.');
  });

  it('deve retornar erro se o usuário não for encontrado', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    }));

    const result = await loginUsuario('inexistente@empresa.com', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Credenciais inválidas.');
  });

  it('deve retornar erro se o usuário não tiver senha definida (conta pendente)', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([
              {
                id: 'user-123',
                nome: 'Fulano',
                email: 'sem-senha@empresa.com',
                status: 'PENDENTE',
                cargo: 'COLABORADOR',
                senha: null,
              },
            ]),
          ),
        })),
      })),
    }));

    const result = await loginUsuario('sem-senha@empresa.com', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Sua conta ainda não foi ativada');
  });

  it('deve retornar erro se o usuário não estiver ativo', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([
              {
                id: 'user-123',
                nome: 'Fulano',
                email: 'inativo@empresa.com',
                status: 'PENDENTE',
                cargo: 'COLABORADOR',
                senha: 'hashed_password',
              },
            ]),
          ),
        })),
      })),
    }));

    const result = await loginUsuario('inativo@empresa.com', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Sua conta está pendente de liberação ou inativa',
    );
  });

  it('deve retornar erro se a senha for incorreta', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([
              {
                id: 'user-123',
                nome: 'Fulano',
                email: 'teste@empresa.com',
                status: 'ATIVO',
                cargo: 'COLABORADOR',
                senha: 'hashed_password',
              },
            ]),
          ),
        })),
      })),
    }));

    (bcrypt.compare as Mock).mockResolvedValueOnce(false);

    const result = await loginUsuario('teste@empresa.com', 'senha-errada');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Credenciais inválidas.');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'senha-errada',
      'hashed_password',
    );
  });

  it('deve retornar sucesso com dados do usuário se as credenciais forem válidas', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([
              {
                id: 'user-123',
                nome: 'Fulano',
                email: 'teste@empresa.com',
                status: 'ATIVO',
                cargo: 'COLABORADOR',
                senha: 'hashed_password',
              },
            ]),
          ),
        })),
      })),
    }));

    (bcrypt.compare as Mock).mockResolvedValueOnce(true);

    const result = await loginUsuario('teste@empresa.com', 'senha-correta');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Autenticação realizada com sucesso!');
    expect(result.user).toEqual({
      id: 'user-123',
      nome: 'Fulano',
      email: 'teste@empresa.com',
      cargo: 'COLABORADOR',
    });
  });
});

describe('logoutUsuario', () => {
  it('deve remover o cookie palpita_session e retornar sucesso', async () => {
    const result = await logoutUsuario();
    expect(result.success).toBe(true);
    expect(result.message).toBe('Logout realizado com sucesso!');
    expect(mockCookiesStore.delete).toHaveBeenCalledWith('palpita_session');
  });
});

describe('obterSessao', () => {
  it('deve retornar null se o cookie palpita_session não estiver presente', async () => {
    mockCookiesStore.get.mockReturnValueOnce(undefined);
    const session = await obterSessao();
    expect(session).toBeNull();
  });

  it('deve decodificar o cookie e retornar os dados do usuário se estiver presente', async () => {
    const { verificarToken } = await import('@palpita/core');
    const sessionData = {
      id: 'user-123',
      nome: 'Fulano',
      email: 'teste@empresa.com',
      cargo: 'COLABORADOR',
    };
    const encodedCookie = 'mock-jwt-token-colaborador';
    mockCookiesStore.get.mockReturnValueOnce({ value: encodedCookie });
    (verificarToken as Mock).mockResolvedValueOnce({
      sub: 'user-123',
      nome: 'Fulano',
      email: 'teste@empresa.com',
      cargo: 'COLABORADOR',
    });

    const session = await obterSessao();
    expect(session).toEqual({
      id: 'user-123',
      nome: 'Fulano',
      email: 'teste@empresa.com',
      cargo: 'COLABORADOR',
    });
  });

  it('deve retornar null se o cookie estiver corrompido ou inválido', async () => {
    const { verificarToken } = await import('@palpita/core');
    mockCookiesStore.get.mockReturnValueOnce({
      value: 'corrupted-jwt-token',
    });
    (verificarToken as Mock).mockRejectedValueOnce(new Error('Invalid token'));
    const session = await obterSessao();
    expect(session).toBeNull();
  });
});
