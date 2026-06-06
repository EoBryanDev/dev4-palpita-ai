'use client';

import { useCountdown } from '@/hooks/use-countdown';
import { Timer } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Button } from './ui/button';

export function TimeoutBanner() {
  const { timeLeft, mounted, isUrgent } = useCountdown();

  if (!mounted) {
    return (
      <div className="bg-emerald-600 text-zinc-50 border-b border-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 h-10 flex items-center justify-center">
        <div className="h-4 w-64 bg-emerald-500/20 dark:bg-emerald-900/20 rounded animate-pulse" />
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return null;
  }

  const formatNumber = (num: number) => String(num).padStart(2, '0');

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
            A Copa do Mundo de 2026 começa em:
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
