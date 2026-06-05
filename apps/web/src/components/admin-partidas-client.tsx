'use client';

import {
  criarPartida,
  criarRodada,
  lancarResultadoOficial,
} from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Play,
  Plus,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface IRodadaAdmin {
  id: string;
  numero: number;
  nome: string;
  ativa: boolean;
}

export interface IPartidaAdmin {
  id: string;
  rodadaId: string;
  timeA: string;
  timeB: string;
  timeAEmoji?: string;
  timeBEmoji?: string;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodadaNome: string;
}

export interface ITimeAdmin {
  id: string;
  nome: string;
  emoji: string;
  grupo: string;
}

interface IAdminPartidasClientProps {
  rodadas: IRodadaAdmin[];
  partidas: IPartidaAdmin[];
  times: ITimeAdmin[];
}

export function AdminPartidasClient({
  rodadas,
  partidas,
  times,
}: IAdminPartidasClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Estados para Criação de Rodada
  const [novaRodadaNum, setNovaRodadaNum] = useState('');
  const [novaRodadaNome, setNovaRodadaNome] = useState('');

  // Estados para Criação de Partida
  const [partidaRodadaId, setPartidaRodadaId] = useState('');
  const [partidaTimeA, setPartidaTimeA] = useState('');
  const [partidaTimeB, setPartidaTimeB] = useState('');
  const [partidaDataInicio, setPartidaDataInicio] = useState('');

  // Estados para Lancamento de Placar
  const [placares, setPlacares] = useState<
    Record<string, { golsA: string; golsB: string }>
  >({});

  const handleCriarRodada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRodadaNum || !novaRodadaNome) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o número e o nome da rodada.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await criarRodada(
        Number(novaRodadaNum),
        novaRodadaNome.trim(),
      );
      if (res.success) {
        toast({
          title: 'Rodada Criada!',
          description: res.message,
        });
        setNovaRodadaNum('');
        setNovaRodadaNome('');
        router.refresh();
      } else {
        toast({
          title: 'Erro ao criar rodada',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleCriarPartida = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !partidaRodadaId ||
      !partidaTimeA ||
      !partidaTimeB ||
      !partidaDataInicio
    ) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todas as informações da partida.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await criarPartida(
        partidaRodadaId,
        partidaTimeA,
        partidaTimeB,
        partidaDataInicio,
      );
      if (res.success) {
        toast({
          title: 'Partida Criada!',
          description: res.message,
        });
        setPartidaTimeA('');
        setPartidaTimeB('');
        setPartidaDataInicio('');
        router.refresh();
      } else {
        toast({
          title: 'Erro ao criar partida',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleLancarResultado = (partidaId: string) => {
    const placar = placares[partidaId];
    if (!placar || placar.golsA === '' || placar.golsB === '') {
      toast({
        title: 'Placar incompleto',
        description: 'Digite os gols de ambos os times antes de finalizar.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const res = await lancarResultadoOficial(
        partidaId,
        Number(placar.golsA),
        Number(placar.golsB),
      );
      if (res.success) {
        toast({
          title: 'Resultado Lançado!',
          description: res.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'Erro ao lançar placar',
          description: res.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handlePlacarChange = (
    partidaId: string,
    time: 'A' | 'B',
    val: string,
  ) => {
    const lim = val.replace(/\D/g, ''); // Apenas números
    setPlacares((prev) => ({
      ...prev,
      [partidaId]: {
        golsA: time === 'A' ? lim : prev[partidaId]?.golsA || '',
        golsB: time === 'B' ? lim : prev[partidaId]?.golsB || '',
      },
    }));
  };

  // Separação de partidas por rodada
  const partidasAgrupadas = rodadas.reduce(
    (acc, rodada) => {
      acc[rodada.id] = partidas.filter((p) => p.rodadaId === rodada.id);
      return acc;
    },
    {} as Record<string, IPartidaAdmin[]>,
  );

  return (
    <div className="space-y-10">
      {/* Formulários de Cadastro - Grid Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adicionar Rodada */}
        <div className="lg:col-span-1 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 space-y-4">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Cadastrar Rodada
          </h3>
          <form onSubmit={handleCriarRodada} className="space-y-3">
            <div>
              <label
                htmlFor="novaRodadaNum"
                className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Número da Rodada
              </label>
              <input
                id="novaRodadaNum"
                type="number"
                min="1"
                required
                placeholder="Ex: 1"
                value={novaRodadaNum}
                onChange={(e) => setNovaRodadaNum(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-55/30 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label
                htmlFor="novaRodadaNome"
                className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Nome da Rodada
              </label>
              <input
                id="novaRodadaNome"
                type="text"
                required
                placeholder="Ex: Rodada de Abertura"
                value={novaRodadaNome}
                onChange={(e) => setNovaRodadaNome(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-55/30 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs h-10 mt-2 flex items-center justify-center gap-1.5 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
            >
              <Plus className="h-4.5 w-4.5" />
              Salvar Rodada
            </Button>
          </form>
        </div>

        {/* Adicionar Partida */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 space-y-4">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Cadastrar Jogo / Partida
          </h3>
          <form
            onSubmit={handleCriarPartida}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="partidaRodadaId"
                  className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Rodada Correspondente
                </label>
                <select
                  id="partidaRodadaId"
                  required
                  value={partidaRodadaId}
                  onChange={(e) => setPartidaRodadaId(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  <option value="">Selecione a rodada...</option>
                  {rodadas.map((r) => (
                    <option key={r.id} value={r.id}>
                      Rodada {r.numero} - {r.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="partidaTimeA"
                  className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Time A (Mandante)
                </label>
                <select
                  id="partidaTimeA"
                  required
                  value={partidaTimeA}
                  onChange={(e) => setPartidaTimeA(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  <option value="">Selecione o Time A...</option>
                  {times.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji} {t.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="partidaTimeB"
                  className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Time B (Visitante)
                </label>
                <select
                  id="partidaTimeB"
                  required
                  value={partidaTimeB}
                  onChange={(e) => setPartidaTimeB(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  <option value="">Selecione o Time B...</option>
                  {times.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji} {t.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="partidaDataInicio"
                  className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Data e Horário de Início
                </label>
                <input
                  id="partidaDataInicio"
                  type="datetime-local"
                  required
                  value={partidaDataInicio}
                  onChange={(e) => setPartidaDataInicio(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-55/30 px-3 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs h-10 flex items-center justify-center gap-1.5 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                <Plus className="h-4.5 w-4.5" />
                Cadastrar Jogo
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Seção 2: Visualização e Lançamento de Resultados agrupados por Rodada */}
      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Confrontos e Resultados por Rodada
        </h3>

        {rodadas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-400 dark:text-zinc-500">
            Cadastre a primeira rodada acima para exibir e gerenciar as
            partidas.
          </div>
        ) : (
          <div className="space-y-8">
            {rodadas
              .sort((a, b) => a.numero - b.numero)
              .map((rodada) => {
                const partidasDaRodada = partidasAgrupadas[rodada.id] || [];

                return (
                  <div key={rodada.id} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-250 dark:border-zinc-800 pb-2">
                      <span className="text-sm font-black px-2.5 py-0.5 rounded-lg bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        Rodada {rodada.numero}
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {rodada.nome}
                      </h4>
                    </div>

                    {partidasDaRodada.length === 0 ? (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 italic pl-2">
                        Nenhum confronto cadastrado nesta rodada.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {partidasDaRodada.map((partida) => {
                          const isFinalizado =
                            partida.status === 'FINALIZADO' ||
                            partida.status === 'FINALIZADA';

                          const isJogoNoFuturo =
                            new Date() < new Date(partida.dataInicio);

                          const dataFormatada = new Date(
                            partida.dataInicio,
                          ).toLocaleString('pt-BR', {
                            timeZone: 'America/Sao_Paulo',
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          const placarA = placares[partida.id]?.golsA ?? '';
                          const placarB = placares[partida.id]?.golsB ?? '';

                          return (
                            <div
                              key={partida.id}
                              className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 flex flex-col justify-between gap-4 transition-all hover:border-zinc-350 dark:hover:border-zinc-700"
                            >
                              {/* Header Card */}
                              <div className="flex justify-between items-center text-xs text-zinc-400">
                                <span>{dataFormatada}</span>
                                {isFinalizado ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    Finalizado
                                  </span>
                                ) : isJogoNoFuturo ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-455 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-blue-500" />
                                    Futuro
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-1">
                                    <Play className="h-3 w-3 animate-pulse" />
                                    Agendado
                                  </span>
                                )}
                              </div>

                              {/* Times e Placar */}
                              <div className="flex items-center justify-between gap-2 py-2">
                                <div className="flex-1 text-right font-black text-sm truncate flex items-center justify-end gap-1.5">
                                  <span>{partida.timeA}</span>
                                  {partida.timeAEmoji && (
                                    <span className="text-base">
                                      {partida.timeAEmoji}
                                    </span>
                                  )}
                                </div>

                                {/* Area Placar */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {isFinalizado ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-black text-sm">
                                      <span>{partida.golsTimeA}</span>
                                      <span className="text-zinc-400 text-xs">
                                        x
                                      </span>
                                      <span>{partida.golsTimeB}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        maxLength={2}
                                        placeholder="-"
                                        value={placarA}
                                        onChange={(e) =>
                                          handlePlacarChange(
                                            partida.id,
                                            'A',
                                            e.target.value,
                                          )
                                        }
                                        disabled={isPending || isJogoNoFuturo}
                                        className="h-9 w-9 text-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                      <span className="text-zinc-400 text-xs">
                                        x
                                      </span>
                                      <input
                                        type="text"
                                        maxLength={2}
                                        placeholder="-"
                                        value={placarB}
                                        onChange={(e) =>
                                          handlePlacarChange(
                                            partida.id,
                                            'B',
                                            e.target.value,
                                          )
                                        }
                                        disabled={isPending || isJogoNoFuturo}
                                        className="h-9 w-9 text-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 text-left font-black text-sm truncate flex items-center justify-start gap-1.5">
                                  {partida.timeBEmoji && (
                                    <span className="text-base">
                                      {partida.timeBEmoji}
                                    </span>
                                  )}
                                  <span>{partida.timeB}</span>
                                </div>
                              </div>

                              {/* Ação Finalizar */}
                              {!isFinalizado && (
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                  {isJogoNoFuturo ? (
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                      Não iniciado
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  <Button
                                    size="sm"
                                    disabled={isPending || isJogoNoFuturo}
                                    onClick={() =>
                                      handleLancarResultado(partida.id)
                                    }
                                    className="bg-zinc-900 hover:bg-zinc-850 text-white font-semibold text-xs px-3 h-8 rounded-xl flex items-center gap-1 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Finalizar Jogo
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
