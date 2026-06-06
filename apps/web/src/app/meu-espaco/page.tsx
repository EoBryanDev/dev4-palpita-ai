import { obterSessao } from '@/app/actions/auth';
import { DashboardPalpites } from '@/components/dashboard-palpites';
import type {
  IHistoricoDashboard,
  IPartidaDashboard,
} from '@/interface/IDashboard';
import { obterPalpitesUsuario } from '@/services/palpites.service';
import { obterPartidas } from '@/services/partidas.service';
import { calcularRankingGeral } from '@/services/ranking.service';
import { obterRodadaAtiva } from '@/services/rodadas.service';
import { obterUsuarioPorId } from '@/services/usuarios.service';
import { redirect } from 'next/navigation';

export default async function MeuEspacoPage() {
  // 1. Obter a sessão
  const session = await obterSessao();
  if (!session || !session.id) {
    redirect('/login');
  }

  // 2. Buscar o usuário
  const user = await obterUsuarioPorId(session.id);
  if (!user) {
    redirect('/login');
  }

  // 3. Buscar rodada ativa
  const rodadaAtiva = await obterRodadaAtiva();
  let rodadaId = '';
  let nomeRodada = 'Nenhuma rodada ativa';

  if (rodadaAtiva) {
    rodadaId = rodadaAtiva.id;
    nomeRodada = rodadaAtiva.nome;
  }

  // 4. Buscar partidas da rodada selecionada
  let partidasDaRodada: Awaited<ReturnType<typeof obterPartidas>> = [];

  if (rodadaId) {
    partidasDaRodada = await obterPartidas(rodadaId);
  }

  // 5. Buscar palpites do usuário logado para todas as partidas
  const todosPalpitesUsuario = await obterPalpitesUsuario(session.id);

  const palpitesMap = new Map<string, (typeof todosPalpitesUsuario)[number]>();
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
  const rankedUsers = await calcularRankingGeral();
  const userRank = rankedUsers.find((u) => u.id === session.id);
  const userPontos = userRank ? userRank.pontos : 0;
  const userPosicao = userRank ? userRank.posicao : 1;

  const obterVencedor = (
    golsA: number,
    golsB: number,
  ): 'A' | 'B' | 'EMPATE' => {
    if (golsA > golsB) return 'A';
    if (golsB > golsA) return 'B';
    return 'EMPATE';
  };

  // 8. Histórico de palpites do competidor (jogos finalizados que ele palpitou)
  const todasPartidasFinalizadas = (await obterPartidas()).filter(
    (p) => p.status === 'FINALIZADO',
  );

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
