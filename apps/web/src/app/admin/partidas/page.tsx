import { obterSessao } from '@/app/actions/auth';
import { AdminPartidasClient } from '@/components/admin-partidas-client';
import { db, partidas, rodadas, times } from '@palpita/db';
import { asc, desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Partidas | Palpita AI',
  description: 'Gerenciamento de rodadas, jogos e resultados do Palpita AI.',
};

export default async function AdminPartidasPage() {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    redirect('/meu-espaco');
  }

  // 1. Buscar todas as rodadas
  const allRodadas = await db
    .select()
    .from(rodadas)
    .orderBy(desc(rodadas.numero));

  const timeA = alias(times, 'time_a');
  const timeB = alias(times, 'time_b');

  // 2. Buscar todas as partidas e fazer join com rodada e times para obter nomes e emojis
  const allPartidas = await db
    .select({
      id: partidas.id,
      rodadaId: partidas.rodadaId,
      timeA: timeA.nome,
      timeB: timeB.nome,
      timeAEmoji: timeA.emoji,
      timeBEmoji: timeB.emoji,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      dataInicio: partidas.dataInicio,
      status: partidas.status,
      rodadaNome: rodadas.nome,
    })
    .from(partidas)
    .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .orderBy(asc(partidas.dataInicio));

  // 3. Buscar todos os times cadastrados
  const allTimes = await db.select().from(times).orderBy(asc(times.nome));

  // Mapear dados para formatos compatíveis com Client Component
  const mappedRodadas = allRodadas.map((r) => ({
    id: r.id,
    numero: r.numero,
    nome: r.nome,
    ativa: r.ativa,
  }));

  const mappedPartidas = allPartidas.map((p) => ({
    id: p.id,
    rodadaId: p.rodadaId,
    timeA: p.timeA,
    timeB: p.timeB,
    timeAEmoji: p.timeAEmoji,
    timeBEmoji: p.timeBEmoji,
    golsTimeA: p.golsTimeA,
    golsTimeB: p.golsTimeB,
    dataInicio: p.dataInicio.toISOString(),
    status: p.status,
    rodadaNome: p.rodadaNome,
  }));

  const mappedTimes = allTimes.map((t) => ({
    id: t.id,
    nome: t.nome,
    emoji: t.emoji,
    grupo: t.grupo,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Painel de Jogos e Resultados
        </h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2">
          Cadastre novas rodadas, adicione confrontos e faça o lançamento de
          placares oficiais do bolão.
        </p>
      </div>
      <AdminPartidasClient
        rodadas={mappedRodadas}
        partidas={mappedPartidas}
        times={mappedTimes}
      />
    </div>
  );
}
