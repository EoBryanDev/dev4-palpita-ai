import { db } from '@palpita/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { GET } from './route';

vi.mock('@palpita/db', () => {
  const mockSelect = vi.fn();
  return {
    db: {
      select: mockSelect,
    },
    usuarios: {
      id: 'usuarios.id',
      nome: 'usuarios.nome',
      email: 'usuarios.email',
      status: 'usuarios.status',
    },
    partidas: {
      id: 'partidas.id',
      golsTimeA: 'partidas.golsTimeA',
      golsTimeB: 'partidas.golsTimeB',
      status: 'partidas.status',
    },
    palpites: {
      id: 'palpites.id',
      usuarioId: 'palpites.usuarioId',
      partidaId: 'palpites.partidaId',
    },
  };
});

describe('GET /api/ranking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular a pontuacao dos usuarios corretamente e ordernar pelo ranking', async () => {
    const mockUsers = [
      { id: 'u1', nome: 'Alice', email: 'alice@test.com' },
      { id: 'u2', nome: 'Bob', email: 'bob@test.com' },
      { id: 'u3', nome: 'Charlie', email: 'charlie@test.com' },
    ];

    const mockMatches = [
      { id: 'm1', golsTimeA: 2, golsTimeB: 1 }, // Vencedor: A
      { id: 'm2', golsTimeA: 1, golsTimeB: 1 }, // Vencedor: EMPATE
    ];

    const mockPalpites = [
      // Alice acertou o vencedor de m1 (A) e m2 (EMPATE) -> 2 pontos
      { usuarioId: 'u1', partidaId: 'm1', golsTimeA: 3, golsTimeB: 0 },
      { usuarioId: 'u1', partidaId: 'm2', golsTimeA: 0, golsTimeB: 0 },
      // Bob acertou m1 (A) mas errou m2 (B) -> 1 ponto
      { usuarioId: 'u2', partidaId: 'm1', golsTimeA: 2, golsTimeB: 1 },
      { usuarioId: 'u2', partidaId: 'm2', golsTimeA: 1, golsTimeB: 2 },
      // Charlie errou ambos (B e B) -> 0 pontos
      { usuarioId: 'u3', partidaId: 'm1', golsTimeA: 0, golsTimeB: 1 },
      { usuarioId: 'u3', partidaId: 'm2', golsTimeA: 1, golsTimeB: 3 },
    ];

    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockUsers)),
      })),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockMatches)),
      })),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => Promise.resolve(mockPalpites)),
    }));

    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveLength(3);

    // Alice deve estar em primeiro
    expect(json[0]).toEqual({
      id: 'u1',
      nome: 'Alice',
      email: 'alice@test.com',
      pontos: 2,
      posicao: 1,
    });

    // Bob em segundo
    expect(json[1]).toEqual({
      id: 'u2',
      nome: 'Bob',
      email: 'bob@test.com',
      pontos: 1,
      posicao: 2,
    });

    // Charlie em terceiro
    expect(json[2]).toEqual({
      id: 'u3',
      nome: 'Charlie',
      email: 'charlie@test.com',
      pontos: 0,
      posicao: 3,
    });
  });

  it('deve lidar com empates de pontuacao corretamente compartilhando posicoes', async () => {
    const mockUsers = [
      { id: 'u1', nome: 'Alice', email: 'alice@test.com' },
      { id: 'u2', nome: 'Bob', email: 'bob@test.com' },
      { id: 'u3', nome: 'Charlie', email: 'charlie@test.com' },
    ];

    const mockMatches = [
      { id: 'm1', golsTimeA: 2, golsTimeB: 1 }, // Vencedor: A
    ];

    const mockPalpites = [
      // Alice e Bob acertaram m1 -> 1 ponto cada
      { usuarioId: 'u1', partidaId: 'm1', golsTimeA: 2, golsTimeB: 1 },
      { usuarioId: 'u2', partidaId: 'm1', golsTimeA: 1, golsTimeB: 0 },
      // Charlie errou -> 0 pontos
      { usuarioId: 'u3', partidaId: 'm1', golsTimeA: 1, golsTimeB: 1 },
    ];

    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockUsers)),
      })),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mockMatches)),
      })),
    }));
    mockSelect.mockImplementationOnce(() => ({
      from: vi.fn(() => Promise.resolve(mockPalpites)),
    }));

    const response = await GET();
    const json = await response.json();

    // Alice e Bob empatados em 1º, Charlie em 3º
    expect(json[0].posicao).toBe(1);
    expect(json[0].nome).toBe('Alice');
    expect(json[1].posicao).toBe(1);
    expect(json[1].nome).toBe('Bob'); // ordenado alfabeticamente
    expect(json[2].posicao).toBe(3);
  });

  it('deve retornar status 500 se ocorrer um erro no banco', async () => {
    const mockSelect = db.select as Mock;
    mockSelect.mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const response = await GET();
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toBe('Erro interno ao calcular ranking.');
  });
});
