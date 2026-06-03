import type { Metadata } from 'next';
import type React from 'react';

import { Trophy } from 'lucide-react';

import { RankingList } from '@/components/ranking-list';

export const metadata: Metadata = {
  title: 'Classificação Geral - Palpita AI',
  description:
    'Acompanhe o ranking dos participantes da plataforma de palpites da Copa 2026.',
};

export default function RankingPage(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Trophy className="h-3 w-3" />
          Ranking Geral
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Classificação dos Palpiteiros
        </h1>
        <p className="text-zinc-650 dark:text-zinc-400 max-w-2xl text-sm">
          Acompanhe o ranking em tempo real dos participantes da plataforma. Os
          pontos são computados e atualizados assim que os resultados oficiais
          dos jogos são lançados.
        </p>
      </div>

      <RankingList />
    </div>
  );
}
