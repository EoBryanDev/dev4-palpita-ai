import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { obterSessao } from './auth';
import { salvarPalpite } from './palpites';

vi.mock('./auth', () => ({
  obterSessao: vi.fn(),
}));

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    },
    usuarios: {
      id: 'usuarios.id',
      status: 'usuarios.status',
    },
    partidas: {
      id: 'partidas.id',
      dataInicio: 'partidas.dataInicio',
      status: 'partidas.status',
    },
    palpites: {
      id: 'palpites.id',
      usuarioId: 'palpites.usuarioId',
      partidaId: 'palpites.partidaId',
    },
  };
});

describe('salvarPalpite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar erro se o usuário não estiver autenticado', async () => {
    (obterSessao as Mock).mockResolvedValueOnce(null);

    const result = await salvarPalpite('partida-123', 2, 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuário não autenticado.');
  });

  it('deve retornar erro se os placares forem negativos', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });

    const result = await salvarPalpite('partida-123', -1, 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Os placares não podem ser negativos.');
  });

  it('deve retornar erro se o usuário não for encontrado no banco de dados', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;

    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    }));

    const result = await salvarPalpite('partida-123', 2, 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuário não encontrado.');
  });

  it('deve retornar erro se o usuário não estiver com status LIBERADO', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;

    // mock da busca do usuario (status ATIVO mas nao LIBERADO)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ status: 'ATIVO' }])),
        })),
      })),
    }));

    const result = await salvarPalpite('partida-123', 2, 1);
    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'Apostas bloqueadas. Sua conta está pendente de liberação',
    );
  });

  it('deve retornar erro se a partida não for encontrada', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;

    // mock do usuario (LIBERADO)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ status: 'LIBERADO' }])),
        })),
      })),
    }));

    // mock da busca da partida (vazio)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    }));

    const result = await salvarPalpite('partida-123', 2, 1);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Partida não encontrada.');
  });

  it('deve retornar erro se a partida já tiver começado', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;

    // mock do usuario (LIBERADO)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ status: 'LIBERADO' }])),
        })),
      })),
    }));

    // mock da busca da partida (iniciada no passado)
    const dataPassado = new Date();
    dataPassado.setMinutes(dataPassado.getMinutes() - 10); // 10 minutos atrás

    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([{ dataInicio: dataPassado, status: 'AGENDADO' }]),
          ),
        })),
      })),
    }));

    const result = await salvarPalpite('partida-123', 2, 1);
    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'O prazo para palpitar nesta partida já expirou',
    );
  });

  it('deve atualizar o palpite com sucesso se já existir um palpite anterior', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;
    const mockUpdate = db.update as Mock;

    // mock do usuario (LIBERADO)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ status: 'LIBERADO' }])),
        })),
      })),
    }));

    // mock da partida (futura)
    const dataFuturo = new Date();
    dataFuturo.setDate(dataFuturo.getDate() + 2); // daqui a 2 dias

    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([{ dataInicio: dataFuturo, status: 'AGENDADO' }]),
          ),
        })),
      })),
    }));

    // mock da busca do palpite existente (encontra um palpite com id 'palpite-777')
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: 'palpite-777' }])),
        })),
      })),
    }));

    // mock do update
    mockUpdate.mockImplementationOnce(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    }));

    const result = await salvarPalpite('partida-123', 3, 2);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Palpite atualizado com sucesso!');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('deve criar um novo palpite se for a primeira aposta na partida', async () => {
    (obterSessao as Mock).mockResolvedValueOnce({ id: 'user-123' });
    const mockSelect = db.select as Mock;
    const mockInsert = db.insert as Mock;

    // mock do usuario (LIBERADO)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ status: 'LIBERADO' }])),
        })),
      })),
    }));

    // mock da partida (futura)
    const dataFuturo = new Date();
    dataFuturo.setDate(dataFuturo.getDate() + 2);

    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve([{ dataInicio: dataFuturo, status: 'AGENDADO' }]),
          ),
        })),
      })),
    }));

    // mock da busca do palpite existente (retorna vazio -> não tem palpite ainda)
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    }));

    // mock do insert
    mockInsert.mockImplementationOnce(() => ({
      values: vi.fn(() => Promise.resolve()),
    }));

    const result = await salvarPalpite('partida-123', 2, 0);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Palpite registrado com sucesso!');
    expect(mockInsert).toHaveBeenCalled();
  });
});
