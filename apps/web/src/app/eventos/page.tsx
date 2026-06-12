import type { Metadata } from 'next';
import type React from 'react';

import { Activity } from 'lucide-react';

import { EventosClient } from '@/components/eventos-client';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Linha do Tempo de Eventos - Palpita AI',
  description:
    'Acompanhe a linha do tempo de confrontos iniciados, em andamento ou encerrados, veja os maiores pontuadores de cada rodada e comente as partidas em tempo real.',
};

export default function EventosPage(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Linha do Tempo de Eventos"
        description="Fique por dentro de todos os acontecimentos: confrontos em andamento, resultados consolidados, maiores pontuadores de cada rodada e interaja nos comentários das partidas."
        badgeText="Eventos & Timeline"
        icon={Activity}
      />

      <EventosClient />
    </div>
  );
}
