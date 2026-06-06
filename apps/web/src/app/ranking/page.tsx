import type { Metadata } from 'next';
import type React from 'react';

import { Trophy } from 'lucide-react';

import { RankingList } from '@/components/ranking-list';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Classificação Geral - Palpita AI',
  description:
    'Acompanhe o ranking dos participantes da plataforma de palpites da Copa 2026.',
};

export default function RankingPage(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Classificação dos Palpiteiros"
        description="Acompanhe o ranking em tempo real dos participantes da plataforma. Os pontos são computados e atualizados assim que os resultados oficiais dos jogos são lançados."
        badgeText="Ranking Geral"
        icon={Trophy}
      />

      <RankingList />
    </div>
  );
}
