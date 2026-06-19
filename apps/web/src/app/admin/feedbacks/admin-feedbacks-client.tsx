'use client';

import { atualizarStatusFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ArrowBigUp, Bug, Lightbulb } from 'lucide-react';
import { useState, useTransition } from 'react';

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
  respostaAdmin?: string | null;
  linkAdmin?: string | null;
}

interface AdminFeedbacksClientProps {
  feedbacks: FeedbackItem[];
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'revisando', label: 'Revisando' },
  { value: 'planejado', label: 'Planejado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'rejeitado', label: 'Rejeitado' },
];

const statusColors: Record<string, string> = {
  pendente: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  revisando: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  planejado:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  concluido:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  rejeitado: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
};

function AdminFeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(feedback.status);
  const [respostaAdmin, setRespostaAdmin] = useState(
    feedback.respostaAdmin || '',
  );
  const [linkAdmin, setLinkAdmin] = useState(feedback.linkAdmin || '');

  const hasChanges =
    status !== feedback.status ||
    respostaAdmin !== (feedback.respostaAdmin || '') ||
    linkAdmin !== (feedback.linkAdmin || '');

  const handleSave = () => {
    if (status === 'rejeitado' && !respostaAdmin.trim()) {
      toast({
        title: 'Aviso',
        description: 'Por favor, informe a razão da rejeição.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await atualizarStatusFeedback(
        feedback.id,
        status,
        respostaAdmin || null,
        linkAdmin || null,
      );

      if (result.success) {
        toast({ title: 'Feedback atualizado com sucesso!' });
      } else {
        toast({
          title: 'Erro ao salvar',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const isRejected = status === 'rejeitado';
  const isApproved = status === 'planejado' || status === 'concluido';

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-start gap-4">
        {/* Votos */}
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
            {feedback.totalVotos}
          </span>
        </div>

        {/* Informações Principais */}
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                {feedback.tipo === 'bug' ? (
                  <Bug className="h-3.5 w-3.5" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
              </span>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                {feedback.titulo}
              </h3>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                por {feedback.usuarioNome}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {feedback.descricao}
            </p>
          </div>

          {/* Área de Moderação do Admin */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800/50 dark:bg-zinc-950/20 space-y-3">
            <div className="flex items-center gap-3">
              <label
                htmlFor={`status-${feedback.id}`}
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Status:
              </label>
              <select
                id={`status-${feedback.id}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-bold outline-none transition-all',
                  statusColors[status] || statusColors.pendente,
                )}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Razão da Rejeição / Comentário */}
            <div className="space-y-1.5">
              <label
                htmlFor={`resposta-${feedback.id}`}
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                {isRejected
                  ? 'Razão da Rejeição (Obrigatório):'
                  : 'Comentário/Resposta do Admin (Opcional):'}
              </label>
              <Textarea
                id={`resposta-${feedback.id}`}
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder={
                  isRejected
                    ? 'Explique por que esta sugestão foi rejeitada...'
                    : 'Escreva um comentário ou feedback sobre esta sugestão...'
                }
                className="text-xs min-h-[60px] max-h-[150px] resize-y"
              />
            </div>

            {/* Link para Implementação */}
            {isApproved && (
              <div className="space-y-1.5">
                <label
                  htmlFor={`link-${feedback.id}`}
                  className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  Link da Implementação (Opcional):
                </label>
                <Input
                  id={`link-${feedback.id}`}
                  value={linkAdmin}
                  onChange={(e) => setLinkAdmin(e.target.value)}
                  placeholder="https://github.com/..."
                  className="text-xs h-8"
                />
              </div>
            )}

            {/* Ações */}
            {hasChanges && (
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  size="sm"
                  className="text-xs px-3 h-8 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminFeedbacksClient({ feedbacks }: AdminFeedbacksClientProps) {
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
        <AdminFeedbackCard key={f.id} feedback={f} />
      ))}
    </div>
  );
}
