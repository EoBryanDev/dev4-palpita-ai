import { SolicitarConviteForm } from '@/components/solicitar-convite-form';
import { Button } from '@/components/ui/button';
import { db, partidas, rodadas, times } from '@palpita/db';
import { asc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Coins,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface IHomePartida {
  id: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodada: string;
}

interface IHomePageProps {
  searchParams: Promise<{ timeout?: string }>;
}

export default async function HomePage({
  searchParams,
}: IHomePageProps): Promise<React.ReactNode> {
  const { timeout } = await searchParams;
  const showTimeoutBanner = timeout === 'true';

  let partidasList: IHomePartida[] = [];

  try {
    const timeA = alias(times, 'time_a');
    const timeB = alias(times, 'time_b');

    // Tenta buscar partidas reais do banco de dados
    const partidasDb = await db
      .select({
        id: partidas.id,
        timeA: timeA.nome,
        timeB: timeB.nome,
        timeAEmoji: timeA.emoji,
        timeBEmoji: timeB.emoji,
        golsTimeA: partidas.golsTimeA,
        golsTimeB: partidas.golsTimeB,
        dataInicio: partidas.dataInicio,
        status: partidas.status,
        rodadaNome: rodadas.nome,
      })
      .from(partidas)
      .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
      .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
      .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
      .orderBy(asc(partidas.dataInicio))
      .limit(6);

    partidasList = partidasDb.map((p) => ({
      id: p.id,
      timeA: p.timeA,
      timeB: p.timeB,
      timeAEmoji: p.timeAEmoji,
      timeBEmoji: p.timeBEmoji,
      golsTimeA: p.golsTimeA,
      golsTimeB: p.golsTimeB,
      dataInicio: new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(p.dataInicio),
      status: p.status,
      rodada: p.rodadaNome,
    }));
  } catch (error) {
    console.error(
      'Erro ao carregar partidas do banco. Usando fallback ficticio.',
      error,
    );
  }

  // Fallback de partidas ficticias caso o banco esteja vazio
  if (partidasList.length === 0) {
    partidasList = [
      {
        id: '1',
        timeA: 'Brasil',
        timeB: 'França',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: '12 de Junho, 16:00',
        rodada: 'Rodada 1',
        status: 'NAO_INICIADA',
      },
      {
        id: '2',
        timeA: 'Argentina',
        timeB: 'Espanha',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: '13 de Junho, 13:00',
        rodada: 'Rodada 1',
        status: 'NAO_INICIADA',
      },
      {
        id: '3',
        timeA: 'Alemanha',
        timeB: 'Japão',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: '14 de Junho, 10:00',
        rodada: 'Rodada 1',
        status: 'NAO_INICIADA',
      },
    ];
  }

  return (
    <>
      {/* Banner de Timeout de Link/Acesso */}
      {(showTimeoutBanner || true) && (
        <div className="border-b border-amber-200 bg-amber-50 text-amber-900 transition-colors dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium">
                {showTimeoutBanner ? (
                  <span className="font-bold">Aviso de Expiração:</span>
                ) : (
                  <span className="font-bold">Segurança:</span>
                )}{' '}
                Os links de convite e ativação expiram em exatamente 5 minutos
                por segurança.
              </p>
            </div>
            {showTimeoutBanner && (
              <Link href="/home">
                <button
                  type="button"
                  className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900"
                >
                  Dispensar
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl flex-1 p-6 px-6 space-y-12">
        {/* Seção Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-8 dark:border-zinc-800 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Copa do Mundo de 2026
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Dê seus palpites e domine a classificação
              </h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Acompanhe as rodadas, chute os placares dos confrontos e some
                pontos na disputa pelo primeiro lugar. Simples, rápido e
                inteligente.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#solicitar-convite">
                  <Button
                    size="lg"
                    className="bg-emerald-600 text-zinc-50 hover:bg-emerald-500 dark:bg-emerald-50 dark:text-zinc-950 dark:hover:bg-emerald-400"
                  >
                    Peça seu convite
                  </Button>
                </a>
                <a href="#regras-pontuacao">
                  <Button size="lg" variant="outline">
                    Ver Regulamento
                  </Button>
                </a>
              </div>
            </div>
            <div
              id="solicitar-convite"
              className="flex justify-center md:justify-end"
            >
              <SolicitarConviteForm />
            </div>
          </div>
        </section>

        {/* Estatisticas Rápidas */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition-all hover:border-emerald-500/50">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total de Prêmios
                </p>
                <p className="text-2xl font-bold">R$ 5.000,00</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition-all hover:border-emerald-500/50">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Palpidores Ativos
                </p>
                <p className="text-2xl font-bold">142 usuários</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition-all hover:border-emerald-500/50">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Próximos Confrontos
                </p>
                <p className="text-2xl font-bold">12 partidas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Regras de Pontuação */}
        <section
          id="regras-pontuacao"
          className="rounded-3xl border border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
        >
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Coins className="h-3 w-3" />
              Regulamento Oficial
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Regras de Pontuação
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              O sistema de pontuação é simples e direto, premiando tanto a
              precisão absoluta quanto a intuição do vencedor da partida. Veja
              como acumular pontos:
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  1 pt
                </div>
                <h3 className="text-lg font-bold mt-2">Placar Exato</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Você acertou exatamente a quantidade de gols de ambas as
                  seleções.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  1 pt
                </div>
                <h3 className="text-lg font-bold mt-2">Resultado Final</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Você errou o placar exato, mas acertou a seleção vencedora ou
                  a condição de empate.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <div className="text-3xl font-extrabold text-zinc-400">
                  0 pt
                </div>
                <h3 className="text-lg font-bold mt-2">Errado</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Você não acertou o vencedor e nem a ocorrência de empate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Confrontos do Dia */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Próximos Confrontos
            </h2>
            <Link
              href="/agenda"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Ver todas as partidas
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {partidasList.map((partida) => (
              <div
                key={partida.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {partida.rodada}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {partida.dataInicio}
                  </span>
                </div>

                <div className="my-6 flex items-center justify-between gap-4 font-semibold">
                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-200 dark:border-zinc-700">
                      {partida.timeAEmoji ||
                        partida.timeA.slice(0, 3).toUpperCase()}
                    </div>
                    <span className="text-sm truncate w-full">
                      {partida.timeA}
                    </span>
                  </div>

                  <span className="text-zinc-400 text-xs">VS</span>

                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-200 dark:border-zinc-700">
                      {partida.timeBEmoji ||
                        partida.timeB.slice(0, 3).toUpperCase()}
                    </div>
                    <span className="text-sm truncate w-full">
                      {partida.timeB}
                    </span>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    Palpitar
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
