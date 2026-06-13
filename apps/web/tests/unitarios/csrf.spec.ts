import { fetchCsrfToken, getCsrfCookie } from '@/lib/csrf';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('csrf frontend helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof document !== 'undefined') {
      // Limpa cookies
      for (const c of document.cookie.split(';')) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      }
    }
  });

  describe('getCsrfCookie', () => {
    it('deve retornar null se o cookie csrf-token não existir', () => {
      expect(getCsrfCookie()).toBeNull();
    });

    it('deve retornar o token quando o cookie csrf-token estiver presente', () => {
      document.cookie = 'csrf-token=abc123token; path=/';
      expect(getCsrfCookie()).toBe('abc123token');
    });

    it('deve decodificar o valor do cookie', () => {
      document.cookie = `csrf-token=${encodeURIComponent('token com espaços')}; path=/`;
      expect(getCsrfCookie()).toBe('token com espaços');
    });
  });

  describe('fetchCsrfToken', () => {
    it('deve retornar o token quando a chamada de API for bem sucedida', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ csrfToken: 'fake-token-csrf' }),
      });
      global.fetch = mockFetch;

      const token = await fetchCsrfToken();
      expect(token).toBe('fake-token-csrf');
      expect(mockFetch).toHaveBeenCalledWith('/api/csrf');
    });

    it('deve retornar null quando a chamada de API falhar', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
      });
      global.fetch = mockFetch;

      const token = await fetchCsrfToken();
      expect(token).toBeNull();
    });

    it('deve retornar null se houver uma exceção na chamada de API', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      const token = await fetchCsrfToken();
      expect(token).toBeNull();
    });
  });
});
