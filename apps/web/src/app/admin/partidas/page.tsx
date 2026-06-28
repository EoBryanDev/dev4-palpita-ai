import { obterValorPalpite } from '@/app/actions/admin';
import { obterSessao } from '@/app/actions/auth';
import { AdminPartidasClient } from '@/components/admin-partidas-client';
import { obterPalpitesConfirmadosCount } from '@/services/palpites.service';
import { obterPartidas } from '@/services/partidas.service';
import { obterRodadaAtiva, obterRodadas } from '@/services/rodadas.service';
import { obterTimes } from '@/services/times.service';
import { obterResumoStatusUsuarios } from '@/services/usuarios.service';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Partidas | Palpita AI',
  description: 'Gerenciamento de rodadas, jogos e resultados do Palpita AI.',
};

export default async function AdminPartidasPage() {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    redirect('/meu-espaco');
  }

  // 1. Buscar todas as rodadas
  const allRodadas = await obterRodadas();

  // 2. Buscar todas as partidas e fazer join com rodada e times para obter nomes e emojis
  const allPartidas = await obterPartidas();

  // 3. Buscar todos os times cadastrados
  const allTimes = await obterTimes();

  // 4. Buscar dados para o card de engajamento da rodada atual
  const allUsers = await obterResumoStatusUsuarios();
  const totalLiberados = allUsers.filter((u) => u.status === 'LIBERADO').length;
  const rodadaAtiva = await obterRodadaAtiva();

  let totalPartidasRodada = 0;
  let totalEsperado = 0;
  let totalPalpitesRealizados = 0;
  let percentualSubmetidos = 0;

  if (rodadaAtiva) {
    const dbPartidas = await obterPartidas(rodadaAtiva.id);
    totalPartidasRodada = dbPartidas.length;
    totalEsperado = totalLiberados * totalPartidasRodada;

    if (totalPartidasRodada > 0 && totalLiberados > 0) {
      const partidaIds = dbPartidas.map((p) => p.id);
      const usuariosLiberados = allUsers.filter((u) => u.status === 'LIBERADO');
      const usuarioIds = usuariosLiberados.map((u) => u.id);
      totalPalpitesRealizados = await obterPalpitesConfirmadosCount(
        partidaIds,
        usuarioIds,
      );
      percentualSubmetidos = Math.round(
        (totalPalpitesRealizados / totalEsperado) * 100,
      );
    }
  }

  // Mapear dados para formatos compatíveis com Client Component
  const mappedRodadas = allRodadas.map((r) => ({
    id: r.id,
    numero: r.numero,
    nome: r.nome,
    ativa: r.ativa,
    tipo: r.tipo,
  }));

  const mappedRodadaAtiva = rodadaAtiva
    ? {
        id: rodadaAtiva.id,
        numero: rodadaAtiva.numero,
        nome: rodadaAtiva.nome,
        ativa: rodadaAtiva.ativa,
        tipo: rodadaAtiva.tipo,
      }
    : null;

  const mappedPartidas = allPartidas.map((p) => ({
    id: p.id,
    rodadaId: p.rodadaId,
    timeA: p.timeA,
    timeB: p.timeB,
    timeAEmoji: p.timeAEmoji,
    timeBEmoji: p.timeBEmoji,
    golsTimeA: p.golsTimeA,
    golsTimeB: p.golsTimeB,
    dataInicio: p.dataInicio.toISOString(),
    status: p.status,
    rodadaNome: p.rodadaNome,
    decididoEm: p.decididoEm,
    timeVencedorPenaltis: p.timeVencedorPenaltis,
    tipoRodada: p.rodadaTipo,
  }));

  const mappedTimes = allTimes.map((t) => ({
    id: t.id,
    nome: t.nome,
    emoji: t.emoji,
    grupo: t.grupo,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Painel de Jogos e Resultados
        </h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2">
          Cadastre novas rodadas, adicione confrontos e faça o lançamento de
          placares oficiais do bolão.
        </p>
      </div>
      <AdminPartidasClient
        rodadas={mappedRodadas}
        partidas={mappedPartidas}
        times={mappedTimes}
        rodadaAtiva={mappedRodadaAtiva}
        totalPartidasRodada={totalPartidasRodada}
        totalEsperado={totalEsperado}
        totalPalpitesRealizados={totalPalpitesRealizados}
        percentualSubmetidos={percentualSubmetidos}
        totalLiberados={totalLiberados}
      />
    </div>
  );
}
