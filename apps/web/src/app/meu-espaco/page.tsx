import { obterSessao } from '@/app/actions/auth';
import { DashboardPalpites } from '@/components/dashboard-palpites';
import type {
  IHistoricoDashboard,
  IPartidaDashboard,
  IRodadaDashboard,
} from '@/interface/IDashboard';
import {
  obterPalpitesSalvosFuturosPaginados,
  obterPalpitesUsuario,
  obterTotalPalpitesSalvosFuturos,
} from '@/services/palpites.service';
import { obterPartidas } from '@/services/partidas.service';
import { calcularRankingGeral } from '@/services/ranking.service';
import { obterRodadaAtiva, obterRodadas } from '@/services/rodadas.service';
import { obterUsuarioPorId } from '@/services/usuarios.service';
import { Palpite } from '@palpita/core';
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

  // 3. Buscar todas as rodadas
  const todasRodadas = await obterRodadas();

  // 4. Buscar palpites do usuário logado para todas as partidas
  const todosPalpitesUsuario = await obterPalpitesUsuario(session.id);

  const palpitesMap = new Map<string, (typeof todosPalpitesUsuario)[number]>();
  for (const p of todosPalpitesUsuario) {
    palpitesMap.set(p.partidaId, p);
  }

  // 5. Buscar todas as partidas e calcular prazo limite
  const todasPartidas = await obterPartidas();
  let prazoLimite: string | undefined;
  let isTudoBloqueado = false;
  let isLiberacaoTardia = false;

  // Se o usuário tem dataLiberacao, calcular deadline individual de 30 min
  if (user.dataLiberacao) {
    const dataLiberacao = new Date(user.dataLiberacao);
    const deadlineIndividual = new Date(
      dataLiberacao.getTime() + 30 * 60 * 1000,
    );
    prazoLimite = deadlineIndividual.toISOString();
    isTudoBloqueado = new Date() >= deadlineIndividual;
    isLiberacaoTardia = true;
  }

  // 6. Para usuários com liberação tardia, filtrar apenas partidas futuras
  const partidasVisiveis = isLiberacaoTardia
    ? todasPartidas.filter((p) => new Date(p.dataInicio) > new Date())
    : todasPartidas;

  // 7. Enriquecer partidas por rodada
  const rodadasDashboard: IRodadaDashboard[] = [];

  for (const rodada of todasRodadas) {
    const partidasDaRodada = partidasVisiveis.filter(
      (p) => p.rodadaId === rodada.id,
    );

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
          momentoPrevisto: palpite ? palpite.momentoPrevisto : 'NORMAL',
          timeVencedorPrevisto: palpite ? palpite.timeVencedorPrevisto : null,
          decididoEm: partida.decididoEm,
          timeVencedorPenaltis: partida.timeVencedorPenaltis,
          tipoRodada: partida.rodadaTipo,
          jaPalpitou: !!palpite,
          rodadaNome: rodada.nome,
        };
      },
    );

    rodadasDashboard.push({
      id: rodada.id,
      numero: rodada.numero,
      nome: rodada.nome,
      tipo: rodada.tipo,
      partidas: partidasEnriquecidas,
    });
  }

  // 6. Calcular pontuação e ranking geral
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

  // 8. Histórico de palpites do competidor (reusing todasPartidas from step 5)
  const todasPartidasHistorico = todasPartidas.filter(
    (p) => p.status !== 'AGENDADO' && p.status !== 'AGENDADA',
  );

  const historico: IHistoricoDashboard[] = [];
  for (const match of todasPartidasHistorico) {
    const palpite = palpitesMap.get(match.id);
    if (palpite) {
      const golsA = match.golsTimeA ?? 0;
      const golsB = match.golsTimeB ?? 0;

      const palpiteEntity = new Palpite({
        id: palpite.id,
        usuarioId: palpite.usuarioId,
        partidaId: palpite.partidaId,
        golsTimeA: palpite.golsTimeA,
        golsTimeB: palpite.golsTimeB,
        momentoPrevisto: palpite.momentoPrevisto,
        timeVencedorPrevisto: palpite.timeVencedorPrevisto ?? undefined,
        dataCriacao: palpite.dataCriacao,
        dataAtualizacao: palpite.dataAtualizacao,
      });

      const pontosGanhos = palpiteEntity.calcularPontos(
        golsA,
        golsB,
        match.rodadaTipo ?? 'GRUPO',
        match.decididoEm ?? 'NORMAL',
        match.timeVencedorPenaltis,
      );

      historico.push({
        partidaId: match.id,
        timeA: match.timeA,
        timeB: match.timeB,
        timeAEmoji: match.timeAEmoji,
        timeBEmoji: match.timeBEmoji,
        placarOficialA: golsA,
        placarOficialB: golsB,
        palpiteA: palpite.golsTimeA,
        palpiteB: palpite.golsTimeB,
        pontosGanhos,
        dataInicio: match.dataInicio.toISOString(),
        status: match.status,
        momentoPrevisto: palpite.momentoPrevisto,
        timeVencedorPrevisto: palpite.timeVencedorPrevisto,
        timeVencedorPenaltis: match.timeVencedorPenaltis,
        decididoEm: match.decididoEm,
        tipoRodada: match.rodadaTipo,
      });
    }
  }

  // Ordenar pelo mais recente (dataInicio desc)
  historico.sort(
    (a, b) =>
      new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime(),
  );

  // 9. Buscar palpites salvos futuros iniciais paginados (limit 5, offset 0)
  const totalPalpitesSalvos = await obterTotalPalpitesSalvosFuturos(session.id);
  const palpitesSalvosIniciais = await obterPalpitesSalvosFuturosPaginados(
    session.id,
    5,
    0,
  );

  // 10. Buscar palpites de jogos em andamento (Ao Vivo)
  const partidasEmAndamento = todasPartidas.filter(
    (p) =>
      p.status !== 'FINALIZADO' &&
      p.status !== 'FINALIZADA' &&
      p.status !== 'AGENDADO' &&
      p.status !== 'AGENDADA',
  );

  const emAndamentoEnriquecidas: IPartidaDashboard[] = partidasEmAndamento.map(
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
        momentoPrevisto: palpite ? palpite.momentoPrevisto : 'NORMAL',
        timeVencedorPrevisto: palpite ? palpite.timeVencedorPrevisto : null,
        decididoEm: partida.decididoEm,
        timeVencedorPenaltis: partida.timeVencedorPenaltis,
        tipoRodada: partida.rodadaTipo,
        jaPalpitou: !!palpite,
      };
    },
  );

  return (
    <DashboardPalpites
      nomeUsuario={user.nome}
      emailUsuario={user.email}
      cargoUsuario={user.cargo}
      userStatus={user.status}
      pontos={userPontos}
      posicao={userPosicao}
      rodadas={rodadasDashboard}
      historico={historico}
      prazoLimite={prazoLimite}
      isTudoBloqueado={isTudoBloqueado}
      isLiberacaoTardia={isLiberacaoTardia}
      palpitesSalvosIniciais={palpitesSalvosIniciais}
      totalPalpitesSalvos={totalPalpitesSalvos}
      partidasEmAndamento={emAndamentoEnriquecidas}
    />
  );
}
