import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface ISessionUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verificar se a rota precisa de proteção
  const isMeuEspaco = pathname.startsWith('/meu-espaco');
  const isAdmin = pathname.startsWith('/admin');

  if (!isMeuEspaco && !isAdmin) {
    return NextResponse.next();
  }

  // 2. Tentar obter o cookie da sessão
  const sessionCookie = request.cookies.get('palpita_session')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Decodificar a sessão a partir do cookie base64
    const sessionStr = decodeURIComponent(atob(sessionCookie));
    const session: ISessionUser = JSON.parse(sessionStr);

    if (!session || !session.id) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Se for rota administrativa, verificar se o cargo é ADMIN
    if (isAdmin && session.cargo !== 'ADMIN') {
      const meuEspacoUrl = new URL('/meu-espaco', request.url);
      return NextResponse.redirect(meuEspacoUrl);
    }
  } catch (error) {
    // Em caso de cookie corrompido, limpa o cookie e redireciona
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('palpita_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/meu-espaco/:path*', '/admin/:path*'],
};
