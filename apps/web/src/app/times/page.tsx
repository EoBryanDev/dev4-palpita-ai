import TimesClient from '@/components/times-client';
import { obterTimes } from '@/services/times.service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Equipes da Copa 2026 | Palpita AI',
  description:
    'Explore as seleções classificadas para a maior Copa do Mundo da história.',
};

export default async function TimesPage() {
  const initialTimes = await obterTimes();

  return <TimesClient initialTimes={initialTimes} />;
}
