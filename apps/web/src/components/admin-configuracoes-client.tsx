'use client';

import { salvarValorPalpite } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Coins, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import type { IAdminConfiguracoesClientProps } from '@/interface/IAdmin';

export function AdminConfiguracoesClient({
  totalLiberados,
  valorInicial,
}: IAdminConfiguracoesClientProps) {
  const [valor, setValor] = useState<string>(valorInicial.toString());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const valorNumerico = Number.parseFloat(valor) || 0;
  const totalArrecadado = totalLiberados * valorNumerico;

  const handleSave = () => {
    const valNum = Number.parseFloat(valor);
    if (Number.isNaN(valNum) || valNum < 0) {
      toast({
        title: 'Valor Inválido',
        description:
          'Por favor, insira um valor numérico válido maior ou igual a zero.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await salvarValorPalpite(valNum);
        if (res.success) {
          toast({
            title: 'Configuração Salva',
            description: res.message,
          });
          router.refresh();
        } else {
          toast({
            title: 'Erro ao Salvar',
            description: res.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Erro ao salvar valor do palpite:', error);
        toast({
          title: 'Erro de Conexão',
          description: 'Houve um erro de comunicação com o servidor.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/30 flex flex-col justify-between gap-6 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="space-y-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Valor da Inscrição e Prêmios
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Defina o valor da inscrição do palpite para cada participante. O
          prêmio total do bolão é calculado multiplicando os jogadores ativos
          pelo valor definido.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Input do Valor */}
        <div className="space-y-2">
          <label
            htmlFor="valor-palpite"
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
          >
            Valor Individual (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
              R$
            </span>
            <input
              id="valor-palpite"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-4 py-3.5 text-sm font-bold outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Display do Prêmio Total */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-800/50 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Total Estimado de Prêmios
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-xl font-bold text-zinc-600 dark:text-zinc-400">
              R$
            </span>
            <span className="text-3xl font-black bg-linear-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
              {totalArrecadado.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 italic">
            Calculado para {totalLiberados}{' '}
            {totalLiberados === 1 ? 'apostador apto' : 'apostadores aptos'}
          </span>
        </div>
      </div>

      <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-emerald-600 text-zinc-50 hover:bg-emerald-500 dark:bg-emerald-50 dark:text-zinc-950 dark:hover:bg-emerald-200 rounded-2xl py-5 px-5 font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </div>
  );
}
