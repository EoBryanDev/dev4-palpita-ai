import { db, times } from '@palpita/db';
import { asc } from 'drizzle-orm';

export interface ITimesServiceResponse {
  id: string;
  nome: string;
  emoji: string;
  confederacao: string;
  grupo: string;
}

export async function obterTimes(): Promise<ITimesServiceResponse[]> {
  const dbTimes = await db.select().from(times).orderBy(asc(times.nome));

  return dbTimes.map((t) => ({
    id: t.id,
    nome: t.nome,
    emoji: t.emoji,
    confederacao: t.confederacao,
    grupo: t.grupo,
  }));
}
