'use client';

import type React from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginForm } from '@/hooks/use-login-form';

export function LoginForm() {
  const {
    email,
    setEmail,
    senha,
    setSenha,
    lembrarMe,
    setLembrarMe,
    loading,
    errorMsg,
    success,
    handleSubmit,
  } = useLoginForm();

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-xl backdrop-blur-md dark:border-emerald-900/50 dark:bg-emerald-950/20 text-center">
        <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 w-fit">
          <CheckCircle2 className="h-8 w-8 animate-bounce" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-emerald-900 dark:text-emerald-300">
          Bem-vindo de volta!
        </h2>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">
          Login realizado com sucesso. Redirecionando para a página principal...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/60 p-8 shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 overflow-hidden">
      {/* Detalhe de gradiente decorativo no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600" />

      <div className="mb-6 text-center">
        <div className="mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-3 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Entrar no Palpita AI
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Acesse sua conta para dar seus palpites nos jogos da Copa 2026.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <Input
              id="email"
              type="email"
              required
              placeholder="seu-email@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="senha">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <Input
              id="senha"
              type="password"
              required
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={lembrarMe}
              onChange={(e) => setLembrarMe(e.target.checked)}
              disabled={loading}
              className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/20"
            />
            <span>Lembrar de mim</span>
          </label>
          <Link
            href="/home#solicitar-convite"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-zinc-50 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 transition-all font-semibold rounded-lg py-2.5"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processando...
            </>
          ) : (
            'Entrar na plataforma'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        Não tem acesso?{' '}
        <Link
          href="/home#solicitar-convite"
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
        >
          Solicite um convite
        </Link>
      </div>
    </div>
  );
}
