import type { Metadata } from 'next';
import type React from 'react';

import { BarChart3 } from 'lucide-react';

import { PalpitesStats } from '@/components/palpites-stats';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Estatísticas de Palpites - Palpita AI',
  description:
    'Veja os percentuais de palpites coletivos e apostas da comunidade para cada jogo da Copa 2026.',
};

export default function PalpitesPage(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Palpites dos Participantes"
        description="Acompanhe as tendências e estatísticas coletivas de apostas de cada jogo da Copa 2026. Em conformidade com a segurança da competição, os palpites individuais são liberados apenas após o início da respectiva partida."
        badgeText="Analytics & Palpites"
        icon={BarChart3}
      />

      <PalpitesStats />
    </div>
  );
}
