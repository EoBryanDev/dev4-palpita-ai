'use client';

import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToastStore } from './use-toast';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isDestructive = toast.variant === 'destructive';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 ${
              isDestructive
                ? 'border-red-200 bg-red-50/90 text-red-950 dark:border-red-900/50 dark:bg-red-950/90 dark:text-red-50'
                : 'border-zinc-200 bg-white/90 text-zinc-950 dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:text-zinc-50'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            )}

            <div className="flex-1 space-y-1">
              {toast.title && (
                <h5 className="font-bold text-sm leading-none">
                  {toast.title}
                </h5>
              )}
              {toast.description && (
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800 shrink-0 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
