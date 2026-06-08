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

import { obterPartidas } from '@/services/partidas.service';
import { obterRodadaAtiva } from '@/services/rodadas.service';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await obterSessao();

  // Buscar a rodada ativa para calcular o prazo de palpites (limite: 30 minutos antes do primeiro jogo)
  // Envolvido em try/catch para não quebrar o build caso o DB não esteja acessível
  let targetDate: string | undefined = undefined;
  let labelRodada: string | undefined = undefined;

  try {
    const rodadaAtiva = await obterRodadaAtiva();

    if (rodadaAtiva) {
      const partidasDaRodada = await obterPartidas(rodadaAtiva.id);
      if (partidasDaRodada.length > 0) {
        const primeiraPartida = partidasDaRodada[0];
        const dataLimite = new Date(
          primeiraPartida.dataInicio.getTime() - 30 * 60 * 1000,
        );
        targetDate = dataLimite.toISOString();
        labelRodada = rodadaAtiva.nome;
      }
    }
  } catch {
    // Em caso de erro (ex.: DB indisponível durante build), o banner simplesmente não é exibido
  }

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
            <TimeoutBanner targetDate={targetDate} labelRodada={labelRodada} />
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
