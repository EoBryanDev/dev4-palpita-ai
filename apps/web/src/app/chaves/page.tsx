import ChavesClient from '@/components/chaves-client';
import { obterGruposClassificados } from '@/services/chaves.service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chaveamento & Grupos - Copa 2026 | Palpita AI',
  description:
    'Veja a composição dos grupos e a projeção do chaveamento do mata-mata até a grande final.',
};

export default async function ChavesPage() {
  const grupos = await obterGruposClassificados();

  return <ChavesClient grupos={grupos} />;
}
