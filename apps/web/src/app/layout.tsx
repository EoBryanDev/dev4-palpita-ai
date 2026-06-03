import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { QueryProvider } from '@/components/query-provider';
import { ScrollToTop } from '@/components/scroll-to-top';
import { ThemeProvider } from '@/components/theme-provider';
import { TimeoutBanner } from '@/components/timeout-banner';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <ScrollToTop />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
