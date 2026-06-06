import { cadastrarSenha, solicitarConvite } from '@/app/actions/convites';
import { TokenConvite } from '@palpita/core';
import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@palpita/db', () => {
  const mockSelectResult: unknown[] = [];
  const mockSelect = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve(mockSelectResult)),
      })),
    })),
  }));

  const mockInsert = vi.fn(() => ({
    values: vi.fn(() => Promise.resolve()),
  }));

  const mockTransaction = vi.fn((cb) => cb({}));

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      transaction: mockTransaction,
    },
    usuarios: {
      id: 'id-col',
      email: 'email-col',
      status: 'status-col',
      senha: 'senha-col',
    },
    tokensConvite: {
      id: 'id-col',
      usuarioId: 'usuarioId-col',
      usado: 'usado-col',
    },
  };
});

describe('solicitarConvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar erro se o nome estiver vazio', async () => {
    const result = await solicitarConvite('', 'teste@empresa.com');
    expect(result.success).toBe(false);
    expect(result.message).toBe('O nome é obrigatório.');
  });

  it('deve retornar erro se o e-mail estiver vazio', async () => {
    const result = await solicitarConvite('Gabriel', '');
    expect(result.success).toBe(false);
    expect(result.message).toBe('O e-mail é obrigatório.');
  });

  it('deve retornar erro se o e-mail for inválido', async () => {
    const result = await solicitarConvite('Gabriel', 'emailinvalido');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Formato de e-mail inválido.');
  });

  it('deve retornar erro se o e-mail já estiver cadastrado', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([{ id: '1', email: 'teste@empresa.com' }]),
          ),
        })),
      })),
    }));

    const result = await solicitarConvite('Gabriel', 'teste@empresa.com');
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Este e-mail já possui cadastro ou solicitação pendente.',
    );
  });

  it('deve cadastrar com sucesso se os dados forem válidos e o e-mail não existir', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    }));

    const result = await solicitarConvite('Gabriel', 'teste@empresa.com');
    expect(result.success).toBe(true);
    expect(result.message).toContain('Solicitação enviada com sucesso');
    expect(db.insert).toHaveBeenCalled();
  });
});

describe('cadastrarSenha', () => {
  // biome-ignore lint/suspicious/noExplicitAny: mock transaction object
  let txMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    txMock = {
      query: {
        tokensConvite: {
          findFirst: vi.fn(),
        },
        usuarios: {
          findFirst: vi.fn(),
        },
      },
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      })),
    };

    (db.transaction as Mock).mockImplementation((cb) => cb(txMock));
  });

  it('deve retornar erro se o tokenId estiver vazio', async () => {
    const result = await cadastrarSenha('', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Token inválido.');
  });

  it('deve retornar erro se a senha tiver menos de 6 caracteres', async () => {
    const result = await cadastrarSenha('token-123', '123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('A senha deve conter no mínimo 6 caracteres.');
  });

  it('deve retornar erro se o token não for encontrado no banco', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce(null);

    const result = await cadastrarSenha('token-inexistente', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Token de convite não encontrado.');
  });

  it('deve retornar erro se o token já foi utilizado', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce({
      id: 'token-usado',
      usuarioId: 'user-123',
      dataCriacao: new Date(),
      usado: true,
    });

    const result = await cadastrarSenha('token-usado', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Este token já foi utilizado.');
  });

  it('deve retornar erro se o token estiver expirado', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce({
      id: 'token-expirado',
      usuarioId: 'user-123',
      dataCriacao: new Date(Date.now() - 10 * 60 * 1000),
      usado: false,
    });

    vi.spyOn(TokenConvite.prototype, 'estaExpirado').mockReturnValueOnce(true);

    const result = await cadastrarSenha('token-expirado', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toContain('expirou');
  });

  it('deve retornar erro se o usuário não for encontrado', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce({
      id: 'token-ok',
      usuarioId: 'user-inexistente',
      dataCriacao: new Date(),
      usado: false,
    });
    txMock.query.usuarios.findFirst.mockResolvedValueOnce(null);

    const result = await cadastrarSenha('token-ok', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuário não encontrado.');
  });

  it('deve retornar erro se o usuário já estiver ativo', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce({
      id: 'token-ok',
      usuarioId: 'user-ativo',
      dataCriacao: new Date(),
      usado: false,
    });
    txMock.query.usuarios.findFirst.mockResolvedValueOnce({
      id: 'user-ativo',
      nome: 'Fulano',
      status: 'ATIVO',
    });

    const result = await cadastrarSenha('token-ok', 'senha123');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Este usuário já está ativo.');
  });

  it('deve cadastrar a senha com sucesso, atualizando o usuário e o token', async () => {
    txMock.query.tokensConvite.findFirst.mockResolvedValueOnce({
      id: 'token-ok',
      usuarioId: 'user-pendente',
      dataCriacao: new Date(),
      usado: false,
    });
    txMock.query.usuarios.findFirst.mockResolvedValueOnce({
      id: 'user-pendente',
      nome: 'Fulano',
      status: 'PENDENTE',
    });

    const result = await cadastrarSenha('token-ok', 'novasenha123');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Cadastro concluído com sucesso!');
    expect(txMock.update).toHaveBeenCalledTimes(2);
  });
});
