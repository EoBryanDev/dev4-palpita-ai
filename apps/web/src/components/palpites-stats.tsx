'use client';

import { useMemo, useState } from 'react';

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
} from 'lucide-react';

import type { IPalpiteIndividual, IPartidaStats } from '@/interface/IPalpite';

export function PalpitesStats() {
  const [search, setSearch] = useState('');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const {
    data: matches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQueryPalpitesStats();

  const filteredMatches = useMemo(() => {
    return matches.filter(
      (m) =>
        m.timeA.toLowerCase().includes(search.toLowerCase()) ||
        m.timeB.toLowerCase().includes(search.toLowerCase()),
    );
  }, [matches, search]);

  const toggleExpand = (matchId: string) => {
    setExpandedMatchId((prev) => (prev === matchId ? null : matchId));
  };

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
      {/* Barra de Busca */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Filtrar jogos pelo nome de uma seleção..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {filteredMatches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredMatches.map((match) => {
            const statusInfo = getStatusLabel(match.status, match.dataInicio);
            const isExpanded = expandedMatchId === match.id;

            return (
              <div
                key={match.id}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40 p-6 shadow-md hover:shadow-lg transition-all"
              >
                {/* Header do Jogo */}
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

                  {/* Times e Placar */}
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

                  {/* Estatísticas Coletivas */}
                  <div className="space-y-3.5 mb-4">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        Estatísticas Coletivas
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {match.estatisticas.total} palpites
                      </span>
                    </div>

                    {/* Barra de Progresso Vitória A */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Vitória {match.timeA}</span>
                        <span>
                          {match.estatisticas.pctVitoriasA}% (
                          {match.estatisticas.vitoriasA})
                        </span>
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

                    {/* Barra de Progresso Empate */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Empate</span>
                        <span>
                          {match.estatisticas.pctEmpates}% (
                          {match.estatisticas.empates})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${match.estatisticas.pctEmpates}%` }}
                          className="h-full bg-zinc-400 dark:bg-zinc-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Barra de Progresso Vitória B */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Vitória {match.timeB}</span>
                        <span>
                          {match.estatisticas.pctVitoriasB}% (
                          {match.estatisticas.vitoriasB})
                        </span>
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

                {/* Seção Expansível de Palpites Individuais */}
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
                                {match.palpitesIndividuais.map((palpite) => (
                                  <tr
                                    key={palpite.id}
                                    className="hover:bg-zinc-100/30"
                                  >
                                    <td className="py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                                      {palpite.usuarioNome}
                                    </td>
                                    <td className="py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm pr-4">
                                      {palpite.golsTimeA} x {palpite.golsTimeB}
                                    </td>
                                  </tr>
                                ))}
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
                            Os palpites individuais ficam ocultos até o horário
                            de início da partida ({formatDate(match.dataInicio)}
                            ) para manter a integridade da competição.
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
    </div>
  );
}
