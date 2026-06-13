import { NextResponse } from 'next/server';
import { gerarTokenCsrf, CSRF_CONFIG } from '@palpita/core';

export async function GET(): Promise<NextResponse> {
  const token = gerarTokenCsrf();

  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_CONFIG.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60,
  });

  return response;
}
