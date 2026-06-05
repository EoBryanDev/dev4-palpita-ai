import TimesClient from '@/components/times-client';
import { db, times } from '@palpita/db';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Equipes da Copa 2026 | Palpita AI',
  description:
    'Explore as seleções classificadas para a maior Copa do Mundo da história.',
};

export default async function TimesPage() {
  const dbTimes = await db.select().from(times).orderBy(asc(times.nome));

  const initialTimes = dbTimes.map((t) => ({
    id: t.id,
    nome: t.nome,
    emoji: t.emoji,
    confederacao: t.confederacao,
    grupo: t.grupo,
  }));

  return <TimesClient initialTimes={initialTimes} />;
}
