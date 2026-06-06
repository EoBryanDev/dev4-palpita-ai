'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Filter, Globe, Search, Trophy } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import type { ITimesClientProps } from '@/interface/ITimes';

const DETALHES_EXTRAS: Record<
  string,
  { titulos: number; destaque: string; rankingFifa: number }
> = {
  México: { titulos: 0, destaque: 'Santiago Giménez', rankingFifa: 15 },
  'África do Sul': { titulos: 0, destaque: 'Percy Tau', rankingFifa: 59 },
  'Coreia do Sul': { titulos: 0, destaque: 'Heung-min Son', rankingFifa: 22 },
  'República Tcheca': {
    titulos: 0,
    destaque: 'Patrik Schick',
    rankingFifa: 36,
  },
  Canadá: { titulos: 0, destaque: 'Alphonso Davies', rankingFifa: 49 },
  Bósnia: { titulos: 0, destaque: 'Edin Džeko', rankingFifa: 74 },
  Catar: { titulos: 0, destaque: 'Akram Afif', rankingFifa: 34 },
  Suíça: { titulos: 0, destaque: 'Granit Xhaka', rankingFifa: 19 },
  Brasil: { titulos: 5, destaque: 'Vinícius Jr.', rankingFifa: 5 },
  Marrocos: { titulos: 0, destaque: 'Achraf Hakimi', rankingFifa: 13 },
  Haiti: { titulos: 0, destaque: 'Duckens Nazon', rankingFifa: 86 },
  Escócia: { titulos: 0, destaque: 'Andrew Robertson', rankingFifa: 39 },
  'Estados Unidos': {
    titulos: 0,
    destaque: 'Christian Pulisic',
    rankingFifa: 11,
  },
  Paraguai: { titulos: 0, destaque: 'Julio Enciso', rankingFifa: 56 },
  Austrália: { titulos: 0, destaque: 'Harry Souttar', rankingFifa: 25 },
  Turquia: { titulos: 0, destaque: 'Hakan Çalhanoğlu', rankingFifa: 35 },
  Alemanha: { titulos: 4, destaque: 'Jamal Musiala', rankingFifa: 16 },
  Curaçao: { titulos: 0, destaque: 'Juninho Bacuna', rankingFifa: 90 },
  'Costa do Marfim': {
    titulos: 0,
    destaque: 'Sébastien Haller',
    rankingFifa: 38,
  },
  Equador: { titulos: 0, destaque: 'Moises Caicedo', rankingFifa: 31 },
  Holanda: { titulos: 0, destaque: 'Virgil van Dijk', rankingFifa: 7 },
  Japão: { titulos: 0, destaque: 'Kaoru Mitoma', rankingFifa: 18 },
  Suécia: { titulos: 0, destaque: 'Alexander Isak', rankingFifa: 26 },
  Tunísia: { titulos: 0, destaque: 'Youssef Msakni', rankingFifa: 41 },
  Bélgica: { titulos: 0, destaque: 'Kevin De Bruyne', rankingFifa: 4 },
  Egito: { titulos: 0, destaque: 'Mohamed Salah', rankingFifa: 37 },
  Irã: { titulos: 0, destaque: 'Mehdi Taremi', rankingFifa: 20 },
  'Nova Zelândia': { titulos: 0, destaque: 'Chris Wood', rankingFifa: 85 },
  Espanha: { titulos: 1, destaque: 'Lamine Yamal', rankingFifa: 8 },
  'Cabo Verde': { titulos: 0, destaque: 'Ryan Mendes', rankingFifa: 65 },
  'Arábia Saudita': {
    titulos: 0,
    destaque: 'Salem Al-Dawsari',
    rankingFifa: 53,
  },
  Uruguai: { titulos: 2, destaque: 'Federico Valverde', rankingFifa: 12 },
  França: { titulos: 2, destaque: 'Kylian Mbappé', rankingFifa: 2 },
  Senegal: { titulos: 0, destaque: 'Sadio Mané', rankingFifa: 17 },
  Iraque: { titulos: 0, destaque: 'Aymen Hussein', rankingFifa: 58 },
  Noruega: { titulos: 0, destaque: 'Erling Haaland', rankingFifa: 47 },
  Argentina: { titulos: 3, destaque: 'Lionel Messi', rankingFifa: 1 },
  Argélia: { titulos: 0, destaque: 'Riyad Mahrez', rankingFifa: 43 },
  Áustria: { titulos: 0, destaque: 'Marcel Sabitzer', rankingFifa: 25 },
  Jordânia: { titulos: 0, destaque: 'Musa Al-Taamari', rankingFifa: 71 },
  Portugal: { titulos: 0, destaque: 'Cristiano Ronaldo', rankingFifa: 6 },
  'RD Congo': { titulos: 0, destaque: 'Chancel Mbemba', rankingFifa: 61 },
  Uzbequistão: { titulos: 0, destaque: 'Eldor Shomurodov', rankingFifa: 64 },
  Colômbia: { titulos: 0, destaque: 'Luis Díaz', rankingFifa: 14 },
  Inglaterra: { titulos: 1, destaque: 'Jude Bellingham', rankingFifa: 3 },
  Croácia: { titulos: 0, destaque: 'Luka Modric', rankingFifa: 10 },
  Gana: { titulos: 0, destaque: 'Mohammed Kudus', rankingFifa: 68 },
  Panamá: { titulos: 0, destaque: 'Adalberto Carrasquilla', rankingFifa: 45 },
};

