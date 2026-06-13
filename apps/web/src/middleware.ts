import { verificarToken } from '@palpita/core';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ['/meu-espaco/:path*', '/admin/:path*'],
};
