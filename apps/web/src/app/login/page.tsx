import type { Metadata } from 'next';
import type React from 'react';

import { obterSessao } from '@/app/actions/auth';
import { LoginForm } from '@/components/form/login-form';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Entrar - Palpita AI',
  description: 'Acesse a área de palpites da Copa do Mundo 2026.',
};

export default async function LoginPage() {
  const sessao = await obterSessao();
  if (sessao) {
    if (sessao.cargo === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/meu-espaco');
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Decorative premium background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none dark:bg-emerald-500/5 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none dark:bg-teal-500/5 animate-pulse" />

      <LoginForm />
    </div>
  );
}
