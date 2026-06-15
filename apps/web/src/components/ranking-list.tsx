'use client';

import { useMemo, useState } from 'react';

import { useQueryRanking } from '@/hooks/queries/useQueryRanking';
import { AlertCircle, Loader2, Medal, Search, Trophy } from 'lucide-react';

export function RankingList() {
  const [search, setSearch] = useState('');

  const {
    data: ranking = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQueryRanking();

  const filteredRanking = useMemo(() => {
    return ranking.filter((user) =>
      user.nome.toLowerCase().includes(search.toLowerCase()),
    );
  }, [ranking, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Carregando a classificação geral...
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
            Erro ao carregar ranking
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

  // Separar o pódio (3 primeiros)
  const podiumUsers = ranking.slice(0, 3);
  const tableUsers = filteredRanking;
  const todasPontuacoesZeradas =
    ranking.length === 0 || ranking.every((user) => user.pontos === 0);

  return (
    <div className="space-y-8">
      {/* Banner de status quando a competição ainda não iniciou */}
      {todasPontuacoesZeradas && search === '' && (
        <div className="rounded-3xl border border-zinc-200 bg-white/60 p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 p-4 text-emerald-600 dark:text-emerald-400 animate-pulse">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Aguardando competição iniciar
            </h3>
            <p className="text-sm text-zinc-505 dark:text-zinc-400 mt-2 max-w-md">
              Os palpites já estão abertos! A classificação e o pódio serão
              ativados assim que as primeiras partidas forem finalizadas e os
              pontos forem computados.
            </p>
          </div>
        </div>
      )}

      {/* Visualização do Pódio (Top 3) */}
      {!todasPontuacoesZeradas && podiumUsers.length > 0 && search === '' && (
        <div className="grid gap-6 md:grid-cols-3 items-end max-w-4xl mx-auto pt-6">
          {/* Segundo Lugar */}
          {podiumUsers[1] && (
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="relative w-full rounded-2xl border border-zinc-200 bg-white/60 p-6 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm md:h-40 flex flex-col justify-center items-center">
                <div className="absolute -top-6 rounded-full bg-zinc-200 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 w-12 h-12 flex items-center justify-center shadow-md">
                  <Medal className="h-6 w-6" />
                </div>
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider mt-2">
                  2º Lugar
                </span>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate max-w-full">
                  {podiumUsers[1].nome}
                </h3>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {podiumUsers[1].pontos}{' '}
                  <span className="text-sm font-normal text-zinc-400">PTS</span>
                </span>
              </div>
            </div>
          )}

          {/* Primeiro Lugar */}
          {podiumUsers[0] && (
            <div className="order-1 md:order-2 flex flex-col items-center scale-105">
              <div className="relative w-full rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-6 text-center shadow-2xl dark:border-amber-500/20 dark:bg-amber-950/10 backdrop-blur-sm md:h-48 flex flex-col justify-center items-center">
                <div className="absolute -top-8 rounded-full bg-amber-400 p-3 text-amber-950 w-16 h-16 flex items-center justify-center shadow-lg animate-pulse">
                  <Trophy className="h-8 w-8" />
                </div>
                <span className="text-xs uppercase font-extrabold text-amber-600 dark:text-amber-400 tracking-widest mt-4">
                  Campeão
                </span>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 truncate max-w-full">
                  {podiumUsers[0].nome}
                </h3>
                <span className="text-3xl font-black text-emerald-650 dark:text-emerald-400 mt-1">
                  {podiumUsers[0].pontos}{' '}
                  <span className="text-sm font-normal text-zinc-400">PTS</span>
                </span>
              </div>
            </div>
          )}

          {/* Terceiro Lugar */}
          {podiumUsers[2] && (
            <div className="order-3 flex flex-col items-center">
              <div className="relative w-full rounded-2xl border border-zinc-200 bg-white/60 p-6 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 backdrop-blur-sm md:h-36 flex flex-col justify-center items-center">
                <div className="absolute -top-6 rounded-full bg-orange-200 p-2 text-orange-850 dark:bg-orange-950 dark:text-orange-350 w-12 h-12 flex items-center justify-center shadow-md">
                  <Medal className="h-6 w-6" />
                </div>
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider mt-2">
                  3º Lugar
                </span>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate max-w-full">
                  {podiumUsers[2].nome}
                </h3>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {podiumUsers[2].pontos}{' '}
                  <span className="text-sm font-normal text-zinc-400">PTS</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barra de Busca */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar participante pelo nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {/* Leaderboard Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
        {tableUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4 w-20 text-center">
                    Pos
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Participante
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">
                    Jogos Pontuados
                  </th>
                  <th scope="col" className="px-6 py-4 text-center">
                    Placares Exatos
                  </th>
                  <th scope="col" className="px-6 py-4 text-right pr-12">
                    Pontuação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tableUsers.map((user) => {
                  const isTop3 = user.posicaoGrupo <= 3;
                  const rankColors =
                    user.posicaoGrupo === 1
                      ? 'text-amber-500 dark:text-amber-400'
                      : user.posicaoGrupo === 2
                        ? 'text-zinc-400 dark:text-zinc-300'
                        : user.posicaoGrupo === 3
                          ? 'text-orange-550 dark:text-orange-400'
                          : 'text-zinc-500';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all"
                    >
                      <td className="px-6 py-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center rounded-full w-7 h-7 text-xs ${
                            isTop3 && !todasPontuacoesZeradas
                              ? `bg-zinc-100 dark:bg-zinc-800 ${rankColors}`
                              : 'text-zinc-400'
                          }`}
                        >
                          {todasPontuacoesZeradas ? '-' : `${user.posicao}º`}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.nome}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-zinc-600 dark:text-zinc-350">
                        {user.jogosPontuados}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-zinc-600 dark:text-zinc-350">
                        {user.palpitesCerteiros}
                      </td>
                      <td className="px-6 py-4 text-right pr-12 font-black text-emerald-600 dark:text-emerald-400 text-lg">
                        {user.pontos}{' '}
                        <span className="text-[10px] font-normal text-zinc-400">
                          PTS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-2">
            <Trophy className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Nenhum participante encontrado
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Não encontramos resultados correspondentes a "{search}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