const GRUPOS = [
  'Todos',
  'Grupo A',
  'Grupo B',
  'Grupo C',
  'Grupo D',
  'Grupo E',
  'Grupo F',
  'Grupo G',
  'Grupo H',
  'Grupo I',
  'Grupo J',
  'Grupo K',
  'Grupo L',
];
const CONFEDERACOES = [
  'Todas',
  'UEFA',
  'CONMEBOL',
  'CONCACAF',
  'CAF',
  'AFC',
  'OFC',
];

export default function TimesClient({ initialTimes }: ITimesClientProps) {
  const [search, setSearch] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('Todos');
  const [selectedConfederacao, setSelectedConfederacao] = useState('Todas');

  const formattedTimes = useMemo(() => {
    return initialTimes.map((t) => {
      const extras = DETALHES_EXTRAS[t.nome] || {
        titulos: 0,
        destaque: 'Não informado',
        rankingFifa: 99,
      };
      return {
        ...t,
        ...extras,
      };
    });
  }, [initialTimes]);

  const filteredSelecoes = useMemo(() => {
    return formattedTimes.filter((selecao) => {
      const matchSearch =
        selecao.nome.toLowerCase().includes(search.toLowerCase()) ||
        selecao.destaque.toLowerCase().includes(search.toLowerCase());
      const matchGrupo =
        selectedGrupo === 'Todos' || selecao.grupo === selectedGrupo;
      const matchConf =
        selectedConfederacao === 'Todas' ||
        selecao.confederacao === selectedConfederacao;
      return matchSearch && matchGrupo && matchConf;
    });
  }, [search, selectedGrupo, selectedConfederacao, formattedTimes]);

  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Equipes da Copa 2026"
        description="Explore as seleções classificadas para a maior Copa do Mundo da história. Filtre por grupo ou confederação e veja seus destaques."
        badgeText="Seleções Participantes"
        icon={Globe}
      />

      {/* Barra de Filtros e Busca */}
      <div className="grid gap-4 md:grid-cols-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {/* Campo de Busca */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por seleção ou jogador destaque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        {/* Filtro de Grupos */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
          <select
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all appearance-none cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {g === 'Todos' ? 'Todos os Grupos' : g}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Confederações */}
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
          <select
            value={selectedConfederacao}
            onChange={(e) => setSelectedConfederacao(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all appearance-none cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {CONFEDERACOES.map((c) => (
              <option key={c} value={c}>
                {c === 'Todas' ? 'Todas as Confederações' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Cards */}
      {filteredSelecoes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredSelecoes.map((selecao) => (
            <div
              key={selecao.id}
              className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/40"
            >
              {/* Header do Card */}
              <div className="flex justify-between items-start">
                <span className="text-4xl select-none">{selecao.emoji}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400">
                  {selecao.grupo}
                </span>
              </div>

              {/* Titulo */}
              <h2 className="text-xl font-bold mt-4 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {selecao.nome}
              </h2>

              {/* Detalhes */}
              <div className="mt-4 space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Confederação</span>
                  <span className="font-semibold">{selecao.confederacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ranking FIFA</span>
                  <span className="font-semibold">#{selecao.rankingFifa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Destaque</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selecao.destaque}
                  </span>
                </div>
              </div>

              {/* Títulos do Card */}
              {selecao.titulos > 0 && (
                <div className="mt-4 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg p-2 text-xs font-semibold">
                  <Trophy className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <span>
                    {selecao.titulos}{' '}
                    {selecao.titulos === 1 ? 'Título' : 'Títulos'} da Copa
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
          <Globe className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-semibold mt-4">
            Nenhuma seleção encontrada
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Tente mudar os filtros de busca ou grupos acima.
          </p>
        </div>
      )}
    </div>
  );
}
