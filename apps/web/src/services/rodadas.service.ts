import { db, rodadas } from '@palpita/db';
import { desc, eq } from 'drizzle-orm';

export interface IRodada {
  id: string;
  numero: number;
  nome: string;
  ativa: boolean;
}

export async function obterRodadas(): Promise<IRodada[]> {
  const dbRodadas = await db
    .select()
    .from(rodadas)
    .orderBy(desc(rodadas.numero));

  return dbRodadas.map((r) => ({
    id: r.id,
    numero: r.numero,
    nome: r.nome,
    ativa: r.ativa,
  }));
}

export async function obterRodadaAtiva(): Promise<IRodada | null> {
  const rodada =
    (await db.query.rodadas.findFirst({
      where: eq(rodadas.ativa, true),
    })) ||
    (await db.query.rodadas.findFirst({
      orderBy: desc(rodadas.numero),
    }));

  if (!rodada) {
    return null;
  }

  return {
    id: rodada.id,
    numero: rodada.numero,
    nome: rodada.nome,
    ativa: rodada.ativa,
  };
}
