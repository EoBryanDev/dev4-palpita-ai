'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSolicitarConvite } from '@/hooks/use-solicitar-convite';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import type React from 'react';

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
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            type="text"
            required
            placeholder="Ex: Gabriel Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="Ex: gabriel@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
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
