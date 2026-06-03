'use client';

import { Button } from '@/components/ui/button';
import { Filter, Globe, Search, Sparkles, Trophy } from 'lucide-react';
import React, { useState, useMemo } from 'react';

interface ISelecao {
  nome: string;
  emoji: string;
  grupo: string;
  confederacao: string;
  titulos: number;
  destaque: string;
  rankingFifa: number;
}

const SELECOES_MOCK: ISelecao[] = [
  // Grupo A
  {
    nome: 'Estados Unidos',
    emoji: '🇺🇸',
    grupo: 'Grupo A',
    confederacao: 'CONCACAF',
    titulos: 0,
    destaque: 'Christian Pulisic',
    rankingFifa: 11,
  },
  {
    nome: 'México',
    emoji: '🇲🇽',
    grupo: 'Grupo A',
    confederacao: 'CONCACAF',
    titulos: 0,
    destaque: 'Santiago Giménez',
    rankingFifa: 15,
  },
  {
    nome: 'Canadá',
    emoji: '🇨🇦',
    grupo: 'Grupo A',
    confederacao: 'CONCACAF',
    titulos: 0,
    destaque: 'Alphonso Davies',
    rankingFifa: 49,
  },
  {
    nome: 'Costa Rica',
    emoji: '🇨🇷',
    grupo: 'Grupo A',
    confederacao: 'CONCACAF',
    titulos: 0,
    destaque: 'Keylor Navas',
    rankingFifa: 54,
  },

  // Grupo B
  {
    nome: 'Brasil',
    emoji: '🇧🇷',
    grupo: 'Grupo B',
    confederacao: 'CONMEBOL',
    titulos: 5,
    destaque: 'Vinícius Jr.',
    rankingFifa: 5,
  },
  {
    nome: 'Uruguai',
    emoji: '🇺🇾',
    grupo: 'Grupo B',
    confederacao: 'CONMEBOL',
    titulos: 2,
    destaque: 'Federico Valverde',
    rankingFifa: 12,
  },
  {
    nome: 'Colômbia',
    emoji: '🇨🇴',
    grupo: 'Grupo B',
    confederacao: 'CONMEBOL',
    titulos: 0,
    destaque: 'Luis Díaz',
    rankingFifa: 14,
  },
  {
    nome: 'Equador',
    emoji: '🇪🇨',
    grupo: 'Grupo B',
    confederacao: 'CONMEBOL',
    titulos: 0,
    destaque: 'Moises Caicedo',
    rankingFifa: 31,
  },

  // Grupo C
  {
    nome: 'Argentina',
    emoji: '🇦🇷',
    grupo: 'Grupo C',
    confederacao: 'CONMEBOL',
    titulos: 3,
    destaque: 'Lionel Messi',
    rankingFifa: 1,
  },
  {
    nome: 'Chile',
    emoji: '🇨🇱',
    grupo: 'Grupo C',
    confederacao: 'CONMEBOL',
    titulos: 0,
    destaque: 'Alexis Sánchez',
    rankingFifa: 40,
  },
  {
    nome: 'Paraguai',
    emoji: '🇵🇾',
    grupo: 'Grupo C',
    confederacao: 'CONMEBOL',
    titulos: 0,
    destaque: 'Julio Enciso',
    rankingFifa: 56,
  },
  {
    nome: 'Peru',
    emoji: '🇵🇪',
    grupo: 'Grupo C',
    confederacao: 'CONMEBOL',
    titulos: 0,
    destaque: 'Luis Advíncula',
    rankingFifa: 32,
  },

  // Grupo D
  {
    nome: 'França',
    emoji: '🇫🇷',
    grupo: 'Grupo D',
    confederacao: 'UEFA',
    titulos: 2,
    destaque: 'Kylian Mbappé',
    rankingFifa: 2,
  },
  {
    nome: 'Holanda',
    emoji: '🇳🇱',
    grupo: 'Grupo D',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Virgil van Dijk',
    rankingFifa: 7,
  },
  {
    nome: 'Suécia',
    emoji: '🇸🇪',
    grupo: 'Grupo D',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Alexander Isak',
    rankingFifa: 26,
  },
  {
    nome: 'Polônia',
    emoji: '🇵🇱',
    grupo: 'Grupo D',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Robert Lewandowski',
    rankingFifa: 30,
  },

  // Grupo E
  {
    nome: 'Inglaterra',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    grupo: 'Grupo E',
    confederacao: 'UEFA',
    titulos: 1,
    destaque: 'Jude Bellingham',
    rankingFifa: 3,
  },
  {
    nome: 'Itália',
    emoji: '🇮🇹',
    grupo: 'Grupo E',
    confederacao: 'UEFA',
    titulos: 4,
    destaque: 'Nicolò Barella',
    rankingFifa: 9,
  },
  {
    nome: 'Suíça',
    emoji: '🇨🇭',
    grupo: 'Grupo E',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Granit Xhaka',
    rankingFifa: 19,
  },
  {
    nome: 'Dinamarca',
    emoji: '🇩🇰',
    grupo: 'Grupo E',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Rasmus Højlund',
    rankingFifa: 21,
  },

  // Grupo F
  {
    nome: 'Alemanha',
    emoji: '🇩🇪',
    grupo: 'Grupo F',
    confederacao: 'UEFA',
    titulos: 4,
    destaque: 'Jamal Musiala',
    rankingFifa: 16,
  },
  {
    nome: 'Bélgica',
    emoji: '🇧🇪',
    grupo: 'Grupo F',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Kevin De Bruyne',
    rankingFifa: 4,
  },
  {
    nome: 'Croácia',
    emoji: '🇭🇷',
    grupo: 'Grupo F',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Luka Modric',
    rankingFifa: 10,
  },
  {
    nome: 'Turquia',
    emoji: '🇹🇷',
    grupo: 'Grupo F',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Hakan Çalhanoğlu',
    rankingFifa: 35,
  },

  // Grupo G
  {
    nome: 'Espanha',
    emoji: '🇪🇸',
    grupo: 'Grupo G',
    confederacao: 'UEFA',
    titulos: 1,
    destaque: 'Lamine Yamal',
    rankingFifa: 8,
  },
  {
    nome: 'Portugal',
    emoji: '🇵🇹',
    grupo: 'Grupo G',
    confederacao: 'UEFA',
    titulos: 0,
    destaque: 'Cristiano Ronaldo',
    rankingFifa: 6,
  },
  {
    nome: 'Marrocos',
    emoji: '🇲🇦',
    grupo: 'Grupo G',
    confederacao: 'CAF',
    titulos: 0,
    destaque: 'Achraf Hakimi',
    rankingFifa: 13,
  },
  {
    nome: 'Senegal',
    emoji: '🇸🇳',
    grupo: 'Grupo G',
    confederacao: 'CAF',
    titulos: 0,
    destaque: 'Sadio Mané',
    rankingFifa: 17,
  },

  // Grupo H
  {
    nome: 'Japão',
    emoji: '🇯🇵',
    grupo: 'Grupo H',
    confederacao: 'AFC',
    titulos: 0,
    destaque: 'Kaoru Mitoma',
    rankingFifa: 18,
  },
  {
    nome: 'Coreia do Sul',
    emoji: '🇰🇷',
    grupo: 'Grupo H',
    confederacao: 'AFC',
    titulos: 0,
    destaque: 'Heung-min Son',
    rankingFifa: 22,
  },
  {
    nome: 'Austrália',
    emoji: '🇦🇺',
    grupo: 'Grupo H',
    confederacao: 'AFC',
    titulos: 0,
    destaque: 'Harry Souttar',
    rankingFifa: 25,
  },
  {
    nome: 'Arábia Saudita',
    emoji: '🇸🇦',
    grupo: 'Grupo H',
    confederacao: 'AFC',
    titulos: 0,
    destaque: 'Salem Al-Dawsari',
    rankingFifa: 53,
  },
];

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
];
const CONFEDERACOES = ['Todas', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC'];

export default function TimesPage() {
  const [search, setSearch] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('Todos');
  const [selectedConfederacao, setSelectedConfederacao] = useState('Todas');

  const filteredSelecoes = useMemo(() => {
    return SELECOES_MOCK.filter((selecao) => {
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
  }, [search, selectedGrupo, selectedConfederacao]);

  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Globe className="h-3 w-3" />
          Seleções Participantes
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Equipes da Copa 2026
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Explore as seleções classificadas para a maior Copa do Mundo da
          história. Filtre por grupo ou confederação e veja seus destaques.
        </p>
      </div>

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
              key={selecao.nome}
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
