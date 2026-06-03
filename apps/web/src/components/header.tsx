'use client';

import { logoutUsuario, obterSessao } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState, useTransition } from 'react';

interface ISessionUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

export function Header({
  initialSession = null,
}: {
  initialSession?: ISessionUser | null;
}): React.ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<ISessionUser | null>(initialSession);
  const [isPending, startTransition] = useTransition();

  // Sincronizar com a sessão inicial que pode ser alterada na navegação do servidor
  useEffect(() => {
    setUser(initialSession);
  }, [initialSession]);

  const links = [
    { href: '/home', label: 'Início' },
    { href: '/agenda', label: 'Agenda' },
    { href: '/times', label: 'Times' },
    { href: '/chaves', label: 'Chaves' },
    { href: '/ranking', label: 'Ranking' },
    { href: '/palpites', label: 'Palpites' },
  ];

  // Adicionar links protegidos se o usuário estiver logado
  if (user) {
    links.push({ href: '/meu-espaco', label: 'Meu Espaço' });
    if (user.cargo === 'ADMIN') {
      links.push({ href: '/admin/usuarios', label: 'Admin' });
    }
  }

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUsuario();
      setUser(null);
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md transition-colors dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all group-hover:scale-105 dark:bg-emerald-500">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-amber-400">
            PALPITA AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/home' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold leading-none">
                  {user.nome}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
                  {user.cargo === 'ADMIN' ? 'Admin' : 'Competidor'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isPending}
                className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 h-8 w-8"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button className="bg-emerald-600 font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400">
                Participar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-4 transition-all dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/home' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-semibold transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-zinc-100 dark:border-zinc-800" />
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{user.nome}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.cargo === 'ADMIN' ? 'Admin' : 'Competidor'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  disabled={isPending}
                  className="text-xs font-bold border-red-500/20 text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-950/20"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400">
                  Participar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
