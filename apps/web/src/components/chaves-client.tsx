'use client';

import { FlagImage } from '@/components/ui/flag-image';
import { PageHeader } from '@/components/ui/page-header';
import { GitFork, Layers, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import type { IBracketMatch, IChavesClientProps } from '@/interface/IChaves';

function BracketMatchCard({
  match,
  isFinal = false,
}: { match: IBracketMatch; isFinal?: boolean }) {
  const isWinnerA = match.vencedor === 'A';
  const isWinnerB = match.vencedor === 'B';

  return (
    <div
      className={`rounded-xl border bg-white p-3.5 shadow-sm dark:bg-zinc-900 text-xs space-y-2 transition-all hover:shadow-md ${
        isFinal
          ? 'border-2 border-amber-500 p-4'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 font-medium ${
            isWinnerA
              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
              : match.vencedor
                ? 'text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {isFinal ? (
            <Trophy
              className={`h-4.5 w-4.5 shrink-0 ${isWinnerA ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`}
            />
          ) : (
            <FlagImage
              emoji={match.emojiA}
              alt={match.timeA}
              className="h-5 w-5 shrink-0"
            />
          )}
          <span className="truncate max-w-[110px]">{match.timeA}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
        <div
          className={`flex items-center gap-2 font-medium ${
            isWinnerB
              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
              : match.vencedor
                ? 'text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {isFinal ? (
            <Trophy
              className={`h-4.5 w-4.5 shrink-0 ${isWinnerB ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`}
            />
          ) : (
            <FlagImage
              emoji={match.emojiB}
              alt={match.timeB}
              className="h-5 w-5 shrink-0"
            />
          )}
          <span className="truncate max-w-[110px]">{match.timeB}</span>
        </div>
      </div>
      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium pt-1 flex justify-between items-center">
        <span className="font-mono">{match.id}</span>
        <span>{match.data}</span>
      </div>
    </div>
  );
}

export default function ChavesClient({ grupos, bracket }: IChavesClientProps) {
  const [activeTab, setActiveTab] = useState<'grupos' | 'mata-mata'>('grupos');

  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Chaveamento & Grupos"
        description="Veja a composição dos grupos e a projeção do chaveamento do mata-mata até a grande final da Copa do Mundo."
        badgeText="Fases da Competição"
        icon={Layers}
      />

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
          {grupos.map((grupo) => (
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
                      <FlagImage
                        emoji={time.emoji}
                        alt={time.nome}
                        className="h-6 w-6 shrink-0"
                      />
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {time.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-zinc-500 text-xs shrink-0">
                      <span>{time.pontos} Pts</span>
                      <span className="text-zinc-300 dark:text-zinc-700">
                        |
                      </span>
                      <span>
                        {time.saldoGols > 0
                          ? `+${time.saldoGols}`
                          : time.saldoGols}{' '}
                        SG
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          <div className="flex gap-8 min-w-[1300px] p-4">
            {/* 16 Avos de Final */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                16 Avos de Final
              </h3>
              {bracket.dezesseisAvos.map((match) => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Oitavas */}
            <div className="flex-1 flex flex-col gap-10 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Oitavas de Final
              </h3>
              {bracket.oitavas.map((match) => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Quartas */}
            <div className="flex-1 flex flex-col gap-20 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Quartas de Final
              </h3>
              {bracket.quartas.map((match) => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Semis */}
            <div className="flex-1 flex flex-col gap-40 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Semifinais
              </h3>
              {bracket.semis.map((match) => (
                <BracketMatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Final */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Final
              </h3>
              {bracket.final.map((match) => (
                <BracketMatchCard key={match.id} match={match} isFinal={true} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
