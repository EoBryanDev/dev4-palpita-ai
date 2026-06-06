import { obterSessao } from '@/app/actions/auth';
import { DashboardPalpites } from '@/components/dashboard-palpites';
import type {
  IHistoricoDashboard,
  IPartidaDashboard,
} from '@/interface/IDashboard';
import { db, palpites, partidas, rodadas, times, usuarios } from '@palpita/db';
import { desc, eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { redirect } from 'next/navigation';

export default async function MeuEspacoPage() {
  // 1. Obter a sessão
  const session = await obterSessao();
  if (!session || !session.id) {
    redirect('/login');
  }

  // 2. Buscar o usuário
  const userList = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, session.id))
    .limit(1);

  if (userList.length === 0) {
    redirect('/login');
  }
  const user = userList[0];

  // 3. Buscar rodada ativa
  const rodadasAtivas = await db
    .select()
    .from(rodadas)
    .where(eq(rodadas.ativa, true))
    .limit(1);

  let rodadaId = '';
  let nomeRodada = 'Nenhuma rodada ativa';

  if (rodadasAtivas.length > 0) {
    rodadaId = rodadasAtivas[0].id;
    nomeRodada = rodadasAtivas[0].nome;
  } else {
    // Pegar a última rodada criada
    const ultimasRodadas = await db
      .select()
      .from(rodadas)
      .orderBy(desc(rodadas.numero))
      .limit(1);
    if (ultimasRodadas.length > 0) {
      rodadaId = ultimasRodadas[0].id;
      nomeRodada = ultimasRodadas[0].nome;
    }
  }

  // 4. Buscar partidas da rodada selecionada
  let partidasDaRodada: {
    id: string;
    rodadaId: string;
    timeA: string;
    timeB: string;
    timeAEmoji: string;
    timeBEmoji: string;
    golsTimeA: number | null;
    golsTimeB: number | null;
    dataInicio: Date;
    status: string;
  }[] = [];

  if (rodadaId) {
    const timeA = alias(times, 'time_a');
    const timeB = alias(times, 'time_b');

    partidasDaRodada = await db
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
      })
      .from(partidas)
      .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
      .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
      .where(eq(partidas.rodadaId, rodadaId));
  }

  // 5. Buscar palpites do usuário logado para todas as partidas
  const todosPalpitesUsuario = await db
    .select()
    .from(palpites)
    .where(eq(palpites.usuarioId, session.id));

  const palpitesMap = new Map<string, typeof palpites.$inferSelect>();
  for (const p of todosPalpitesUsuario) {
    palpitesMap.set(p.partidaId, p);
  }

  // 6. Enriquecer partidas da rodada para o dashboard
  const partidasEnriquecidas: IPartidaDashboard[] = partidasDaRodada.map(
    (partida) => {
      const palpite = palpitesMap.get(partida.id);
      return {
        id: partida.id,
        timeA: partida.timeA,
        timeB: partida.timeB,
        timeAEmoji: partida.timeAEmoji,
        timeBEmoji: partida.timeBEmoji,
        dataInicio: partida.dataInicio.toISOString(),
        status: partida.status,
        golsTimeA: partida.golsTimeA,
        golsTimeB: partida.golsTimeB,
        palpiteGolsA: palpite ? palpite.golsTimeA : null,
        palpiteGolsB: palpite ? palpite.golsTimeB : null,
        jaPalpitou: !!palpite,
      };
    },
  );

  // 7. Calcular pontuação e ranking geral (lógica sincronizada com API/ranking)
  const activeUsers = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
    })
    .from(usuarios)
    .where(or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')));

  const finishedMatches = await db
    .select({
      id: partidas.id,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
    })
    .from(partidas)
    .where(eq(partidas.status, 'FINALIZADO'));

  const matchesMap = new Map<
    string,
    { golsTimeA: number; golsTimeB: number }
  >();
  for (const match of finishedMatches) {
    if (match.golsTimeA !== null && match.golsTimeB !== null) {
      matchesMap.set(match.id, {
        golsTimeA: match.golsTimeA,
        golsTimeB: match.golsTimeB,
      });
    }
  }

  const allPalpites = await db.select().from(palpites);
  const userPalpitesMap = new Map<string, (typeof palpites.$inferSelect)[]>();
  for (const p of allPalpites) {
    const userList = userPalpitesMap.get(p.usuarioId) || [];
    userList.push(p);
    userPalpitesMap.set(p.usuarioId, userList);
  }

  const obterVencedor = (
    golsA: number,
    golsB: number,
  ): 'A' | 'B' | 'EMPATE' => {
    if (golsA > golsB) return 'A';
    if (golsB > golsA) return 'B';
    return 'EMPATE';
  };

  const rankingData = activeUsers.map((u) => {
    const userGuesses = userPalpitesMap.get(u.id) || [];
    let pontos = 0;

    for (const guess of userGuesses) {
      const match = matchesMap.get(guess.partidaId);
      if (match) {
        const vencedorPalpite = obterVencedor(guess.golsTimeA, guess.golsTimeB);
        const vencedorPartida = obterVencedor(match.golsTimeA, match.golsTimeB);

        if (vencedorPalpite === vencedorPartida) {
          pontos += 1;
        }
      }
    }

    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      pontos,
    };
  });

  rankingData.sort((a, b) => {
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos;
    }
    return a.nome.localeCompare(b.nome);
  });

  let rank = 1;
  let lastPoints = -1;
  let userPontos = 0;
  let userPosicao = 1;

  for (let i = 0; i < rankingData.length; i++) {
    const u = rankingData[i];
    if (u.pontos !== lastPoints) {
      rank = i + 1;
      lastPoints = u.pontos;
    }
    if (u.id === session.id) {
      userPontos = u.pontos;
      userPosicao = rank;
      break;
    }
  }

  // 8. Histórico de palpites do competidor (jogos finalizados que ele palpitou)
  const timeA = alias(times, 'time_a');
  const timeB = alias(times, 'time_b');

  const todasPartidasFinalizadas = await db
    .select({
      id: partidas.id,
      timeA: timeA.nome,
      timeB: timeB.nome,
      timeAEmoji: timeA.emoji,
      timeBEmoji: timeB.emoji,
      golsTimeA: partidas.golsTimeA,
      golsTimeB: partidas.golsTimeB,
      dataInicio: partidas.dataInicio,
    })
    .from(partidas)
    .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
    .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
    .where(eq(partidas.status, 'FINALIZADO'));

  const historico: IHistoricoDashboard[] = [];
  for (const match of todasPartidasFinalizadas) {
    const palpite = palpitesMap.get(match.id);
    if (palpite && match.golsTimeA !== null && match.golsTimeB !== null) {
      const vencedorPalpite = obterVencedor(
        palpite.golsTimeA,
        palpite.golsTimeB,
      );
      const vencedorPartida = obterVencedor(match.golsTimeA, match.golsTimeB);
      const pontosGanhos = vencedorPalpite === vencedorPartida ? 1 : 0;

      historico.push({
        partidaId: match.id,
        timeA: match.timeA,
        timeB: match.timeB,
        timeAEmoji: match.timeAEmoji,
        timeBEmoji: match.timeBEmoji,
        placarOficialA: match.golsTimeA,
        placarOficialB: match.golsTimeB,
        palpiteA: palpite.golsTimeA,
        palpiteB: palpite.golsTimeB,
        pontosGanhos,
        dataInicio: match.dataInicio.toISOString(),
      });
    }
  }

  return (
    <DashboardPalpites
      nomeUsuario={user.nome}
      emailUsuario={user.email}
      cargoUsuario={user.cargo}
      userStatus={user.status}
      pontos={userPontos}
      posicao={userPosicao}
      nomeRodada={nomeRodada}
      partidas={partidasEnriquecidas}
      historico={historico}
    />
  );
}
