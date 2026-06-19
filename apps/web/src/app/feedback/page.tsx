import { obterSessao } from '@/app/actions/auth';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { listarFeedbacks } from '@/services/feedbacks.service';
import { Lightbulb } from 'lucide-react';
import type { Metadata } from 'next';
import { FeedbackPageClient } from './feedback-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Palpita a Feature | Palpita AI',
  description:
    'Sugira melhorias, reporte bugs e vote nas ideias da comunidade.',
};

export default async function FeedbackPage() {
  const session = await obterSessao();
  const feedbacks = await listarFeedbacks(session?.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
          <Lightbulb className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Palpita a Feature
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sugira melhorias, reporte bugs e vote nas ideias da comunidade. As
          sugestões mais votadas guiam o desenvolvimento da plataforma.
        </p>
      </div>

      <FeedbackPageClient feedbacks={feedbacks} usuarioLogado={!!session} />
    </div>
  );
}
