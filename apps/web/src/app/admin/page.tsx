import { obterValorPalpite } from '@/app/actions/admin';
import { obterSessao } from '@/app/actions/auth';
import { AdminConfiguracoesClient } from '@/components/admin-configuracoes-client';
import { db, palpites, partidas, rodadas, usuarios } from '@palpita/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import {
  ArrowRight,
  Calendar,
  MailWarning,
  Percent,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Dashboard | Palpita AI',
  description: 'Visão geral das estatísticas do bolão Palpita AI.',
};

export default async function AdminDashboardPage() {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    redirect('/meu-espaco');
  }

  // 1. Total de usuários
  const allUsers = await db.select().from(usuarios);
  const totalUsuarios = allUsers.length;

  // 2. Total de usuários com status LIBERADO
  const totalLiberados = allUsers.filter((u) => u.status === 'LIBERADO').length;

  // 2.1 Buscar o valor configurado do palpite
  const valorPalpite = await obterValorPalpite();

  // 3. Total de convites pendentes (usuários no status PENDENTE)
  const totalPendentes = allUsers.filter((u) => u.status === 'PENDENTE').length;

  // 4. Buscar a rodada ativa, ou senão a última rodada criada
  const rodadaAtiva =
    (await db.query.rodadas.findFirst({
      where: eq(rodadas.ativa, true),
    })) ||
    (await db.query.rodadas.findFirst({
      orderBy: desc(rodadas.numero),
    }));

  let totalPartidas = 0;
  let totalPalpitesRealizados = 0;
  let totalEsperado = 0;
  let percentualSubmetidos = 0;

  if (rodadaAtiva) {
    const dbPartidas = await db
      .select()
      .from(partidas)
      .where(eq(partidas.rodadaId, rodadaAtiva.id));

    totalPartidas = dbPartidas.length;
    totalEsperado = totalLiberados * totalPartidas;

    if (totalPartidas > 0 && totalLiberados > 0) {
      const partidaIds = dbPartidas.map((p) => p.id);
      const usuariosLiberados = allUsers.filter((u) => u.status === 'LIBERADO');
      const usuarioIds = usuariosLiberados.map((u) => u.id);

      const resultPalpites = await db
        .select({ id: palpites.id })
        .from(palpites)
        .where(
          and(
            inArray(palpites.partidaId, partidaIds),
            inArray(palpites.usuarioId, usuarioIds),
          ),
        );

      totalPalpitesRealizados = resultPalpites.length;
      percentualSubmetidos = Math.round(
        (totalPalpitesRealizados / totalEsperado) * 100,
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Painel de Controle do Administrador
        </h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2">
          Monitore o engajamento de palpites, libere apostadores e acompanhe a
          rodada atual.
        </p>
      </div>

      {/* Bento Grid de Resumo */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {/* Card 1: Total de Usuários */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/85 bg-white p-6 shadow-sm dark:border-zinc-800/85 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Total de Usuários
              </span>
              <span className="text-3xl font-black">{totalUsuarios}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Usuários Confirmados (LIBERADO) */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/85 bg-white p-6 shadow-sm dark:border-zinc-800/85 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Confirmados (Liberados)
              </span>
              <span className="text-3xl font-black">{totalLiberados}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Convites Pendentes */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/85 bg-white p-6 shadow-sm dark:border-zinc-800/85 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <MailWarning className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Solicitações Pendentes
              </span>
              <span className="text-3xl font-black">{totalPendentes}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Palpites Enviados */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/85 bg-white p-6 shadow-sm dark:border-zinc-800/85 dark:bg-zinc-900/40">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Palpites na Rodada
              </span>
              <span className="text-3xl font-black">
                {percentualSubmetidos}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seções Adicionais */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Coluna 1 & 2: Rodada Ativa e Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Rodada Atual e Engajamento
            </h3>

            {rodadaAtiva ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      Rodada
                    </span>
                    <h4 className="text-md font-bold">{rodadaAtiva.nome}</h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      Partidas da Rodada
                    </span>
                    <p className="text-md font-bold">
                      {totalPartidas} {totalPartidas === 1 ? 'Jogo' : 'Jogos'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-500 uppercase">
                      Progresso de Palpites
                    </span>
                    <span>
                      {totalPalpitesRealizados} de {totalEsperado} palpites
                      esperados
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-150 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(percentualSubmetidos, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-zinc-500">
                Nenhuma rodada cadastrada ou ativa no momento.
              </div>
            )}
          </div>

          {/* Configurações de Valor e Prêmios */}
          <AdminConfiguracoesClient
            totalLiberados={totalLiberados}
            valorInicial={valorPalpite}
          />
        </div>

        {/* Coluna 3: Atalhos Administrativos */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-amber-500" />
              Acesso Rápido
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/usuarios"
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-emerald-500/30 bg-zinc-50 hover:bg-emerald-50/20 dark:border-zinc-800 dark:hover:border-emerald-500/20 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 transition-all group"
              >
                <div>
                  <h4 className="text-sm font-bold">Gerenciar Usuários</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {totalPendentes}{' '}
                    {totalPendentes === 1
                      ? 'solicitação pendente'
                      : 'solicitações pendentes'}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </Link>

              <Link
                href="/admin/partidas"
                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-emerald-500/30 bg-zinc-50 hover:bg-emerald-50/20 dark:border-zinc-800 dark:hover:border-emerald-500/20 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 transition-all group"
              >
                <div>
                  <h4 className="text-sm font-bold">Gerenciar Partidas</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Cadastre jogos e lance placares oficiais
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
