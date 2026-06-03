import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { solicitarConvite } from './convites';

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

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
    usuarios: {
      email: 'email-column-mock',
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
