import { validarOrigem } from '@/lib/csrf-server';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockHeadersGet = vi.fn();

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: mockHeadersGet,
    }),
  ),
}));

describe('validarOrigem', () => {
  const originalAppUrl = process.env.APP_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    // biome-ignore lint/performance/noDelete: delete is required to clean process.env
    delete process.env.APP_URL;
  });

  afterAll(() => {
    process.env.APP_URL = originalAppUrl;
  });

  it('deve passar quando os cabeçalhos de origem e referer estão ausentes', async () => {
    mockHeadersGet.mockReturnValue(null);

    await expect(validarOrigem()).resolves.toBeUndefined();
  });

  it('deve passar quando origin e referer começam com o valor de APP_URL', async () => {
    process.env.APP_URL = 'http://localhost:3000';
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'http://localhost:3000';
      if (name === 'referer') return 'http://localhost:3000/dashboard';
      return null;
    });

    await expect(validarOrigem()).resolves.toBeUndefined();
  });

  it('deve falhar quando origin não coincide com APP_URL', async () => {
    process.env.APP_URL = 'http://localhost:3000';
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'http://evil.com';
      if (name === 'referer') return 'http://localhost:3000/';
      return null;
    });

    await expect(validarOrigem()).rejects.toThrow('Origem inválida.');
  });

  it('deve falhar quando referer não coincide com APP_URL', async () => {
    process.env.APP_URL = 'http://localhost:3000';
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'http://localhost:3000';
      if (name === 'referer') return 'http://evil.com/fake-referer';
      return null;
    });

    await expect(validarOrigem()).rejects.toThrow('Referer inválido.');
  });

  it('deve usar o fallback padrão http://localhost:3000 se APP_URL não estiver configurada', async () => {
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'origin') return 'http://localhost:3000';
      if (name === 'referer') return 'http://localhost:3000/';
      return null;
    });

    await expect(validarOrigem()).resolves.toBeUndefined();
  });
});
