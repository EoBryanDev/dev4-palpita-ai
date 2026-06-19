import { Lightbulb } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import packageInfo from '../../../../package.json';

export function Footer(): React.ReactNode {
  return (
    <footer className="w-full border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 transition-colors dark:border-zinc-800 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Palpita AI. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link
            href="/feedback"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-600 transition-colors dark:hover:text-emerald-400"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Palpita a Feature
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono select-none">
            v{packageInfo.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
