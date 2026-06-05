import ChavesClient from '@/components/chaves-client';
import { db, times } from '@palpita/db';
import { asc } from 'drizzle-orm';

export const metadata = {
  title: 'Chaveamento & Grupos - Copa 2026 | Palpita AI',
  description:
    'Veja a composição dos grupos e a projeção do chaveamento do mata-mata até a grande final.',
};

export default async function ChavesPage() {
  const dbTimes = await db
    .select()
    .from(times)
    .orderBy(asc(times.grupo), asc(times.nome));

  const gruposMap = new Map<
    string,
    { nome: string; times: { nome: string; emoji: string; pontos: number }[] }
  >();

  for (const t of dbTimes) {
    let grupo = gruposMap.get(t.grupo);
    if (!grupo) {
      grupo = {
        nome: t.grupo,
        times: [],
      };
      gruposMap.set(t.grupo, grupo);
    }
    grupo.times.push({
      nome: t.nome,
      emoji: t.emoji,
      pontos: 0,
    });
  }

  const grupos = Array.from(gruposMap.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome),
  );

  return <ChavesClient grupos={grupos} />;
}
