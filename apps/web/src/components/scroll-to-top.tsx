'use client';

import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export function ScrollToTop(): React.ReactNode {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-emerald-600 p-0 text-white shadow-lg hover:scale-110 hover:bg-emerald-500 active:scale-95 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 focus-visible:ring-emerald-500 transition-all duration-300 animate-in fade-in zoom-in"
      aria-label="Voltar ao topo"
      size="icon"
    >
      <ArrowUp className="h-5 w-5 animate-bounce duration-1000" />
    </Button>
  );
}
