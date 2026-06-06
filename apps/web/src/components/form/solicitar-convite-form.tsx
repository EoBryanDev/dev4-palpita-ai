'use client';

import { useSolicitarConvite } from '@/hooks/use-solicitar-convite';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';

export function SolicitarConviteForm() {
  const { nome, setNome, email, setEmail, loading, result, handleSubmit } =
    useSolicitarConvite();

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          Peça seu convite
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Insira seus dados para solicitar acesso à plataforma de palpites.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="nome"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Nome Completo
          </label>
          <input
            id="nome"
            type="text"
            required
            placeholder="Ex: Gabriel Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Ex: gabriel@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50"
          />
        </div>

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
            'Solicitar Convite'
          )}
        </Button>
      </form>

      {result && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-lg p-3.5 text-sm transition-all border ${
            result.success
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/50'
              : 'bg-red-50 text-red-950 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/50'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          )}
          <span className="font-medium">{result.message}</span>
        </div>
      )}
    </div>
  );
}
