import {
  CSRF_CONFIG,
  validarCsrf,
  verificarRateLimit,
  verificarToken,
} from '@palpita/core';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function deveExigirCsrf(pathname: string, method: string): boolean {
  if (!STATE_CHANGING_METHODS.includes(method)) return false;
  if (!pathname.startsWith('/api/')) return false;
  if (pathname === '/api/csrf') return false;
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateCheck = verificarRateLimit(ip, 'API');
    if (!rateCheck.permitido) {
      return NextResponse.json(
        { erro: 'Muitas requisições. Tente novamente mais tarde.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetEmMs / 1000)),
          },
        },
      );
    }
  }

  if (deveExigirCsrf(pathname, method)) {
    const cookieToken =
      request.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value ?? undefined;
    const headerToken =
      request.headers.get(CSRF_CONFIG.HEADER_NAME) ?? undefined;

    if (!validarCsrf(cookieToken, headerToken)) {
      return NextResponse.json(
        { erro: 'CSRF token inválido ou ausente' },
        { status: 403 },
      );
    }
  }

  const isMeuEspaco = pathname.startsWith('/meu-espaco');
  const isAdmin = pathname.startsWith('/admin');

  if (!isMeuEspaco && !isAdmin) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('palpita_session')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const sessao = await verificarToken(sessionCookie);

    if (!sessao || !sessao.sub) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && sessao.cargo !== 'ADMIN') {
      const meuEspacoUrl = new URL('/meu-espaco', request.url);
      return NextResponse.redirect(meuEspacoUrl);
    }
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('palpita_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/meu-espaco/:path*', '/admin/:path*', '/api/:path*'],
};
