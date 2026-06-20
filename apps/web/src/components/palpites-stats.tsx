'use client';

import { useEffect, useMemo, useState } from 'react';

import { useQueryPalpitesStats } from '@/hooks/queries/useQueryPalpitesStats';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Search,
  Users,
  X,
} from 'lucide-react';

import type { IPalpiteIndividual, IPartidaStats } from '@/interface/IPalpite';

type StatusFilter = 'TODOS' | 'PENDENTES' | 'FINALIZADOS';
type VotoFilter = 'TOTAL' | 'VITORIA_A' | 'EMPATE' | 'VITORIA_B';

export function PalpitesStats({ nomeUsuario }: { nomeUsuario: string | null }) {
  const [search, setSearch] = useState('');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDENTES');
  const [visibleLimit, setVisibleLimit] = useState(6);

  const [modalMatch, setModalMatch] = useState<IPartidaStats | null>(null);
  const [modalFilter, setModalFilter] = useState<VotoFilter>('TOTAL');

  const {
    data: matches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQueryPalpitesStats();

  useEffect(() => {
    setVisibleLimit(6);
  }, [search, statusFilter]);

  const sortedMatches = useMemo(() => {
    const active = matches.filter(
      (m) => m.status !== 'FINALIZADO' && m.status !== 'FINALIZADA',
    );
    const completed = matches.filter(
      (m) => m.status === 'FINALIZADO' || m.status === 'FINALIZADA',
    );

    active.sort(
      (a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
    );
    completed.sort(
      (a, b) =>
        new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
    );

    return [...active, ...completed];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let filtered = sortedMatches;

    if (statusFilter === 'PENDENTES') {
      filtered = filtered.filter(
        (m) => m.status !== 'FINALIZADO' && m.status !== 'FINALIZADA',
      );
    } else if (statusFilter === 'FINALIZADOS') {
      filtered = filtered.filter(
        (m) => m.status === 'FINALIZADO' || m.status === 'FINALIZADA',
      );
    }

    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.timeA.toLowerCase().includes(search.toLowerCase()) ||
          m.timeB.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return filtered;
  }, [sortedMatches, statusFilter, search]);

  const visibleMatches = useMemo(() => {
    return filteredMatches.slice(0, visibleLimit);
  }, [filteredMatches, visibleLimit]);

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId((prev) => (prev === matchId ? null : matchId));
  };

  const openVoteModal = (match: IPartidaStats, filter: VotoFilter) => {
    setModalMatch(match);
    setModalFilter(filter);
  };

  const filteredVotes = useMemo(() => {
    if (!modalMatch) return [];
    let votes = modalMatch.palpitesIndividuais;
    switch (modalFilter) {
      case 'VITORIA_A':
        votes = votes.filter((v) => v.golsTimeA > v.golsTimeB);
        break;
      case 'EMPATE':
        votes = votes.filter((v) => v.golsTimeA === v.golsTimeB);
        break;
      case 'VITORIA_B':
        votes = votes.filter((v) => v.golsTimeB > v.golsTimeA);
        break;
    }
    return votes;
  }, [modalMatch, modalFilter]);

  const getStatusLabel = (status: string, dataInicioStr: string) => {
    if (status === 'FINALIZADO' || status === 'FINALIZADA') {
      return {
        label: 'Encerrado',
        styles: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
      };
    }

    const dataInicio = new Date(dataInicioStr);
    const agora = new Date();
    const diffMs = agora.getTime() - dataInicio.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 0) {
      return {
        label: 'Agendado',
        styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    }

    if (diffMinutes >= 115) {
      return {
        label: 'Calculando Encerramento',
        styles:
          'bg-purple-500/10 text-purple-500 dark:text-purple-400 animate-pulse',
      };
    }

    return {
      label: 'Em Andamento',
      styles: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 animate-pulse',
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Carregando as estatísticas coletivas...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <div className="rounded-full bg-red-50 dark:bg-red-950/20 p-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Erro ao carregar estatísticas
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 font-semibold rounded-lg text-sm transition-all"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrar jogos pelo nome de uma seleção..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="flex gap-2">
          {(['TODOS', 'PENDENTES', 'FINALIZADOS'] as StatusFilter[]).map(
            (opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === opt
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {opt === 'TODOS'
                  ? 'Todos'
                  : opt === 'PENDENTES'
                    ? 'Pendentes'
                    : 'Finalizados'}
              </button>
            ),
          )}
        </div>
      </div>

      {visibleMatches.length > 0 ? (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {visibleMatches.map((match) => {
              const statusInfo = getStatusLabel(match.status, match.dataInicio);
              const isExpanded = expandedMatchId === match.id;

              return (
                <div
                  key={match.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {match.rodadaNome}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusInfo.styles}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                      <div className="w-[42%] text-right font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                        {match.timeA}
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-lg font-black text-zinc-900 dark:text-zinc-50">
                        <span>
                          {match.golsTimeA !== null ? match.golsTimeA : '-'}
                        </span>
                        <span className="text-zinc-350 dark:text-zinc-600">
                          x
                        </span>
                        <span>
                          {match.golsTimeB !== null ? match.golsTimeB : '-'}
                        </span>
                      </div>
                      <div className="w-[42%] text-left font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                        {match.timeB}
                      </div>
                    </div>

                    <div className="space-y-3.5 mb-4">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-emerald-500" />
                          Estatísticas Coletivas
                        </span>
                        <button
                          type="button"
                          onClick={() => openVoteModal(match, 'TOTAL')}
                          className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5" />
                          {match.estatisticas.total} palpites
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                          <span>Vitória {match.timeA}</span>
                          <button
                            type="button"
                            onClick={() => openVoteModal(match, 'VITORIA_A')}
                            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {match.estatisticas.pctVitoriasA}% (
                            {match.estatisticas.vitoriasA})
                          </button>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${match.estatisticas.pctVitoriasA}%`,
                            }}
                            className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                          <span>Empate</span>
                          <button
                            type="button"
                            onClick={() => openVoteModal(match, 'EMPATE')}
                            className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            {match.estatisticas.pctEmpates}% (
                            {match.estatisticas.empates})
                          </button>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${match.estatisticas.pctEmpates}%`,
                            }}
                            className="h-full bg-zinc-400 dark:bg-zinc-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                          <span>Vitória {match.timeB}</span>
                          <button
                            type="button"
                            onClick={() => openVoteModal(match, 'VITORIA_B')}
                            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                          >
                            {match.estatisticas.pctVitoriasB}% (
                            {match.estatisticas.vitoriasB})
                          </button>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${match.estatisticas.pctVitoriasB}%`,
                            }}
                            className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(match.id)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Ocultar palpites individuais
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Ver palpites individuais
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-xs space-y-3 transition-all animate-in fade-in slide-in-from-top-1 duration-200">
                        {match.palpitesIndividuaisLiberados ? (
                          match.palpitesIndividuais.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-250 dark:scrollbar-thumb-zinc-800">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="pb-2">Palpiteiro</th>
                                    <th className="pb-2 text-right pr-4">
                                      Placar
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                  {[...match.palpitesIndividuais]
                                    .sort((a, b) => {
                                      if (a.usuarioNome === nomeUsuario)
                                        return -1;
                                      if (b.usuarioNome === nomeUsuario)
                                        return 1;
                                      return 0;
                                    })
                                    .map((palpite) => {
                                      const isCurrentUser =
                                        palpite.usuarioNome === nomeUsuario;
                                      return (
                                        <tr
                                          key={palpite.id}
                                          className={`${
                                            isCurrentUser
                                              ? 'bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-800'
                                              : 'hover:bg-zinc-100/30'
                                          }`}
                                        >
                                          <td className="py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                                            {palpite.usuarioNome}
                                          </td>
                                          <td className="py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm pr-4">
                                            {palpite.golsTimeA} x{' '}
                                            {palpite.golsTimeB}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-zinc-400 text-center py-2">
                              Nenhum palpite registrado para este jogo.
                            </p>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-3 space-y-2">
                            <Lock className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                              Bloqueado por Segurança
                            </p>
                            <p className="text-zinc-400 text-[10px] leading-relaxed max-w-[280px]">
                              Os palpites individuais ficam ocultos até o
                              horário de início da partida (
                              {formatDate(match.dataInicio)}) para manter a
                              integridade da competição.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMatches.length > visibleLimit && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 6)}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm rounded-2xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 cursor-pointer"
              >
                Visualizar mais
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Calendar className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-semibold mt-4">
            Nenhuma partida encontrada
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Não existem jogos correspondentes aos seus filtros.
          </p>
        </div>
      )}

      {/* Modal de Votação */}
      {modalMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setModalMatch(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold">
                  {modalMatch.timeA} x {modalMatch.timeB}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {modalFilter === 'TOTAL'
                    ? 'Todos os palpites'
                    : modalFilter === 'VITORIA_A'
                      ? `Palpites para vitória de ${modalMatch.timeA}`
                      : modalFilter === 'EMPATE'
                        ? 'Palpites para empate'
                        : `Palpites para vitória de ${modalMatch.timeB}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMatch(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredVotes.length === 0 ? (
                <p className="text-center text-zinc-400 text-xs py-8">
                  Nenhum palpite registrado para esta opção.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredVotes.map((voto) => (
                    <div
                      key={voto.id}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                        voto.usuarioNome === nomeUsuario
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-200 dark:ring-emerald-800'
                          : 'bg-zinc-50 dark:bg-zinc-800/40'
                      }`}
                    >
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {voto.usuarioNome}
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {voto.golsTimeA} x {voto.golsTimeB}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-center text-[10px] text-zinc-400">
              {filteredVotes.length}{' '}
              {filteredVotes.length === 1 ? 'palpite' : 'palpites'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
