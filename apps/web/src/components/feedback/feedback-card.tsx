'use client';

import { votarFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowBigUp, Bug, Lightbulb } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';

interface FeedbackCardProps {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  totalVotos: number;
  usuarioVotou: boolean;
  usuarioNome: string;
  usuarioLogado?: boolean;
  respostaAdmin?: string | null;
  linkAdmin?: string | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: {
    label: 'Pendente',
    color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  revisando: {
    label: 'Revisando',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  },
  planejado: {
    label: 'Planejado',
    color:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  },
  concluido: {
    label: 'Concluído',
    color:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  },
};

const tipoIcon = {
  sugestao: Lightbulb,
  bug: Bug,
};

export function FeedbackCard({
  id,
  titulo,
  descricao,
  tipo,
  status,
  totalVotos,
  usuarioVotou,
  usuarioNome,
  usuarioLogado,
  respostaAdmin,
  linkAdmin,
}: FeedbackCardProps) {
  const [votou, setVotou] = useOptimistic(usuarioVotou);
  const [votos, setVotos] = useOptimistic(totalVotos);
  const [, startTransition] = useTransition();

  const handleVotar = () => {
    if (!usuarioLogado) return;

    startTransition(async () => {
      setVotou((prev) => !prev);
      setVotos((prev) => (votou ? prev - 1 : prev + 1));

      const result = await votarFeedback(id);
      if (!result.success) {
        setVotou((prev) => !prev);
        setVotos((prev) => (votou ? prev - 1 : prev + 1));
      }
    });
  };

  const Icon = tipoIcon[tipo as keyof typeof tipoIcon] || Lightbulb;
  const statusStyle = statusLabels[status] || statusLabels.pendente;

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-emerald-500/30 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-500/20">
      <div className="flex items-start gap-4">
        {/* Voto */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            onClick={handleVotar}
            disabled={!usuarioLogado}
            title={
              usuarioLogado
                ? votou
                  ? 'Remover voto'
                  : 'Votar'
                : 'Faça login para votar'
            }
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all',
              votou
                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border-zinc-200 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-500 dark:border-zinc-700 dark:hover:border-emerald-400/50',
              !usuarioLogado && 'cursor-not-allowed opacity-50',
            )}
          >
            <ArrowBigUp className={cn('h-5 w-5', votou && 'fill-current')} />
          </button>
          <span
            className={cn(
              'text-xs font-bold tabular-nums',
              votou
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {votos}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {titulo}
            </h3>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                statusStyle.color,
              )}
            >
              {statusStyle.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {descricao}
          </p>
          {respostaAdmin && (
            <div
              className={cn(
                'mt-3 rounded-xl border p-3 text-xs leading-relaxed',
                status === 'rejeitado'
                  ? 'border-red-100 bg-red-50/50 text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-300'
                  : 'border-zinc-100 bg-zinc-50 text-zinc-800 dark:border-zinc-800/30 dark:bg-zinc-950/20 dark:text-zinc-300',
              )}
            >
              <span className="font-bold block mb-1">
                {status === 'rejeitado'
                  ? 'Razão da Rejeição:'
                  : 'Resposta do Admin:'}
              </span>
              <p>{respostaAdmin}</p>
            </div>
          )}
          {linkAdmin && (
            <div className="mt-3 text-xs flex flex-wrap items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="font-bold">Link da implementação:</span>
              <a
                href={linkAdmin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-emerald-500 font-medium break-all"
              >
                {linkAdmin}
              </a>
            </div>
          )}
          <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            por {usuarioNome}
          </p>
        </div>
      </div>
    </div>
  );
}
