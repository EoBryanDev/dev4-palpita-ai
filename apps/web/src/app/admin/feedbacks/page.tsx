import { obterSessao } from '@/app/actions/auth';
import { listarFeedbacks } from '@/services/feedbacks.service';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminFeedbacksClient } from './admin-feedbacks-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Feedbacks | Palpita AI',
  description: 'Gerencie os feedbacks da comunidade.',
};

export default async function AdminFeedbacksPage() {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    redirect('/meu-espaco');
  }

  const feedbacks = await listarFeedbacks(session.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Gerenciar Feedbacks
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Altere o status dos feedbacks da comunidade.
        </p>
      </div>

      <AdminFeedbacksClient feedbacks={feedbacks} />
    </div>
  );
}
