import { obterPalpitesUsuariosAtivos } from '@/services/palpites.service';
import { obterPartidas } from '@/services/partidas.service';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    // 1. Buscar todas as partidas com suas respectivas rodadas
    const dbPartidas = await obterPartidas();

    // 2. Buscar todos os palpites dos usuários ATIVOS ou LIBERADOS
    const dbPalpites = await obterPalpitesUsuariosAtivos();

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

      // Os palpites individuais estão sempre liberados porque as apostas já foram fechadas
      // para todo o torneio e a Copa já começou.
      const palpitesLiberados = true;

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
        palpitesIndividuaisLiberados: palpitesLiberados,
        palpitesIndividuais: guesses.map((g) => ({
          id: g.id,
          usuarioNome: g.usuarioNome,
          golsTimeA: g.golsTimeA,
          golsTimeB: g.golsTimeB,
        })),
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
