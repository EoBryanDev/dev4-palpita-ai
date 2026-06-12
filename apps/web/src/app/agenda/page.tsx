import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/ui/flag-image';
import { PageHeader } from '@/components/ui/page-header';
import {
  formatToBRLDayMonth,
  formatToBRLTime,
  formatToBRLWeekday,
  obterDataSaoPauloISO,
} from '@/helpers/date';
import type { IPartidaFormatada } from '@/interface/IPartida';
import { obterPartidas } from '@/services/partidas.service';
import { Calendar, Clock, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Agenda de Partidas - Copa 2026 | Palpita AI',
  description:
    'Confira o calendário completo de jogos da Copa do Mundo de 2026 por dia e não perca nenhum palpite.',
};

interface IAgendaPageProps {
  searchParams: Promise<{ dia?: string }>;
}

export default async function AgendaPage({
  searchParams,
}: IAgendaPageProps): Promise<React.ReactNode> {
  const { dia: selectedDia } = await searchParams;

  let allPartidas: IPartidaFormatada[] = [];

  try {
    const dbPartidas = await obterPartidas();
    allPartidas = dbPartidas.map((p) => ({
      id: p.id,
      timeA: p.timeA,
      timeB: p.timeB,
      timeAEmoji: p.timeAEmoji,
      timeBEmoji: p.timeBEmoji,
      golsTimeA: p.golsTimeA,
      golsTimeB: p.golsTimeB,
      dataInicio: p.dataInicio,
      status: p.status,
      rodada: p.rodadaNome || '',
    }));
  } catch (error) {
    console.error(
      'Erro ao buscar partidas para agenda. Usando fallback.',
      error,
    );
  }

  // Fallback caso o banco esteja vazio
  if (allPartidas.length === 0) {
    allPartidas = [
      {
        id: '1',
        timeA: 'Brasil',
        timeB: 'França',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-12T16:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
      {
        id: '2',
        timeA: 'EUA',
        timeB: 'México',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-12T19:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
      {
        id: '3',
        timeA: 'Argentina',
        timeB: 'Espanha',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-13T13:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
      {
        id: '4',
        timeA: 'Uruguai',
        timeB: 'Itália',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-13T16:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
      {
        id: '5',
        timeA: 'Alemanha',
        timeB: 'Japão',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-14T10:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
      {
        id: '6',
        timeA: 'Inglaterra',
        timeB: 'Marrocos',
        golsTimeA: null,
        golsTimeB: null,
        dataInicio: new Date('2026-06-14T13:00:00'),
        status: 'NAO_INICIADA',
        rodada: 'Rodada 1',
      },
    ];
  }

  // Agrupa partidas por dia (YYYY-MM-DD) no fuso de Brasília
  const diasDisponiveis = Array.from(
    new Set(allPartidas.map((p) => obterDataSaoPauloISO(p.dataInicio))),
  ).sort();

  // Define dia ativo default (sysdate)
  const hojeSaoPaulo = obterDataSaoPauloISO(new Date());
  const activeDia =
    selectedDia && diasDisponiveis.includes(selectedDia)
      ? selectedDia
      : diasDisponiveis.includes(hojeSaoPaulo)
        ? hojeSaoPaulo
        : diasDisponiveis[0] || '';

  // Filtra as partidas pelo dia ativo
  const partidasDoDia = allPartidas.filter(
    (p) => obterDataSaoPauloISO(p.dataInicio) === activeDia,
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-6 px-6 space-y-8 flex-1">
      <PageHeader
        title="Agenda da Copa 2026"
        description="Navegue pelos dias de competições, veja os confrontos agendados e acompanhe o andamento oficial dos placares."
        badgeText="Calendário de Jogos"
        icon={Calendar}
      />

      {/* Tabs de Dias */}
      {diasDisponiveis.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
          {diasDisponiveis.map((diaStr) => {
            // Criamos a data no fuso de Brasília para evitar desalinhamento de dias no formatador
            const date = new Date(`${diaStr}T12:00:00-03:00`);
            const formatDia = formatToBRLDayMonth(date);
            const formatSemana = formatToBRLWeekday(date);

            const isSelected = diaStr === activeDia;

            return (
              <Link key={diaStr} href={`/agenda?dia=${diaStr}`} scroll={false}>
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-3 min-w-[70px] border transition-all text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-zinc-50 dark:bg-emerald-500 dark:border-emerald-500 dark:text-zinc-950 shadow-md'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="opacity-80 uppercase text-[10px]">
                    {formatSemana}
                  </span>
                  <span className="text-sm font-bold mt-1">{formatDia}</span>
                </button>
              </Link>
            );
          })}
        </div>
      )}

      {/* Grid de Partidas */}
      {partidasDoDia.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partidasDoDia.map((partida) => {
            const timeStr = formatToBRLTime(partida.dataInicio);

            const hasFinished =
              partida.status === 'FINALIZADO' ||
              partida.status === 'FINALIZADA';
            const isLive = partida.status === 'EM_ANDAMENTO';

            return (
              <div
                key={partida.id}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900 transition-all ${
                  isLive
                    ? 'border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <span className="font-semibold text-zinc-400">
                    {partida.rodada}
                  </span>
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse dark:bg-red-950/50 dark:text-red-400">
                      Ao Vivo
                    </span>
                  ) : hasFinished ? (
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase dark:bg-zinc-800 dark:text-zinc-400">
                      Encerrado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {timeStr}
                    </span>
                  )}
                </div>

                {/* Times e Placar */}
                <div className="flex items-center justify-between gap-2 py-2">
                  {/* Time A */}
                  <div className="flex flex-1 flex-col items-center gap-2 text-center max-w-[40%]">
                    <div className="relative">
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
                      {hasFinished &&
                        partida.golsTimeA !== null &&
                        partida.golsTimeB !== null && (
                          <span
                            className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 ${
                              partida.golsTimeA > partida.golsTimeB
                                ? 'bg-emerald-500'
                                : partida.golsTimeA < partida.golsTimeB
                                  ? 'bg-red-500'
                                  : 'bg-zinc-400'
                            }`}
                          >
                            {partida.golsTimeA > partida.golsTimeB
                              ? 'V'
                              : partida.golsTimeA < partida.golsTimeB
                                ? 'D'
                                : 'E'}
                          </span>
                        )}
                    </div>
                    <span className="text-sm font-bold truncate w-full">
                      {partida.timeA}
                    </span>
                  </div>

                  {/* Placar central */}
                  <div className="flex items-center gap-3 font-extrabold text-2xl px-2">
                    {hasFinished || isLive ? (
                      <>
                        <span>{partida.golsTimeA}</span>
                        <span className="text-zinc-400 text-sm font-normal">
                          -
                        </span>
                        <span>{partida.golsTimeB}</span>
                      </>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700 text-sm font-medium">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Time B */}
                  <div className="flex flex-1 flex-col items-center gap-2 text-center max-w-[40%]">
                    <div className="relative">
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
                      {hasFinished &&
                        partida.golsTimeA !== null &&
                        partida.golsTimeB !== null && (
                          <span
                            className={`absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 ${
                              partida.golsTimeB > partida.golsTimeA
                                ? 'bg-emerald-500'
                                : partida.golsTimeB < partida.golsTimeA
                                  ? 'bg-red-500'
                                  : 'bg-zinc-400'
                            }`}
                          >
                            {partida.golsTimeB > partida.golsTimeA
                              ? 'V'
                              : partida.golsTimeB < partida.golsTimeA
                                ? 'D'
                                : 'E'}
                          </span>
                        )}
                    </div>
                    <span className="text-sm font-bold truncate w-full">
                      {partida.timeB}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ID: {partida.id.slice(0, 8)}
                  </span>
                  {!hasFinished ? (
                    <Link href="/login">
                      <Button size="xs" variant="outline">
                        Palpitar
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href="/ranking"
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Trophy className="h-3 w-3" />
                      Ver Ranking
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
          <Calendar className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-semibold mt-4">
            Nenhuma partida para este dia
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Selecione outro dia no calendário acima.
          </p>
        </div>
      )}
    </div>
  );
}
