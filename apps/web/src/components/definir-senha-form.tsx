'use client';

import { cadastrarSenha } from '@/app/actions/convites';
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';

interface IDefinirSenhaFormProps {
  tokenId: string;
}

export function DefinirSenhaForm({ tokenId }: IDefinirSenhaFormProps) {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (senha.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await cadastrarSenha(tokenId, senha);
      if (res.success) {
        setSuccess(true);
        // Aguarda 2 segundos antes de redirecionar para a tela de login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao cadastrar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-xl backdrop-blur-md dark:border-emerald-900/50 dark:bg-emerald-950/20 text-center">
        <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 w-fit">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-emerald-900 dark:text-emerald-300">
          Senha cadastrada!
        </h2>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">
          Sua conta foi ativada com sucesso. Redirecionando para a tela de
          login...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 text-center">
        <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 w-fit mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Definir Senha
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Crie uma senha de acesso para ativar sua conta de palpiteiro.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="senha"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Nova Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            placeholder="No mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor="confirmarSenha"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Confirmar Nova Senha
          </label>
          <input
            id="confirmarSenha"
            type="password"
            required
            minLength={6}
            placeholder="Digite a mesma senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-50"
          />
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
            'Salvar Senha e Ativar'
          )}
        </Button>
      </form>
    </div>
  );
}
