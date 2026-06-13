import { CSRF_CONFIG, gerarTokenCsrf } from '@palpita/core';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const token = gerarTokenCsrf();

  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_CONFIG.COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60,
  });

  return response;
}
