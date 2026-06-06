import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'teal' | 'red';
  className?: string;
}

const colorMaps = {
  blue: {
    gradient: 'from-blue-500/10',
    iconBg: 'bg-blue-100 dark:bg-blue-950/40',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    gradient: 'from-emerald-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    gradient: 'from-amber-500/10',
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconText: 'text-amber-600 dark:text-amber-400',
  },
  purple: {
    gradient: 'from-purple-500/10',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40',
    iconText: 'text-purple-600 dark:text-purple-400',
  },
  teal: {
    gradient: 'from-teal-500/10',
    iconBg: 'bg-teal-100 dark:bg-teal-950/40',
    iconText: 'text-teal-600 dark:text-teal-400',
  },
  red: {
    gradient: 'from-red-500/10',
    iconBg: 'bg-red-100 dark:bg-red-950/40',
    iconText: 'text-red-600 dark:text-red-400',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  className,
}: StatCardProps) {
  const styles = colorMaps[color] || colorMaps.blue;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40',
        className,
      )}
    >
      <div
        className={cn(
          'absolute top-0 right-0 h-24 w-24 bg-linear-to-bl to-transparent rounded-bl-full',
          styles.gradient,
        )}
      />
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl',
            styles.iconBg,
            styles.iconText,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-3xl font-black">{value}</div>
        </div>
      </div>
    </div>
  );
}
