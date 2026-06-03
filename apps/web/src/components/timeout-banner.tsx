'use client';

import { AlertTriangle, Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function TimeoutBanner() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Alvo: Início real da primeira partida da Copa do Mundo - 12 de Junho de 2026 às 16:00
    const targetDate = new Date('2026-06-12T16:00:00').getTime();

    const calculateTimeLeft = () => {
      const difference = targetDate - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-emerald-600 text-zinc-50 border-b border-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 h-10 flex items-center justify-center">
        <div className="h-4 w-64 bg-emerald-500/20 dark:bg-emerald-900/20 rounded animate-pulse" />
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="bg-red-500/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-b border-red-200/50 dark:border-red-950/50 transition-colors">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">
              Palpites para a Rodada 1 encerrados! Os jogos já começaram. (RN02)
            </span>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // Urgência se faltar menos de 24 horas
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div
      className={`border-b transition-all duration-300 ${
        isUrgent
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
          : 'bg-emerald-600 text-zinc-50 border-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Timer
            className={`h-4 w-4 shrink-0 ${isUrgent ? 'animate-pulse text-amber-500' : 'text-emerald-200'}`}
          />
          <span className="text-xs sm:text-sm font-medium">
            Bloqueio de palpites da <span className="font-bold">Rodada 1</span>{' '}
            em:
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Cronômetro */}
          <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-bold">
            <div className="flex flex-col items-center">
              <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[24px] text-center">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                d
              </span>
            </div>
            <span className="pb-3 text-zinc-400 dark:text-zinc-500">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[24px] text-center">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                h
              </span>
            </div>
            <span className="pb-3 text-zinc-400 dark:text-zinc-500">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[24px] text-center">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                m
              </span>
            </div>
            <span className="pb-3 text-zinc-400 dark:text-zinc-500">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[24px] text-center">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[8px] uppercase font-sans font-normal opacity-70 mt-0.5">
                s
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button
              size="xs"
              className={`text-xs font-semibold ${
                isUrgent
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-zinc-50 text-emerald-800 hover:bg-emerald-50 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'
              }`}
            >
              Palpitar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
