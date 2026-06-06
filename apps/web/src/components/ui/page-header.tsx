import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badgeText,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {badgeText && (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {Icon && <Icon className="h-3 w-3" />}
          {badgeText}
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
