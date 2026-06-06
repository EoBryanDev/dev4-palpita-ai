'use client';

import { useUiStore } from '@/store/ui-store';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function ThemeToggle(): React.ReactNode {
  const { theme, setTheme } = useTheme();
  const setStoreTheme = useUiStore((state) => state.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme) {
      setStoreTheme(theme as 'light' | 'dark' | 'system');
    }
  }, [theme, setStoreTheme]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoreTheme(nextTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
    </Button>
  );
}
