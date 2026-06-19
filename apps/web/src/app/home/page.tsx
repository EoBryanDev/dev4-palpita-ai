import { SolicitarConviteForm } from '@/components/form/solicitar-convite-form';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/ui/flag-image';
import { formatToBRLDateTimeLong } from '@/helpers/date';
import type { IHomePartida } from '@/interface/IPartida';
import { obterValorPalpite } from '@/services/configuracoes.service';
import { obterPartidas } from '@/services/partidas.service';
import { obterResumoStatusUsuarios } from '@/services/usuarios.service';
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
import { obterSessao } from '@/app/actions/auth';
import type React from 'react';

interface IHomePageProps {
  searchParams: Promise<{ timeout?: string }>;
}

export default async function HomePage({
  searchParams,
}: IHomePageProps): Promise<React.ReactNode> {
  const { timeout } = await searchParams;
  const showTimeoutBanner = timeout === 'true';
  const session = await obterSessao();

  // 1. Buscar valor do palpite
  let valorPalpite = 50;
  try {
    valorPalpite = await obterValorPalpite();
  } catch (error) {
    console.error('Erro ao buscar valor_palpite na Home:', error);
  }

  // 2. Buscar total de usuários ativos
  let totalUsuariosAtivos = 0;
  try {
    const activeUsers = await obterResumoStatusUsuarios();
    totalUsuariosAtivos = activeUsers.filter(
      (u) => u.status === 'LIBERADO' || u.status === 'ATIVO',
    ).length;
  } catch (error) {
    console.error('Erro ao buscar totalUsuariosAtivos na Home:', error);
  }

  // Calcular prêmio total
  const totalPremios = totalUsuariosAtivos * valorPalpite;

  // 3. Buscar total de confrontos/jogos existentes no banco
  let totalConfrontos = 0;
  let partidasList: IHomePartida[] = [];

  try {
    const allPartidas = await obterPartidas();
    totalConfrontos = allPartidas.length;

    // Buscar as próximas partidas filtrando diretamente no banco de dados
    const proximasPartidas = await obterPartidas(undefined, true);

    partidasList = proximasPartidas.slice(0, 6).map((p) => ({
      id: p.id,
      timeA: p.timeA,
      timeB: p.timeB,
      timeAEmoji: p.timeAEmoji,
      timeBEmoji: p.timeBEmoji,
      golsTimeA: p.golsTimeA,
      golsTimeB: p.golsTimeB,
      dataInicio: formatToBRLDateTimeLong(p.dataInicio),
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
        {/* Banner da Copa (Imagem solo) */}
        <div className="relative w-full overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <img
            src="/hq720.jpg"
            alt="Copa do Mundo 2026"
            className="w-full h-auto select-none"
          />
        </div>

        {/* Seção Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-linear-to-br from-emerald-500/10 via-transparent to-transparent p-8 dark:border-zinc-800 md:p-12">
          {/* Elementos Decorativos da Copa 2026 flutuando de forma sutil no fundo */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 pointer-events-none opacity-10 dark:opacity-20 hidden lg:block select-none">
            <div className="relative w-80 h-80">
              <img
                src="/2026-wc-logo-usa-copia-removebg-preview.png"
                alt="Copa 2026 USA"
                className="absolute top-0 right-0 w-36 h-36 rotate-12 animate-bounce"
                style={{ animationDuration: '6s' }}
              />
              <img
                src="/2026-wc-logo-mex-copia-removebg-preview.png"
                alt="Copa 2026 México"
                className="absolute bottom-0 left-0 w-32 h-32 -rotate-12 animate-bounce"
                style={{ animationDuration: '8s' }}
              />
              <img
                src="/2026-wc-logo-can-copia-removebg-preview.png"
                alt="Copa 2026 Canadá"
                className="absolute top-1/4 left-1/4 w-28 h-28 rotate-6 animate-pulse"
              />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Copa do Mundo de 2026
                </div>
                <div className="flex -space-x-2 select-none">
                  <img
                    src="/2026-wc-logo-usa-copia-removebg-preview.png"
                    className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white object-contain p-0.5"
                    alt="USA Logo"
                  />
                  <img
                    src="/2026-wc-logo-mex-copia-removebg-preview.png"
                    className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white object-contain p-0.5"
                    alt="MEX Logo"
                  />
                  <img
                    src="/2026-wc-logo-can-copia-removebg-preview.png"
                    className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white object-contain p-0.5"
                    alt="CAN Logo"
                  />
                </div>
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
                {session ? (
                  <Link href="/palpites">
                    <Button
                      size="lg"
                      className="bg-emerald-600 text-zinc-50 hover:bg-emerald-500 dark:bg-emerald-50 dark:text-zinc-950 dark:hover:bg-emerald-400"
                    >
                      Dê seus palpites
                    </Button>
                  </Link>
                ) : (
                  <a href="#solicitar-convite">
                    <Button
                      size="lg"
                      className="bg-emerald-600 text-zinc-50 hover:bg-emerald-500 dark:bg-emerald-50 dark:text-zinc-950 dark:hover:bg-emerald-400"
                    >
                      Peça seu convite
                    </Button>
                  </a>
                )}
                <a href="#regras-pontuacao">
                  <Button size="lg" variant="outline">
                    Ver Regulamento
                  </Button>
                </a>
              </div>
            </div>
            {session ? (
              <div className="flex justify-center md:justify-end w-full">
                <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-amber-500 animate-pulse" />
                    <h2 className="text-lg font-bold">Maiores Campeões da Copa</h2>
                  </div>
                  <div className="space-y-3">
                    {/* Brasil */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-zinc-400 w-4">1º</span>
                        <span className="text-2xl select-none">🇧🇷</span>
                        <div>
                          <p className="font-bold text-sm">Brasil</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">1958, 1962, 1970, 1994, 2002</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                        5 títulos
                      </span>
                    </div>

                    {/* Alemanha */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-zinc-400 w-4">2º</span>
                        <span className="text-2xl select-none">🇩🇪</span>
                        <div>
                          <p className="font-bold text-sm">Alemanha</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">1954, 1974, 1990, 2014</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 px-2.5 py-1 rounded-full">
                        4 títulos
                      </span>
                    </div>

                    {/* Itália */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-zinc-400 w-4">3º</span>
                        <span className="text-2xl select-none">🇮🇹</span>
                        <div>
                          <p className="font-bold text-sm">Itália</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">1934, 1938, 1982, 2006</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
                        4 títulos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="solicitar-convite"
                className="flex justify-center md:justify-end"
              >
                <SolicitarConviteForm />
              </div>
            )}
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
                <p className="text-2xl font-bold">
                  R${' '}
                  {totalPremios.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
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
                <p className="text-2xl font-bold">
                  {totalUsuariosAtivos}{' '}
                  {totalUsuariosAtivos === 1 ? 'usuário' : 'usuários'}
                </p>
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
                  Confrontos
                </p>
                <p className="text-2xl font-bold">
                  {totalConfrontos}{' '}
                  {totalConfrontos === 1 ? 'partida' : 'partidas'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Regras de Pontuação */}
        <section
          id="regras-pontuacao"
          className="rounded-3xl border border-zinc-200 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/30"
        >
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Coluna da esquerda (ocupa 2 colunas no desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Coins className="h-3 w-3" />
                Regulamento Oficial
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Regras de Pontuação
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                O sistema de pontuação premia tanto a precisão absoluta do
                placar quanto a intuição do resultado final do jogo. Veja como
                pontuar:
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    2 pts
                  </div>
                  <h3 className="text-sm font-bold mt-1">Placar Exato</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Você acertou na mosca a quantidade exata de gols de ambas as
                    seleções.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    1 pt
                  </div>
                  <h3 className="text-sm font-bold mt-1">Resultado Final</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Você acertou a seleção vencedora ou o empate, mas errou o
                    placar exato.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                  <div className="text-2xl font-extrabold text-zinc-450 dark:text-zinc-500">
                    0 pt
                  </div>
                  <h3 className="text-sm font-bold mt-1">Sem Acertos</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Você errou o vencedor e também errou a ocorrência de empate.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna da direita (ocupa 1 coluna no desktop): Distribuição de Prêmio */}
            <div className="flex flex-col justify-between space-y-6 border-t border-zinc-200 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Trophy className="h-3 w-3" />
                  Prêmio e Pódio
                </div>
                <h3 className="text-xl font-bold mt-3 tracking-tight">
                  Distribuição do Montante
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  O prêmio total é gerado pela soma das inscrições dos
                  participantes ativos e dividido entre os 3 melhores colocados
                  no final:
                </p>
              </div>

              <div className="space-y-3 bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Pódio
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Estimativa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                    1º Lugar (70%)
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    R${' '}
                    {(totalPremios * 0.7).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-300" />
                    2º Lugar (20%)
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    R${' '}
                    {(totalPremios * 0.2).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />
                    3º Lugar (10%)
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    R${' '}
                    {(totalPremios * 0.1).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
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

                <div className="my-6 flex items-center justify-between gap-4 font-semibold animate-fade-in">
                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 select-none">
                      {partida.timeAEmoji ? (
                        <FlagImage
                          emoji={partida.timeAEmoji}
                          alt={partida.timeA}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">
                          {partida.timeA.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm truncate w-full">
                      {partida.timeA}
                    </span>
                  </div>

                  <span className="text-zinc-400 text-xs">VS</span>

                  <div className="flex flex-1 flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 select-none">
                      {partida.timeBEmoji ? (
                        <FlagImage
                          emoji={partida.timeBEmoji}
                          alt={partida.timeB}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">
                          {partida.timeB.slice(0, 3).toUpperCase()}
                        </span>
                      )}
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
