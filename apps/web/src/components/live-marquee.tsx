'use client';

import { useEffect, useState } from 'react';

import type { ISessionUser } from '@/interface/IHeader';

interface ILiveMatch {
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  status: string;
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
        const res = await fetch('/api/palpites');
        if (!res.ok) return;
        const data = await res.json();
        const live = data.filter(
          (m: ILiveMatch) =>
            m.status === 'EM_ANDAMENTO' || m.status === 'INICIADO',
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

  const items = matches.map(
    (m) => `${m.timeA} ${m.golsTimeA ?? 0} x ${m.golsTimeB ?? 0} ${m.timeB}`,
  );

  const content = items.join(' ● ');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white text-xs font-bold h-8 flex items-center">
      <div className="marquee-content whitespace-nowrap">{content}</div>
      <style>{`
        .marquee-content {
          display: inline-block;
          padding: 0 2rem;
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
