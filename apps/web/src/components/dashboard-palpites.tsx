'use client';

import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/ui/flag-image';
import { StatCard } from '@/components/ui/stat-card';
import { formatToBRLDateTimeShort } from '@/helpers/date';
import { useDashboardPalpites } from '@/hooks/use-dashboard-palpites';
import type {
  IDashboardPalpitesProps,
  IPartidaDashboard,
} from '@/interface/IDashboard';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Save,
  ShieldCheck,
  Timer,
  Trophy,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type React from 'react';

import {
  obterPalpitesSalvosPaginadosAction,
  obterTodosPalpitesAction,
} from '@/app/actions/palpites';
import { gerarPalpitesPDF } from '@/helpers/pdf-generator';
import { useCountdown } from '@/hooks/use-countdown';

export function DashboardPalpites({
  nomeUsuario,
  emailUsuario,
  userStatus,
  pontos,
  posicao,
  rodadas,
  historico,
  prazoLimite,
  isTudoBloqueado,
  isLiberacaoTardia = false,
  palpitesSalvosIniciais,
  totalPalpitesSalvos,
  partidasEmAndamento,
}: IDashboardPalpitesProps): React.ReactNode {
  const {
    valoresPalpites,
    isPending,
    handleInputChange,
    handleSalvar,
    handleLogout,
  } = useDashboardPalpites();

  const [palpitesSalvos, setPalpitesSalvos] = useState<IPartidaDashboard[]>(
    palpitesSalvosIniciais,
  );
  const [totalSalvos, setTotalSalvos] = useState(totalPalpitesSalvos);
  const [offset, setOffset] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleHistoryLimit, setVisibleHistoryLimit] = useState(10);

  // Sincronizar os estados locais quando as props iniciais mudarem (devido ao router.refresh())
  useEffect(() => {
    setPalpitesSalvos(palpitesSalvosIniciais);
    setTotalSalvos(totalPalpitesSalvos);
    setOffset(5);
    setVisibleHistoryLimit(10);
  }, [palpitesSalvosIniciais, totalPalpitesSalvos]);

  const handleCarregarMais = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await obterPalpitesSalvosPaginadosAction(5, offset);
      if (response.success) {
        setPalpitesSalvos((prev) => [...prev, ...response.palpites]);
        setOffset((prev) => prev + 5);
        setTotalSalvos(response.total);
      }
    } catch (error) {
      console.error('Erro ao carregar mais palpites salvos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (downloadingPDF) return;
    setDownloadingPDF(true);
    try {
      const response = await obterTodosPalpitesAction();
      if (response.success && response.palpites) {
        await gerarPalpitesPDF(
          nomeUsuario,
          emailUsuario,
          pontos,
          posicao,
          response.palpites,
        );
      } else {
        console.error('Erro ao obter palpites para PDF:', response.message);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const isUsuarioLiberado = userStatus === 'LIBERADO';
  const isInputHabilitado = isUsuarioLiberado && !isTudoBloqueado;
  const { timeLeft, mounted, isUrgent } = useCountdown(prazoLimite);

  const formatarData = (dataStr: string) => {
    return formatToBRLDateTimeShort(new Date(dataStr));
  };

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
              Meu Espaço
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gerencie seus palpites, veja seu desempenho e acompanhe seu
              histórico.
            </p>
          </div>
          <div>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-2xl transition-all shadow-sm border border-zinc-800 dark:border-zinc-200 flex items-center gap-2"
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Aviso de Conta Pendente de Liberação */}
        {!isUsuarioLiberado && (
          <div className="mb-8 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 flex items-start gap-3 animate-pulse">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">
                Conta aguardando liberação de apostas
              </h4>
              <p className="text-xs mt-1">
                Sua conta está ativa, mas você ainda não está liberado para
                registrar ou alterar palpites. Entre em contato com o
                administrador do bolão para liberar sua participação.
              </p>
            </div>
          </div>
        )}

        {/* Bento Grid de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Pontos Acumulados"
            value={`${pontos} ${pontos === 1 ? 'Ponto' : 'Pontos'}`}
            icon={Trophy}
            color="emerald"
          />
          <StatCard
            title="Posição no Ranking"
            value={`#${posicao}`}
            icon={Trophy}
            color="teal"
          />
          <StatCard
            title="Status de Palpites"
            value={
              <span
                className={`text-xl font-bold ${
                  isUsuarioLiberado
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-500'
                }`}
              >
                {isUsuarioLiberado
                  ? 'Apostas Liberadas'
                  : 'Pendente de Liberação'}
              </span>
            }
            icon={isUsuarioLiberado ? ShieldCheck : Clock}
            color={isUsuarioLiberado ? 'emerald' : 'amber'}
          />
        </div>

        {/* Countdown Banner */}
        {prazoLimite && !isTudoBloqueado && mounted && !timeLeft.isExpired && (
          <div
            className={`mb-8 p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isUrgent
                ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20'
                : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
            }`}
          >
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Timer
                className={`h-5 w-5 shrink-0 ${
                  isUrgent ? 'animate-pulse text-amber-500' : 'text-emerald-500'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  isUrgent
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isLiberacaoTardia
                  ? 'Seu prazo para palpitar termina em:'
                  : 'Prazo para palpitar termina em:'}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-bold">
              <div className="flex flex-col items-center">
                <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                  {formatNumber(timeLeft.days)}
                </span>
                <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                  d
                </span>
              </div>
              <span className="pb-3 text-zinc-300 dark:text-zinc-600">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                  h
                </span>
              </div>
              <span className="pb-3 text-zinc-300 dark:text-zinc-600">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                  m
                </span>
              </div>
              <span className="pb-3 text-zinc-300 dark:text-zinc-600">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                  s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Banner de bloqueio */}
        {isTudoBloqueado && (
          <div className="mb-8 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800/30 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-400 flex items-start gap-3">
            <Timer className="h-5 w-5 mt-0.5 shrink-0 text-zinc-500" />
            <div>
              <h4 className="font-bold text-sm">Palpites encerrados</h4>
              <p className="text-xs mt-1">
                {isLiberacaoTardia
                  ? 'Seu prazo de 30 minutos para palpitar expirou. Entre em contato com o administrador caso queira um novo prazo.'
                  : 'O prazo limite para palpitar expirou (bloqueado 30 minutos antes do início do primeiro jogo da Copa do Mundo).'}
              </p>
            </div>
          </div>
        )}

        {/* Jogos em Andamento (Ao Vivo) */}
        {partidasEmAndamento && partidasEmAndamento.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              Jogos em Andamento ({partidasEmAndamento.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partidasEmAndamento.map((partida) => (
                <div
                  key={partida.id}
                  className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 shadow-md dark:border-red-500/10 dark:bg-red-950/10 backdrop-blur-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between text-xs text-red-650 dark:text-red-455">
                    <span className="font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                      Ao Vivo
                    </span>
                    <span className="text-[11px] font-bold text-zinc-550 dark:text-zinc-400">
                      {formatarData(partida.dataInicio)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 select-none shrink-0">
                        {partida.timeAEmoji ? (
                          <FlagImage
                            emoji={partida.timeAEmoji}
                            alt={partida.timeA}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">
                            {partida.timeA.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold truncate">
                        {partida.timeA}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl font-black text-lg min-w-[36px] text-center border border-zinc-200 dark:border-zinc-800">
                        {partida.golsTimeA ?? 0}
                      </span>
                      <span className="text-zinc-400 text-xs font-bold">
                        VS
                      </span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl font-black text-lg min-w-[36px] text-center border border-zinc-200 dark:border-zinc-800">
                        {partida.golsTimeB ?? 0}
                      </span>
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-3">
                      <span className="text-sm font-bold truncate text-right">
                        {partida.timeB}
                      </span>
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 select-none shrink-0">
                        {partida.timeBEmoji ? (
                          <FlagImage
                            emoji={partida.timeBEmoji}
                            alt={partida.timeB}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">
                            {partida.timeB.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                      Seu Palpite
                    </span>
                    {partida.jaPalpitou ? (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                        {partida.palpiteGolsA} x {partida.palpiteGolsB}
                      </span>
                    ) : (
                      <span className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1 rounded-full font-bold">
                        Sem palpite
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listagem de Palpites por Rodada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1 & 2: Palpites (Pendentes e Salvos) */}
          <div className="lg:col-span-2 space-y-16">
            {rodadas.map((rodada) => {
              const partidasFuturas = rodada.partidas
                .filter((p) => {
                  return p.status !== 'FINALIZADO' && p.status !== 'FINALIZADA';
                })
                .sort((a, b) => {
                  const aFuturo = new Date(a.dataInicio) >= new Date();
                  const bFuturo = new Date(b.dataInicio) >= new Date();
                  if (aFuturo && !bFuturo) return -1;
                  if (!aFuturo && bFuturo) return 1;
                  return (
                    new Date(a.dataInicio).getTime() -
                    new Date(b.dataInicio).getTime()
                  );
                });

              const palpitesPendentes = partidasFuturas.filter(
                (p) => !p.jaPalpitou,
              );

              return (
                <div key={rodada.id}>
                  {/* Cabeçalho da Rodada */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-black tracking-tight">
                        {rodada.nome}
                      </h2>
                    </div>
                  </div>

                  {/* Palpites Pendentes */}
                  <div>
                    <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Palpites Pendentes ({palpitesPendentes.length})
                    </h3>

                    {palpitesPendentes.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-900/10">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold">Tudo em dia!</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Você já palpitou em todos os próximos jogos desta
                          rodada.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {palpitesPendentes.map((partida) => (
                          <div
                            key={partida.id}
                            className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatarData(partida.dataInicio)}
                              </span>
                              <div className="flex items-center gap-3 select-none">
                                {partida.timeAEmoji && (
                                  <FlagImage
                                    emoji={partida.timeAEmoji}
                                    alt={partida.timeA}
                                    className="h-5 w-5"
                                  />
                                )}
                                <span className="text-sm font-bold">
                                  {partida.timeA}
                                </span>
                                <span className="text-xs text-zinc-400 font-semibold">
                                  vs
                                </span>
                                {partida.timeBEmoji && (
                                  <FlagImage
                                    emoji={partida.timeBEmoji}
                                    alt={partida.timeB}
                                    className="h-5 w-5"
                                  />
                                )}
                                <span className="text-sm font-bold">
                                  {partida.timeB}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Inputs Placar */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  maxLength={2}
                                  placeholder="0"
                                  disabled={!isInputHabilitado || isPending}
                                  value={
                                    valoresPalpites[partida.id]?.golsA ?? ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      partida.id,
                                      'A',
                                      e.target.value,
                                    )
                                  }
                                  className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                />
                                <span className="text-zinc-400 font-bold">
                                  :
                                </span>
                                <input
                                  type="text"
                                  maxLength={2}
                                  placeholder="0"
                                  disabled={!isInputHabilitado || isPending}
                                  value={
                                    valoresPalpites[partida.id]?.golsB ?? ''
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      partida.id,
                                      'B',
                                      e.target.value,
                                    )
                                  }
                                  className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                />
                              </div>

                              {/* Botão Salvar */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  disabled={!isInputHabilitado || isPending}
                                  onClick={() =>
                                    handleSalvar(partida.id, partida)
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 h-10 rounded-xl flex items-center gap-1.5 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 disabled:opacity-50"
                                >
                                  <Save className="h-4 w-4" />
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Meus Palpites Salvos — lista única */}
            <div>
              <h2 className="text-lg font-black tracking-tight mb-4">
                Meus Palpites Salvos ({totalSalvos})
              </h2>

              {palpitesSalvos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600">
                  <p className="text-xs">
                    Nenhum palpite salvo para os próximos jogos.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {palpitesSalvos.map((partida) => {
                    const novosValores = valoresPalpites[partida.id];
                    const golsA =
                      novosValores?.golsA ?? String(partida.palpiteGolsA ?? '');
                    const golsB =
                      novosValores?.golsB ?? String(partida.palpiteGolsB ?? '');

                    return (
                      <div
                        key={partida.id}
                        className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatarData(partida.dataInicio)}
                          </span>
                          {partida.rodadaNome && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full self-start">
                              {partida.rodadaNome}
                            </span>
                          )}
                          <div className="flex items-center gap-3 select-none">
                            {partida.timeAEmoji && (
                              <FlagImage
                                emoji={partida.timeAEmoji}
                                alt={partida.timeA}
                                className="h-5 w-5"
                              />
                            )}
                            <span className="text-sm font-bold">
                              {partida.timeA}
                            </span>
                            <span className="text-xs text-zinc-400 font-semibold">
                              vs
                            </span>
                            {partida.timeBEmoji && (
                              <FlagImage
                                emoji={partida.timeBEmoji}
                                alt={partida.timeB}
                                className="h-5 w-5"
                              />
                            )}
                            <span className="text-sm font-bold">
                              {partida.timeB}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Inputs Placar */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={2}
                              disabled={!isInputHabilitado || isPending}
                              value={golsA}
                              onChange={(e) =>
                                handleInputChange(
                                  partida.id,
                                  'A',
                                  e.target.value,
                                )
                              }
                              className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                            />
                            <span className="text-zinc-400 font-bold">:</span>
                            <input
                              type="text"
                              maxLength={2}
                              disabled={!isInputHabilitado || isPending}
                              value={golsB}
                              onChange={(e) =>
                                handleInputChange(
                                  partida.id,
                                  'B',
                                  e.target.value,
                                )
                              }
                              className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                            />
                          </div>

                          {/* Botão Alterar */}
                          <Button
                            size="sm"
                            disabled={!isInputHabilitado || isPending}
                            onClick={() => handleSalvar(partida.id, partida)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 h-10 rounded-xl flex items-center gap-1.5 transition-all dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            Alterar
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botão Veja Mais */}
                  {palpitesSalvos.length < totalSalvos && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={handleCarregarMais}
                        disabled={loadingMore}
                        className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm px-6 py-2 rounded-2xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            Carregando...
                          </>
                        ) : (
                          'Veja Mais'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coluna 3: Histórico de Palpites (Partidas Finalizadas) */}
          <div className="space-y-6">
            <h3 className="text-md font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-500" />
              Histórico de Palpites
            </h3>

            {historico.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-500 text-xs">
                Nenhum palpite concluído encontrado. Os placares oficiais dos
                jogos ainda não foram lançados.
              </div>
            ) : (
              <div className="space-y-4">
                {historico.slice(0, visibleHistoryLimit).map((item) => (
                  <div
                    key={item.partidaId}
                    className={`rounded-3xl border p-5 shadow-sm flex flex-col gap-3 transition-all ${
                      item.status === 'EM_ANDAMENTO' ||
                      item.status === 'INICIADO'
                        ? 'border-red-500/20 bg-red-500/5 dark:border-red-500/10 dark:bg-red-950/5'
                        : 'border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        {formatarData(item.dataInicio)}
                      </span>
                      {item.status === 'EM_ANDAMENTO' ||
                      item.status === 'INICIADO' ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 flex items-center gap-1 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                          Ao Vivo
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            item.pontosGanhos > 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400'
                          }`}
                        >
                          {item.pontosGanhos > 0
                            ? `+${item.pontosGanhos} ${item.pontosGanhos === 1 ? 'Ponto' : 'Pontos'}`
                            : '0 Pontos'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        {item.status === 'EM_ANDAMENTO' ||
                        item.status === 'INICIADO'
                          ? 'Placar Ao Vivo'
                          : 'Placar Oficial'}
                      </span>
                      <div className="flex items-center gap-2 select-none">
                        {item.timeAEmoji && (
                          <FlagImage
                            emoji={item.timeAEmoji}
                            alt={item.timeA}
                            className="h-4 w-4"
                          />
                        )}
                        <span className="text-xs font-bold">{item.timeA}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-xs">
                          {item.placarOficialA}
                        </span>
                        <span className="text-zinc-400">:</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-xs">
                          {item.placarOficialB}
                        </span>
                        {item.timeBEmoji && (
                          <FlagImage
                            emoji={item.timeBEmoji}
                            alt={item.timeB}
                            className="h-4 w-4"
                          />
                        )}
                        <span className="text-xs font-bold">{item.timeB}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        Seu Palpite
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                          {item.palpiteA} x {item.palpiteB}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {historico.length > visibleHistoryLimit && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() =>
                        setVisibleHistoryLimit((prev) => prev + 10)
                      }
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs px-4 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2"
                    >
                      Visualizar mais
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
