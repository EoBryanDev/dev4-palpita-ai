'use client';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { formatToBRLDateTimeShort } from '@/helpers/date';
import { useDashboardPalpites } from '@/hooks/use-dashboard-palpites';
import type {
  IDashboardPalpitesProps,
  IHistoricoDashboard,
  IPartidaDashboard,
} from '@/interface/IDashboard';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  ShieldCheck,
  Trophy,
  User,
} from 'lucide-react';
import type React from 'react';

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
  const {
    valoresPalpites,
    isPending,
    logoutPending,
    handleInputChange,
    handleSalvar,
    handleLogout,
  } = useDashboardPalpites();

  const isUsuarioLiberado = userStatus === 'LIBERADO';

  const formatarData = (dataStr: string) => {
    return formatToBRLDateTimeShort(new Date(dataStr));
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
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
                          {partida.timeAEmoji && (
                            <span className="text-base">
                              {partida.timeAEmoji}
                            </span>
                          )}
                          <span className="text-sm font-bold">
                            {partida.timeA}
                          </span>
                          <span className="text-xs text-zinc-400">vs</span>
                          {partida.timeBEmoji && (
                            <span className="text-base">
                              {partida.timeBEmoji}
                            </span>
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
                            {partida.timeAEmoji && (
                              <span className="text-base">
                                {partida.timeAEmoji}
                              </span>
                            )}
                            <span className="text-sm font-bold">
                              {partida.timeA}
                            </span>
                            <span className="text-xs text-zinc-400">vs</span>
                            {partida.timeBEmoji && (
                              <span className="text-base">
                                {partida.timeBEmoji}
                              </span>
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
                        {item.timeAEmoji && (
                          <span className="text-base">{item.timeAEmoji}</span>
                        )}
                        <span className="text-xs font-bold">{item.timeA}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-sm">
                          {item.placarOficialA}
                        </span>
                        <span className="text-zinc-400">:</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-black text-sm">
                          {item.placarOficialB}
                        </span>
                        {item.timeBEmoji && (
                          <span className="text-base">{item.timeBEmoji}</span>
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
