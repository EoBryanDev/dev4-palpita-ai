'use client';

import { atualizarStatusFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ArrowBigUp, Bug, Lightbulb } from 'lucide-react';
import { useTransition } from 'react';

interface FeedbackItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  dataCriacao: Date;
  totalVotos: number;
  usuarioVotou: boolean;
  usuarioId: string;
  usuarioNome: string;
}

interface AdminFeedbacksClientProps {
  feedbacks: FeedbackItem[];
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'revisando', label: 'Revisando' },
  { value: 'planejado', label: 'Planejado' },
  { value: 'concluido', label: 'Concluído' },
];

const statusColors: Record<string, string> = {
  pendente: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  revisando: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  planejado:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  concluido:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
};

export function AdminFeedbacksClient({ feedbacks }: AdminFeedbacksClientProps) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const handleStatusChange = (feedbackId: string, status: string) => {
    startTransition(async () => {
      const result = await atualizarStatusFeedback(feedbackId, status);
      if (result.success) {
        toast({ title: 'Status atualizado!' });
      } else {
        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  if (feedbacks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum feedback recebido ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold',
                  'border-zinc-200 dark:border-zinc-700',
                )}
              >
                <ArrowBigUp className="h-5 w-5 text-zinc-400" />
              </div>
              <span className="text-xs font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
                {f.totalVotos}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                  {f.tipo === 'bug' ? (
                    <Bug className="h-3.5 w-3.5" />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5" />
                  )}
                </span>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {f.titulo}
                </h3>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {f.descricao}
              </p>
              <div className="flex items-center gap-4">
                <select
                  defaultValue={f.status}
                  onChange={(e) => handleStatusChange(f.id, e.target.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold outline-none transition-all',
                    statusColors[f.status] || statusColors.pendente,
                  )}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  por {f.usuarioNome}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
