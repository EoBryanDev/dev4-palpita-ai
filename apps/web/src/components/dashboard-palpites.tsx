'use client';

import { logoutUsuario } from '@/app/actions/auth';
import { salvarPalpite } from '@/app/actions/palpites';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  ShieldCheck,
  Trophy,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState, useTransition } from 'react';

export interface IPartidaDashboard {
  id: string;
  timeA: string;
  timeB: string;
  dataInicio: string;
  status: string;
  golsTimeA?: number | null;
  golsTimeB?: number | null;
  palpiteGolsA?: number | null;
  palpiteGolsB?: number | null;
  jaPalpitou: boolean;
}

export interface IHistoricoDashboard {
  partidaId: string;
  timeA: string;
  timeB: string;
  placarOficialA: number;
  placarOficialB: number;
  palpiteA: number;
  palpiteB: number;
  pontosGanhos: number;
  dataInicio: string;
}

interface IDashboardPalpitesProps {
  nomeUsuario: string;
  emailUsuario: string;
  cargoUsuario: string;
  userStatus: string;
  pontos: number;
  posicao: number;
  nomeRodada: string;
  partidas: IPartidaDashboard[];
  historico: IHistoricoDashboard[];
}

export function DashboardPalpites({
  nomeUsuario,
  emailUsuario,
  cargoUsuario,
  userStatus,
  pontos,
  posicao,
  nomeRodada,
  partidas,
  historico,
}: IDashboardPalpitesProps): React.ReactNode {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logoutPending, startLogout] = useTransition();

  // Estado para armazenar os valores temporários digitados nos inputs de palpites
  const [valoresPalpites, setValoresPalpites] = useState<
    Record<string, { golsA: string; golsB: string }>
  >({});

  // Mensagens de feedback por partida
  const [feedbacks, setFeedbacks] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

  const isUsuarioLiberado = userStatus === 'LIBERADO';

  const handleInputChange = (
    partidaId: string,
    time: 'A' | 'B',
    value: string,
  ) => {
    // Apenas números inteiros positivos ou string vazia
    if (value !== '' && !/^\d+$/.test(value)) return;

    setValoresPalpites((prev) => {
      const atual = prev[partidaId] || { golsA: '', golsB: '' };
      return {
        ...prev,
        [partidaId]: {
          ...atual,
          golsA: time === 'A' ? value : atual.golsA,
          golsB: time === 'B' ? value : atual.golsB,
        },
      };
    });
  };

  const handleSalvar = (partidaId: string, partida: IPartidaDashboard) => {
    const valores = valoresPalpites[partidaId];
    // Se não digitou novos valores, usa o palpite anterior ou assume 0
    const golsAStr = valores?.golsA ?? String(partida.palpiteGolsA ?? '');
    const golsBStr = valores?.golsB ?? String(partida.palpiteGolsB ?? '');

    if (golsAStr === '' || golsBStr === '') {
      setFeedbacks((prev) => ({
        ...prev,
        [partidaId]: {
          success: false,
          message: 'Preencha ambos os placares para salvar.',
        },
      }));
      return;
    }

    const golsA = Number.parseInt(golsAStr, 10);
    const golsB = Number.parseInt(golsBStr, 10);

    setFeedbacks((prev) => ({
      ...prev,
      [partidaId]: { success: false, message: '' },
    }));

    startTransition(async () => {
      const result = await salvarPalpite(partidaId, golsA, golsB);
      setFeedbacks((prev) => ({
        ...prev,
        [partidaId]: {
          success: result.success,
          message: result.message,
        },
      }));

      if (result.success) {
        // Recarregar os dados do servidor para atualizar o dashboard
        router.refresh();
      }
    });
  };

  const handleLogout = () => {
    startLogout(async () => {
      await logoutUsuario();
      router.push('/login');
      router.refresh();
    });
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtragem de partidas da rodada
  const partidasFuturas = partidas.filter((p) => {
    const dataInicio = new Date(p.dataInicio);
    return dataInicio > new Date() && p.status !== 'FINALIZADO';
  });

  const palpitesPendentes = partidasFuturas.filter((p) => !p.jaPalpitou);
  const palpitesSalvos = partidasFuturas.filter((p) => p.jaPalpitou);

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-16">
      {/* Header do Painel */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 dark:from-emerald-500 dark:to-teal-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400">
                PALPITA AI
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                Competidor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-bold">{nomeUsuario}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {emailUsuario}
              </span>
            </div>
            {cargoUsuario === 'ADMIN' && (
              <Button
                variant="outline"
                className="text-xs font-bold border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={() => router.push('/admin/usuarios')}
              >
                Painel Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={logoutPending}
              title="Sair"
              className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* Aviso de Conta Pendente de Liberação (RN05) */}
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
          {/* Card Pontos */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Pontos Acumulados
                </span>
                <span className="text-3xl font-black">
                  {pontos} {pontos === 1 ? 'Ponto' : 'Pontos'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Classificação */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Posição no Ranking
                </span>
                <span className="text-3xl font-black">#{posicao}</span>
              </div>
            </div>
          </div>

          {/* Card Status da Conta */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isUsuarioLiberado
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isUsuarioLiberado ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Status de Palpites
                </span>
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
              </div>
            </div>
          </div>
        </div>

        {/* Rodada Selecionada */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">{nomeRodada}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Preencha seus placares para os próximos jogos da rodada.
            </p>
          </div>
        </div>

        {/* Listagem de Palpites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1 & 2: Palpites (Pendentes e Salvos) */}
          <div className="lg:col-span-2 space-y-10">
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
                    Você já palpitou em todos os próximos jogos desta rodada.
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
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">
                            {partida.timeA}
                          </span>
                          <span className="text-xs text-zinc-400">vs</span>
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
                            disabled={!isUsuarioLiberado || isPending}
                            value={valoresPalpites[partida.id]?.golsA ?? ''}
                            onChange={(e) =>
                              handleInputChange(partida.id, 'A', e.target.value)
                            }
                            className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50"
                          />
                          <span className="text-zinc-400 font-bold">:</span>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="0"
                            disabled={!isUsuarioLiberado || isPending}
                            value={valoresPalpites[partida.id]?.golsB ?? ''}
                            onChange={(e) =>
                              handleInputChange(partida.id, 'B', e.target.value)
                            }
                            className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50"
                          />
                        </div>

                        {/* Botão Salvar */}
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            disabled={!isUsuarioLiberado || isPending}
                            onClick={() => handleSalvar(partida.id, partida)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 h-10 rounded-xl flex items-center gap-1.5 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            Salvar
                          </Button>
                        </div>
                      </div>

                      {/* Feedbacks de validação/sucesso */}
                      {feedbacks[partida.id]?.message && (
                        <div
                          className={`text-xs font-semibold w-full md:w-auto ${
                            feedbacks[partida.id].success
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-500'
                          } flex items-center gap-1 md:mt-0`}
                        >
                          {feedbacks[partida.id].success ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                          )}
                          <span>{feedbacks[partida.id].message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Palpites Salvos */}
            <div>
              <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Meus Palpites Salvos ({palpitesSalvos.length})
              </h3>

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
                        className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatarData(partida.dataInicio)}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">
                              {partida.timeA}
                            </span>
                            <span className="text-xs text-zinc-400">vs</span>
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
                              disabled={!isUsuarioLiberado || isPending}
                              value={golsA}
                              onChange={(e) =>
                                handleInputChange(
                                  partida.id,
                                  'A',
                                  e.target.value,
                                )
                              }
                              className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50"
                            />
                            <span className="text-zinc-400 font-bold">:</span>
                            <input
                              type="text"
                              maxLength={2}
                              disabled={!isUsuarioLiberado || isPending}
                              value={golsB}
                              onChange={(e) =>
                                handleInputChange(
                                  partida.id,
                                  'B',
                                  e.target.value,
                                )
                              }
                              className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50 dark:bg-zinc-900/60 disabled:opacity-50"
                            />
                          </div>

                          {/* Botão Alterar */}
                          <Button
                            size="sm"
                            disabled={!isUsuarioLiberado || isPending}
                            onClick={() => handleSalvar(partida.id, partida)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 h-10 rounded-xl flex items-center gap-1.5 transition-all dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            Alterar
                          </Button>
                        </div>

                        {/* Feedbacks de validação/sucesso */}
                        {feedbacks[partida.id]?.message && (
                          <div
                            className={`text-xs font-semibold w-full md:w-auto ${
                              feedbacks[partida.id].success
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-500'
                            } flex items-center gap-1 md:mt-0`}
                          >
                            {feedbacks[partida.id].success ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span>{feedbacks[partida.id].message}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                {historico.map((item) => (
                  <div
                    key={item.partidaId}
                    className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                        {formatarData(item.dataInicio)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.pontosGanhos > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400'
                        }`}
                      >
                        {item.pontosGanhos > 0
                          ? `+${item.pontosGanhos} Ponto`
                          : '0 Pontos'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        Placar Oficial
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{item.timeA}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-sm">
                          {item.placarOficialA}
                        </span>
                        <span className="text-zinc-400">:</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-sm">
                          {item.placarOficialB}
                        </span>
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
