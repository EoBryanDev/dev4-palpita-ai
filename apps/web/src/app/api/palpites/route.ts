import { db, palpites, partidas, rodadas, times, usuarios } from '@palpita/db';
import { eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const timeA = alias(times, 'time_a');
    const timeB = alias(times, 'time_b');

    // 1. Buscar todas as partidas com suas respectivas rodadas
    const dbPartidas = await db
      .select({
        id: partidas.id,
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
      .innerJoin(timeB, eq(partidas.timeBId, timeB.id));

    // 2. Buscar todos os palpites dos usuários ATIVOS ou LIBERADOS
    const dbPalpites = await db
      .select({
        id: palpites.id,
        partidaId: palpites.partidaId,
        golsTimeA: palpites.golsTimeA,
        golsTimeB: palpites.golsTimeB,
        usuarioNome: usuarios.nome,
      })
      .from(palpites)
      .innerJoin(usuarios, eq(palpites.usuarioId, usuarios.id))
      .where(or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')));

    // Agrupar palpites por partidaId
    const palpitesPorPartida = new Map<string, typeof dbPalpites>();
    for (const p of dbPalpites) {
      const matchGuesses = palpitesPorPartida.get(p.partidaId) || [];
      matchGuesses.push(p);
      palpitesPorPartida.set(p.partidaId, matchGuesses);
    }

    const now = new Date();

    // 3. Processar as estatísticas para cada partida
    const estatisticasPartidas = dbPartidas.map((match) => {
      const guesses = palpitesPorPartida.get(match.id) || [];
      const totalGuesses = guesses.length;

      let vitoriasA = 0;
      let vitoriasB = 0;
      let empates = 0;

      for (const g of guesses) {
        if (g.golsTimeA > g.golsTimeB) {
          vitoriasA += 1;
        } else if (g.golsTimeB > g.golsTimeA) {
          vitoriasB += 1;
        } else {
          empates += 1;
        }
      }

      const pctVitoriasA =
        totalGuesses > 0 ? Math.round((vitoriasA / totalGuesses) * 100) : 0;
      const pctVitoriasB =
        totalGuesses > 0 ? Math.round((vitoriasB / totalGuesses) * 100) : 0;
      const pctEmpates =
        totalGuesses > 0 ? Math.round((empates / totalGuesses) * 100) : 0;

      // Controle rigoroso da Regra
      const isStarted = now >= new Date(match.dataInicio);

      return {
        id: match.id,
        timeA: match.timeA,
        timeB: match.timeB,
        timeAEmoji: match.timeAEmoji,
        timeBEmoji: match.timeBEmoji,
        golsTimeA: match.golsTimeA,
        golsTimeB: match.golsTimeB,
        dataInicio: match.dataInicio,
        status: match.status,
        rodadaNome: match.rodadaNome,
        estatisticas: {
          total: totalGuesses,
          vitoriasA,
          vitoriasB,
          empates,
          pctVitoriasA,
          pctVitoriasB,
          pctEmpates,
        },
        palpitesIndividuaisLiberados: isStarted,
        palpitesIndividuais: isStarted
          ? guesses.map((g) => ({
              id: g.id,
              usuarioNome: g.usuarioNome,
              golsTimeA: g.golsTimeA,
              golsTimeB: g.golsTimeB,
            }))
          : [],
      };
    });

    // Ordenar as partidas pela data de início
    estatisticasPartidas.sort(
      (a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
    );

    return NextResponse.json(estatisticasPartidas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de palpites:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar estatísticas.' },
      { status: 500 },
    );
  }
}
