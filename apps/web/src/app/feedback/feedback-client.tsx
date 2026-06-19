'use client';

import { FeedbackCreateDialog } from '@/components/feedback/feedback-create-dialog';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

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

interface FeedbackPageClientProps {
  feedbacks: FeedbackItem[];
  usuarioLogado: boolean;
}

export function FeedbackPageClient({
  feedbacks,
  usuarioLogado,
}: FeedbackPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {feedbacks.length} {feedbacks.length === 1 ? 'sugestão' : 'sugestões'}
        </p>
        {usuarioLogado ? (
          <Button onClick={() => setDialogOpen(true)}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Nova sugestão
          </Button>
        ) : (
          <p className="text-xs text-zinc-400">
            Faça login para enviar sua sugestão
          </p>
        )}
      </div>

      <FeedbackList feedbacks={feedbacks} usuarioLogado={usuarioLogado} />

      <FeedbackCreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
