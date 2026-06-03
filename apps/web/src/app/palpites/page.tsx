import type { Metadata } from 'next';
import type React from 'react';

import { BarChart3 } from 'lucide-react';

import { PalpitesStats } from '@/components/palpites-stats';

export const metadata: Metadata = {
  title: 'Estatísticas de Palpites - Palpita AI',
  description:
    'Veja os percentuais de palpites coletivos e apostas da comunidade para cada jogo da Copa 2026.',
};

export default function PalpitesPage(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <BarChart3 className="h-3 w-3" />
          Analytics & Palpites
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Palpites dos Participantes
        </h1>
        <p className="text-zinc-650 dark:text-zinc-400 max-w-2xl text-sm">
          Acompanhe as tendências e estatísticas coletivas de apostas de cada
          jogo da Copa 2026. Em conformidade com a segurança da competição, os
          palpites individuais são liberados apenas após o início da respectiva
          partida (RN03).
        </p>
      </div>

      <PalpitesStats />
    </div>
  );
}
