import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ScrollToTop } from '@/components/scroll-to-top';
import { TimeoutBanner } from '@/components/timeout-banner';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

import { obterSessao } from '@/app/actions/auth';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Palpita AI - Plataforma de Palpites',
  description:
    'Dê seus palpites nos jogos da Copa do Mundo e dispute prêmios com seus amigos.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await obterSessao();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TimeoutBanner />
            <Header initialSession={session} />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <ScrollToTop />
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
