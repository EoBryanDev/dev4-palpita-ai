import { middleware } from '@/middleware';
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

  it('deve permitir requisições para rotas públicas sem verificação de sessão', () => {
    const req = createMockRequest('/home');
    const res = middleware(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve redirecionar para /login ao tentar acessar /meu-espaco sem sessão ativa', () => {
    const req = createMockRequest('/meu-espaco/palpites');
    const res = middleware(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('deve redirecionar para /login se a sessão contiver dados inválidos', () => {
    const req = createMockRequest('/meu-espaco', btoa('invalido'));
    const res = middleware(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
  });

  it('deve permitir o acesso a /meu-espaco se o usuário estiver autenticado', () => {
    const sessionData = {
      id: 'user-123',
      nome: 'Fulano',
      email: 'user@test.com',
      cargo: 'COLABORADOR',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const req = createMockRequest('/meu-espaco/perfil', sessionCookie);
    const res = middleware(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve redirecionar para /meu-espaco se um usuário com cargo COLABORADOR tentar acessar /admin', () => {
    const sessionData = {
      id: 'user-123',
      nome: 'Fulano',
      email: 'user@test.com',
      cargo: 'COLABORADOR',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const req = createMockRequest('/admin/usuarios', sessionCookie);
    const res = middleware(req);

    expect(res?.type).toBe('redirect');
    expect(decodeURIComponent(res?.url)).toContain('/meu-espaco');
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('deve permitir acesso a /admin se o usuário tiver o cargo ADMIN', () => {
    const sessionData = {
      id: 'admin-123',
      nome: 'Admin',
      email: 'admin@test.com',
      cargo: 'ADMIN',
    };
    const sessionCookie = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const req = createMockRequest('/admin/usuarios', sessionCookie);
    const res = middleware(req);

    expect(res?.type).toBe('next');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('deve apagar o cookie de sessão e redirecionar para /login se o cookie estiver corrompido', () => {
    const req = createMockRequest('/meu-espaco', '!!!invalid-base64!!!');
    const res = middleware(req);

    expect(res?.type).toBe('redirect');
    expect(res?.url).toContain('/login');
    expect(res?.cookies.delete).toHaveBeenCalledWith('palpita_session');
  });
});
