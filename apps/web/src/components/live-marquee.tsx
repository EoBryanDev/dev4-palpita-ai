'use client';

import { obterEventosTimeline } from '@/app/actions/eventos';
import { useEffect, useState } from 'react';

import type { ISessionUser } from '@/interface/IHeader';

interface ILiveMatch {
  timeA: string;
  timeB: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  status: string;
  eventosJogo?: {
    tipo: string;
    timeNome: string | null;
    jogador: string | null;
    minuto: number;
    acrescimos: number | null;
  }[];
}

export function LiveMarquee({
  initialSession,
}: {
  initialSession?: ISessionUser | null;
}) {
  const [matches, setMatches] = useState<ILiveMatch[]>([]);

  useEffect(() => {
    if (!initialSession) return;

    const fetchLive = async () => {
      try {
        const result = await obterEventosTimeline();
        if (!result.success) return;
        const live = result.eventos.filter(
          (m) => m.status === 'EM_ANDAMENTO' || m.status === 'INICIADO',
        );
        setMatches(live);
      } catch {
        // silencioso
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, [initialSession]);

  if (matches.length === 0) return null;

  const items = matches.map((m) => {
    let text = `${m.timeA} ${m.golsTimeA ?? 0} x ${m.golsTimeB ?? 0} ${m.timeB}`;
    const goals = (m.eventosJogo || []).filter((e) => e.tipo === 'GOL');
    if (goals.length > 0) {
      const goalTexts = goals.map((g) => {
        const min = g.acrescimos
          ? `${g.minuto}'+${g.acrescimos}`
          : `${g.minuto}'`;
        const team = g.timeNome ? ` (${g.timeNome})` : '';
        return `⚽ ${g.jogador}${team} ${min}`;
      });
      text += `  ${goalTexts.join('  ')}`;
    }
    return text;
  });

  const content = items.join('  ●  ');

  return (
    <div className="border-y border-red-500/20 bg-red-500/5 dark:border-red-500/10 dark:bg-red-950/10 backdrop-blur-sm text-xs font-bold h-9 flex items-center overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 shrink-0 h-full border-r border-red-500/20 dark:border-red-500/10">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="uppercase tracking-wider text-[10px] bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-full text-red-650 dark:text-red-455 font-bold">
          Ao Vivo
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="marquee-content whitespace-nowrap will-change-transform text-zinc-700 dark:text-zinc-300">
          {content}
        </div>
      </div>
      <style>{`
        .marquee-content {
          display: inline-block;
          padding-left: 2rem;
          animation: marquee 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
