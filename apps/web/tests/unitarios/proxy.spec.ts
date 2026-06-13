import { proxy } from '@/proxy';
import type { Sessao } from '@palpita/core';
import { type NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/server', () => {
  const nextResponseInstance = {
    cookies: {
      delete: vi.fn(),
    },
  };
  return {
    NextResponse: {
      next: vi.fn(() => ({ ...nextResponseInstance, type: 'next' })),
      redirect: vi.fn((url) => ({
        ...nextResponseInstance,
        type: 'redirect',
        url: url.toString(),
      })),
    },
  };
});

vi.mock('@palpita/core', () => ({
  verificarToken: vi.fn(),
  verificarRateLimit: vi.fn(() => ({ permitido: true, resetEmMs: 0 })),
  validarCsrf: vi.fn(() => true),
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (pathname: string, sessionCookieValue?: string) => {
    const cookiesGetMock = vi
      .fn()
      .mockReturnValue(
        sessionCookieValue ? { value: sessionCookieValue } : undefined,
      );

    return {
      nextUrl: {
        pathname,
      },
      url: `http://localhost:3000${pathname}`,
      cookies: {
        get: cookiesGetMock,
      },
    } as unknown as NextRequest;
  };

  it('deve permitir requisições para rotas públicas sem verificação de sessão', async () => {
    const req = createMockRequest('/home');
    const res = await proxy(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve redirecionar para /login ao tentar acessar /meu-espaco sem sessão ativa', async () => {
    const req = createMockRequest('/meu-espaco/palpites');
    const res = await proxy(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('deve redirecionar para /login se a sessão contiver dados inválidos', async () => {
    const req = createMockRequest('/meu-espaco', btoa('invalido'));
    const { verificarToken } = await import('@palpita/core');
    vi.mocked(verificarToken).mockResolvedValueOnce(null);
    const res = await proxy(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
  });

  it('deve permitir o acesso a /meu-espaco se o usuário estiver autenticado', async () => {
    const sessionData = {
      sub: 'user-123',
      nome: 'Fulano',
      email: 'user@test.com',
      cargo: 'COLABORADOR',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const { verificarToken } = await import('@palpita/core');
    vi.mocked(verificarToken).mockResolvedValueOnce(
      sessionData as unknown as Sessao,
    );
    const req = createMockRequest('/meu-espaco/perfil', sessionCookie);
    const res = await proxy(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve redirecionar para /meu-espaco se um usuário com cargo COLABORADOR tentar acessar /admin', async () => {
    const sessionData = {
      sub: 'user-123',
      nome: 'Fulano',
      email: 'user@test.com',
      cargo: 'COLABORADOR',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const { verificarToken } = await import('@palpita/core');
    vi.mocked(verificarToken).mockResolvedValueOnce(
      sessionData as unknown as Sessao,
    );
    const req = createMockRequest('/admin/usuarios', sessionCookie);
    const res = await proxy(req);

    expect(res?.type).toBe('redirect');
    expect(decodeURIComponent(res?.url)).toContain('/meu-espaco');
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('deve permitir acesso a /admin se o usuário tiver o cargo ADMIN', async () => {
    const sessionData = {
      sub: 'admin-123',
      nome: 'Admin',
      email: 'admin@test.com',
      cargo: 'ADMIN',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const { verificarToken } = await import('@palpita/core');
    vi.mocked(verificarToken).mockResolvedValueOnce(
      sessionData as unknown as Sessao,
    );
    const req = createMockRequest('/admin/usuarios', sessionCookie);
    const res = await proxy(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve apagar o cookie de sessão e redirecionar para /login se o cookie estiver corrompido', async () => {
    const req = createMockRequest('/meu-espaco', '!!!invalid-base64!!!');
    const { verificarToken } = await import('@palpita/core');
    vi.mocked(verificarToken).mockRejectedValueOnce(
      new Error('Token inválido'),
    );
    const res = await proxy(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
    expect(res?.cookies.delete).toHaveBeenCalledWith('palpita_session');
  });
});
