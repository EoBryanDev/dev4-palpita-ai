'use client';

import { Lightbulb } from 'lucide-react';
import Link from 'next/link';

export function FeedbackButton() {
  return (
    <Link
      href="/feedback"
      className="fixed bottom-20 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-xl active:scale-95 dark:bg-emerald-500 dark:hover:bg-emerald-400"
    >
      <Lightbulb className="h-4 w-4" />
      Palpita a Feature
    </Link>
  );
}
