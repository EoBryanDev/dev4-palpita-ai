'use client';

import { GitFork, Layers, Trophy } from 'lucide-react';
import React, { useState } from 'react';

interface IGroupTeam {
  nome: string;
  emoji: string;
  pontos: number;
}

interface IGroup {
  nome: string;
  times: IGroupTeam[];
}

const GRUPOS_MOCK: IGroup[] = [
  {
    nome: 'Grupo A',
    times: [
      { nome: 'Estados Unidos', emoji: '🇺🇸', pontos: 0 },
      { nome: 'México', emoji: '🇲🇽', pontos: 0 },
      { nome: 'Canadá', emoji: '🇨🇦', pontos: 0 },
      { nome: 'Costa Rica', emoji: '🇨🇷', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo B',
    times: [
      { nome: 'Brasil', emoji: '🇧🇷', pontos: 0 },
      { nome: 'Uruguai', emoji: '🇺🇾', pontos: 0 },
      { nome: 'Colômbia', emoji: '🇨🇴', pontos: 0 },
      { nome: 'Equador', emoji: '🇪🇨', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo C',
    times: [
      { nome: 'Argentina', emoji: '🇦🇷', pontos: 0 },
      { nome: 'Chile', emoji: '🇨🇱', pontos: 0 },
      { nome: 'Paraguai', emoji: '🇵🇾', pontos: 0 },
      { nome: 'Peru', emoji: '🇵🇪', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo D',
    times: [
      { nome: 'França', emoji: '🇫🇷', pontos: 0 },
      { nome: 'Holanda', emoji: '🇳🇱', pontos: 0 },
      { nome: 'Suécia', emoji: '🇸🇪', pontos: 0 },
      { nome: 'Polônia', emoji: '🇵🇱', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo E',
    times: [
      { nome: 'Inglaterra', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pontos: 0 },
      { nome: 'Itália', emoji: '🇮🇹', pontos: 0 },
      { nome: 'Suíça', emoji: '🇨🇭', pontos: 0 },
      { nome: 'Dinamarca', emoji: '🇩🇰', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo F',
    times: [
      { nome: 'Alemanha', emoji: '🇩🇪', pontos: 0 },
      { nome: 'Bélgica', emoji: '🇧🇪', pontos: 0 },
      { nome: 'Croácia', emoji: '🇭🇷', pontos: 0 },
      { nome: 'Turquia', emoji: '🇹🇷', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo G',
    times: [
      { nome: 'Espanha', emoji: '🇪🇸', pontos: 0 },
      { nome: 'Portugal', emoji: '🇵🇹', pontos: 0 },
      { nome: 'Marrocos', emoji: '🇲🇦', pontos: 0 },
      { nome: 'Senegal', emoji: '🇸🇳', pontos: 0 },
    ],
  },
  {
    nome: 'Grupo H',
    times: [
      { nome: 'Japão', emoji: '🇯🇵', pontos: 0 },
      { nome: 'Coreia do Sul', emoji: '🇰🇷', pontos: 0 },
      { nome: 'Austrália', emoji: '🇦🇺', pontos: 0 },
      { nome: 'Arábia Saudita', emoji: '🇸🇦', pontos: 0 },
    ],
  },
];

interface IBracketMatch {
  id: string;
  timeA: string;
  emojiA: string;
  timeB: string;
  emojiB: string;
  data: string;
  vencedor?: 'A' | 'B';
}

const BRACKET_MOCK = {
  oitavas: [
    {
      id: 'O1',
      timeA: 'Brasil',
      emojiA: '🇧🇷',
      timeB: 'Uruguai',
      emojiB: '🇺🇾',
      data: '28/Jun - 13:00',
    },
    {
      id: 'O2',
      timeA: 'Argentina',
      emojiA: '🇦🇷',
      timeB: 'Chile',
      emojiB: '🇨🇱',
      data: '28/Jun - 17:00',
    },
    {
      id: 'O3',
      timeA: 'França',
      emojiA: '🇫🇷',
      timeB: 'Holanda',
      emojiB: '🇳🇱',
      data: '29/Jun - 13:00',
    },
    {
      id: 'O4',
      timeA: 'Alemanha',
      emojiA: '🇩🇪',
      timeB: 'Croácia',
      emojiB: '🇭🇷',
      data: '29/Jun - 17:00',
    },
    {
      id: 'O5',
      timeA: 'Inglaterra',
      emojiA: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      timeB: 'Itália',
      emojiB: '🇮🇹',
      data: '30/Jun - 13:00',
    },
    {
      id: 'O6',
      timeA: 'Espanha',
      emojiA: '🇪🇸',
      timeB: 'Marrocos',
      emojiB: '🇲🇦',
      data: '30/Jun - 17:00',
    },
    {
      id: 'O7',
      timeA: 'Estados Unidos',
      emojiA: '🇺🇸',
      timeB: 'México',
      emojiB: '🇲🇽',
      data: '01/Jul - 13:00',
    },
    {
      id: 'O8',
      timeA: 'Japão',
      emojiA: '🇯🇵',
      timeB: 'Coreia do Sul',
      emojiB: '🇰🇷',
      data: '01/Jul - 17:00',
    },
  ] as IBracketMatch[],
  quartas: [
    {
      id: 'Q1',
      timeA: 'Vencedor O1',
      emojiA: '⚽',
      timeB: 'Vencedor O2',
      emojiB: '⚽',
      data: '04/Jul - 13:00',
    },
    {
      id: 'Q2',
      timeA: 'Vencedor O3',
      emojiA: '⚽',
      timeB: 'Vencedor O4',
      emojiB: '⚽',
      data: '04/Jul - 17:00',
    },
    {
      id: 'Q3',
      timeA: 'Vencedor O5',
      emojiA: '⚽',
      timeB: 'Vencedor O6',
      emojiB: '⚽',
      data: '05/Jul - 13:00',
    },
    {
      id: 'Q4',
      timeA: 'Vencedor O7',
      emojiA: '⚽',
      timeB: 'Vencedor O8',
      emojiB: '⚽',
      data: '05/Jul - 17:00',
    },
  ] as IBracketMatch[],
  semis: [
    {
      id: 'S1',
      timeA: 'Vencedor Q1',
      emojiA: '⚽',
      timeB: 'Vencedor Q2',
      emojiB: '⚽',
      data: '08/Jul - 16:00',
    },
    {
      id: 'S2',
      timeA: 'Vencedor Q3',
      emojiA: '⚽',
      timeB: 'Vencedor Q4',
      emojiB: '⚽',
      data: '09/Jul - 16:00',
    },
  ] as IBracketMatch[],
  final: [
    {
      id: 'F1',
      timeA: 'Vencedor S1',
      emojiA: '🏆',
      timeB: 'Vencedor S2',
      emojiB: '🏆',
      data: '12/Jul - 16:00',
    },
  ] as IBracketMatch[],
};

export default function ChavesPage() {
  const [activeTab, setActiveTab] = useState<'grupos' | 'mata-mata'>('grupos');

  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Layers className="h-3 w-3" />
          Fases da Competição
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Chaveamento & Grupos
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Veja a composição dos grupos e a projeção do chaveamento do mata-mata
          até a grande final da Copa do Mundo.
        </p>
      </div>

      {/* Navegação entre Fase de Grupos e Mata-mata */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('grupos')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'grupos'
              ? 'bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Fase de Grupos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mata-mata')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'mata-mata'
              ? 'bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <GitFork className="h-4 w-4" />
          Chaveamento Mata-Mata
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'grupos' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GRUPOS_MOCK.map((grupo) => (
            <div
              key={grupo.nome}
              className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
            >
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
                  {grupo.nome}
                </h3>
              </div>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {grupo.times.map((time, idx) => (
                  <li
                    key={time.nome}
                    className="flex items-center justify-between p-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono text-xs w-4">
                        {idx + 1}
                      </span>
                      <span className="text-xl select-none">{time.emoji}</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {time.nome}
                      </span>
                    </div>
                    <span className="font-mono text-zinc-500 text-xs">
                      {time.pontos} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          <div className="flex gap-8 min-w-[1000px] p-4">
            {/* Oitavas */}
            <div className="flex-1 flex flex-col gap-6 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Oitavas de Final
              </h3>
              {BRACKET_MOCK.oitavas.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{match.emojiA}</span>
                      <span>{match.timeA}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-2">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{match.emojiB}</span>
                      <span>{match.timeB}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-medium pt-1 flex justify-between">
                    <span>{match.id}</span>
                    <span>{match.data}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quartas */}
            <div className="flex-1 flex flex-col gap-12 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Quartas de Final
              </h3>
              {BRACKET_MOCK.quartas.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-zinc-400">
                      <span>{match.emojiA}</span>
                      <span>{match.timeA}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-2">
                    <div className="flex items-center gap-2 font-medium text-zinc-400">
                      <span>{match.emojiB}</span>
                      <span>{match.timeB}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-medium pt-1 flex justify-between">
                    <span>{match.id}</span>
                    <span>{match.data}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Semis */}
            <div className="flex-1 flex flex-col gap-24 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Semifinais
              </h3>
              {BRACKET_MOCK.semis.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-zinc-400">
                      <span>{match.emojiA}</span>
                      <span>{match.timeA}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 pt-2">
                    <div className="flex items-center gap-2 font-medium text-zinc-400">
                      <span>{match.emojiB}</span>
                      <span>{match.timeB}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-medium pt-1 flex justify-between">
                    <span>{match.id}</span>
                    <span>{match.data}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Final
              </h3>
              {BRACKET_MOCK.final.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border-2 border-amber-500 bg-white p-4 shadow-md dark:bg-zinc-900 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <Trophy className="h-4.5 w-4.5 text-amber-500" />
                      <span>{match.timeA}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Trophy className="h-4.5 w-4.5 text-amber-500" />
                      <span>{match.timeB}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-bold pt-1 flex justify-between">
                    <span>{match.id}</span>
                    <span>{match.data}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
