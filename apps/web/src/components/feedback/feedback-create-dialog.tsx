'use client';

import { criarFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        'Enviar sugestão'
      )}
    </Button>
  );
}

interface FeedbackCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackCreateDialog({
  open,
  onClose,
}: FeedbackCreateDialogProps) {
  const { toast } = useToast();
  const [, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const data = {
        titulo: formData.get('titulo') as string,
        descricao: formData.get('descricao') as string,
        tipo: formData.get('tipo') as 'sugestao' | 'bug',
      };
      const result = await criarFeedback(data);
      if (result.success) {
        toast({
          title: 'Feedback enviado!',
          description: 'Obrigado pela sua contribuição.',
        });
        onClose();
      } else {
        toast({
          title: 'Erro',
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    null,
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Palpita a Feature</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Compartilhe sua ideia ou reporte um bug
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <select
              name="tipo"
              id="tipo"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              required
            >
              <option value="sugestao">Sugestão de melhoria</option>
              <option value="bug">Reportar bug</option>
            </select>
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              name="titulo"
              id="titulo"
              placeholder="Ex: Modo escuro no ranking"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              name="descricao"
              id="descricao"
              placeholder="Descreva sua ideia em detalhes..."
              required
              minLength={10}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-zinc-400">
              Máximo de 2000 caracteres
            </p>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
