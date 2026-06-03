import type React from 'react';

export function Footer(): React.ReactNode {
  return (
    <footer className="w-full border-t border-zinc-200 py-6 text-center text-sm text-zinc-500 transition-colors dark:border-zinc-800 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>© 2026 Palpita AI. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
