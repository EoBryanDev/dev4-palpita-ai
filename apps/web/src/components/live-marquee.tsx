'use client';

import { useEffect, useState } from 'react';

interface ILiveMatch {
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  status: string;
}

export function LiveMarquee() {
  const [matches, setMatches] = useState<ILiveMatch[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/palpites');
        if (!res.ok) return;
        const data = await res.json();
        const live = data.filter(
          (m: ILiveMatch) =>
            m.status === 'EM_ANDAMENTO' ||
            m.status === 'INICIADO',
        );
        setMatches(live);
      } catch {
        // silencioso
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  if (matches.length === 0) return null;

  const items = matches.map(
    (m) =>
      `${m.timeA} ${m.golsTimeA ?? 0} x ${m.golsTimeB ?? 0} ${m.timeB}`,
  );

  const content = items.join(' ● ');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white text-xs font-bold h-8 flex items-center">
      <div className="marquee-track whitespace-nowrap will-change-transform">
        <span className="mx-4">{content}</span>
        <span className="mx-4">{content}</span>
      </div>
      <style>{`
        .marquee-track {
          display: inline-flex;
          animation: marquee-scroll 20s linear infinite;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
