'use client';

import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/ui/flag-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  useMutationAtualizarTipoRodada,
  useMutationCriarPartida,
  useMutationCriarRodada,
  useMutationLancarResultadoOficial,
} from '@/hooks/mutations/useMutationPartidas';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Percent,
  Play,
  Plus,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type {
  IAdminPartidasClientProps,
  IPartidaAdmin,
  IRodadaAdmin,
  ITimeAdmin,
} from '@/interface/IAdmin';

export function AdminPartidasClient({
  rodadas,
  partidas,
  times,
  rodadaAtiva,
  totalPartidasRodada,
  totalEsperado,
  totalPalpitesRealizados,
  percentualSubmetidos,
  totalLiberados,
}: IAdminPartidasClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const mutationCriarRodada = useMutationCriarRodada();
  const mutationCriarPartida = useMutationCriarPartida();
  const mutationAtualizarTipoRodada = useMutationAtualizarTipoRodada();
  const mutationLancarResultadoOficial = useMutationLancarResultadoOficial();

  const isPending =
    mutationCriarRodada.isPending ||
    mutationCriarPartida.isPending ||
    mutationAtualizarTipoRodada.isPending ||
    mutationLancarResultadoOficial.isPending;

  // Estados para Criação de Rodada
  const [novaRodadaNum, setNovaRodadaNum] = useState('');
  const [novaRodadaNome, setNovaRodadaNome] = useState('');
  const [novaRodadaMataMata, setNovaRodadaMataMata] = useState(false);

  // Estados para Criação de Partida
  const [partidaRodadaId, setPartidaRodadaId] = useState('');
  const [partidaTimeA, setPartidaTimeA] = useState('');
  const [partidaTimeB, setPartidaTimeB] = useState('');
  const [partidaDataInicio, setPartidaDataInicio] = useState('');

  // Estados para Lancamento de Placar
  const [placares, setPlacares] = useState<
    Record<string, { golsA: string; golsB: string }>
  >({});

  const [decididoEmValores, setDecididoEmValores] = useState<
    Record<string, 'NORMAL' | 'PRORROGACAO' | 'PENALTIS'>
  >({});

  const [timeVencedorPenaltisValores, setTimeVencedorPenaltisValores] =
    useState<Record<string, 'A' | 'B'>>({});

  const [editingPartidas, setEditingPartidas] = useState<
    Record<string, boolean>
  >({});

  const handleRevisarPartida = (partida: IPartidaAdmin) => {
    setEditingPartidas((prev) => ({ ...prev, [partida.id]: true }));
    setPlacares((prev) => ({
      ...prev,
      [partida.id]: {
        golsA: String(partida.golsTimeA ?? ''),
        golsB: String(partida.golsTimeB ?? ''),
      },
    }));
    setDecididoEmValores((prev) => ({
      ...prev,
      [partida.id]:
        (partida.decididoEm as 'NORMAL' | 'PRORROGACAO' | 'PENALTIS') ??
        'NORMAL',
    }));
    if (partida.timeVencedorPenaltis) {
      setTimeVencedorPenaltisValores((prev) => ({
        ...prev,
        [partida.id]: partida.timeVencedorPenaltis as 'A' | 'B',
      }));
    }
  };

  const handleCancelarRevisao = (partidaId: string) => {
    setEditingPartidas((prev) => ({ ...prev, [partidaId]: false }));
    setTimeVencedorPenaltisValores((prev) => {
      const next = { ...prev };
      delete next[partidaId];
      return next;
    });
  };

  // Estado de paginação por rodada (6 partidas visíveis por padrão)
  const PARTIDAS_POR_PAGINA = 6;
  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>(
    {},
  );

  const handleVerMais = (rodadaId: string) => {
    setVisibleLimits((prev) => ({
      ...prev,
      [rodadaId]: (prev[rodadaId] ?? PARTIDAS_POR_PAGINA) + PARTIDAS_POR_PAGINA,
    }));
  };

  const handleCriarRodada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRodadaNum || !novaRodadaNome) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o número e o nome da rodada.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await mutationCriarRodada.mutateAsync({
        numero: Number(novaRodadaNum),
        nome: novaRodadaNome.trim(),
        tipo: novaRodadaMataMata ? 'MATAMATA' : 'GRUPO',
      });
      toast({
        title: 'Rodada Criada!',
        description: res.message,
      });
      setNovaRodadaNum('');
      setNovaRodadaNome('');
      setNovaRodadaMataMata(false);
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao criar rodada',
        description: err.message || 'Erro ao criar rodada.',
        variant: 'destructive',
      });
    }
  };

  const handleCriarPartida = async (e: React.FormEvent) => {
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

    try {
      const res = await mutationCriarPartida.mutateAsync({
        rodadaId: partidaRodadaId,
        timeAId: partidaTimeA,
        timeBId: partidaTimeB,
        dataInicio: partidaDataInicio,
      });
      toast({
        title: 'Partida Criada!',
        description: res.message,
      });
      setPartidaTimeA('');
      setPartidaTimeB('');
      setPartidaDataInicio('');
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao criar partida',
        description: err.message || 'Erro ao criar partida.',
        variant: 'destructive',
      });
    }
  };

  const handleLancarResultado = async (partidaId: string) => {
    const placar = placares[partidaId];
    if (!placar || placar.golsA === '' || placar.golsB === '') {
      toast({
        title: 'Placar incompleto',
        description: 'Digite os gols de ambos os times antes de finalizar.',
        variant: 'destructive',
      });
      return;
    }

    const decididoEm = decididoEmValores[partidaId] ?? 'NORMAL';
    const timeVencedorPenaltis = timeVencedorPenaltisValores[partidaId];

    try {
      const res = await mutationLancarResultadoOficial.mutateAsync({
        partidaId,
        golsTimeA: Number(placar.golsA),
        golsTimeB: Number(placar.golsB),
        decididoEm,
        timeVencedorPenaltis,
      });
      toast({
        title: 'Resultado Lançado!',
        description: res.message,
      });
      setEditingPartidas((prev) => ({ ...prev, [partidaId]: false }));
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: 'Erro ao lançar placar',
        description: err.message || 'Erro ao lançar placar.',
        variant: 'destructive',
      });
    }
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

  // Separação e ordenação de partidas por rodada
  // Ordem: futuras e em andamento primeiro; finalizadas ao final
  const partidasAgrupadas = rodadas.reduce(
    (acc, rodada) => {
      const todas = partidas.filter((p) => p.rodadaId === rodada.id);
      const ordenadas = [...todas].sort((a, b) => {
        const aFinalizado =
          a.status === 'FINALIZADO' || a.status === 'FINALIZADA';
        const bFinalizado =
          b.status === 'FINALIZADO' || b.status === 'FINALIZADA';
        if (aFinalizado !== bFinalizado) return aFinalizado ? 1 : -1;
        return (
          new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
        );
      });
      acc[rodada.id] = ordenadas;
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
              <Label htmlFor="novaRodadaNum">Número da Rodada</Label>
              <Input
                id="novaRodadaNum"
                type="number"
                min="1"
                required
                placeholder="Ex: 1"
                value={novaRodadaNum}
                onChange={(e) => setNovaRodadaNum(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="novaRodadaNome">Nome da Rodada</Label>
              <Input
                id="novaRodadaNome"
                type="text"
                required
                placeholder="Ex: Rodada de Abertura"
                value={novaRodadaNome}
                onChange={(e) => setNovaRodadaNome(e.target.value)}
                disabled={isPending}
              />
            </div>
            {/* Toggle Mata-Mata */}
            <label
              htmlFor="novaRodadaMataMata"
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="relative">
                <input
                  id="novaRodadaMataMata"
                  type="checkbox"
                  checked={novaRodadaMataMata}
                  onChange={(e) => setNovaRodadaMataMata(e.target.checked)}
                  disabled={isPending}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-amber-500 dark:peer-checked:bg-amber-400 transition-colors duration-200" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-has-[:checked]:text-amber-600 dark:group-has-[:checked]:text-amber-400">
                  Fase Mata-Mata
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
                  Habilita palpite do momento da decisão (+1 pt)
                </p>
              </div>
            </label>
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
                <Label htmlFor="partidaRodadaId">Rodada Correspondente</Label>
                <Select
                  id="partidaRodadaId"
                  required
                  value={partidaRodadaId}
                  onChange={(e) => setPartidaRodadaId(e.target.value)}
                  disabled={isPending}
                >
                  <option
                    value=""
                    className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    Selecione a rodada...
                  </option>
                  {rodadas.map((r) => (
                    <option
                      key={r.id}
                      value={r.id}
                      className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      Rodada {r.numero} - {r.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="partidaTimeA">Time A (Mandante)</Label>
                <Select
                  id="partidaTimeA"
                  required
                  value={partidaTimeA}
                  onChange={(e) => setPartidaTimeA(e.target.value)}
                  disabled={isPending}
                >
                  <option
                    value=""
                    className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    Selecione o Time A...
                  </option>
                  {times.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      {t.emoji} {t.nome}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="partidaTimeB">Time B (Visitante)</Label>
                <Select
                  id="partidaTimeB"
                  required
                  value={partidaTimeB}
                  onChange={(e) => setPartidaTimeB(e.target.value)}
                  disabled={isPending}
                >
                  <option
                    value=""
                    className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    Selecione o Time B...
                  </option>
                  {times.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                      {t.emoji} {t.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="partidaDataInicio">
                  Data e Horário de Início
                </Label>
                <Input
                  id="partidaDataInicio"
                  type="datetime-local"
                  required
                  value={partidaDataInicio}
                  onChange={(e) => setPartidaDataInicio(e.target.value)}
                  disabled={isPending}
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

      {/* Seção 2: Rodada Atual e Engajamento */}
      {rodadaAtiva && (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/30 space-y-4">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Rodada Atual e Engajamento
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase">
                  Rodada
                </span>
                <h4 className="text-md font-bold">{rodadaAtiva.nome}</h4>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    Partidas
                  </span>
                  <p className="text-md font-bold">{totalPartidasRodada}</p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    Liberados
                  </span>
                  <p className="text-md font-bold flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                    {totalLiberados}
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-500 uppercase">
                    Palpites
                  </span>
                  <p className="text-md font-bold flex items-center gap-1">
                    <Percent className="h-4 w-4 text-purple-500" />
                    {percentualSubmetidos}%
                  </p>
                </div>
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
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(percentualSubmetidos, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção 3: Visualização e Lançamento de Resultados agrupados por Rodada */}
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
                  <div
                    key={rodada.id}
                    className={`space-y-4 ${rodadaAtiva?.id === rodada.id ? 'p-4 -mx-4 rounded-3xl border-2 border-emerald-400/40 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-950/10' : ''}`}
                  >
                    <div className="flex items-center gap-2 border-b border-zinc-250 dark:border-zinc-800 pb-2 min-w-0">
                      <span
                        className={`text-sm font-black px-2.5 py-0.5 rounded-lg shrink-0 ${rodadaAtiva?.id === rodada.id ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950' : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}
                      >
                        Rodada {rodada.numero}
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex-1 min-w-0 truncate">
                        {rodada.nome}
                      </h4>
                      {rodadaAtiva?.id === rodada.id && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Atual
                        </span>
                      )}
                      {/* Toggle Mata-Mata inline por rodada */}
                      <label
                        htmlFor={`rodada-tipo-${rodada.id}`}
                        className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
                        title={
                          rodada.tipo === 'MATAMATA'
                            ? 'Clique para mudar para Fase de Grupos'
                            : 'Clique para marcar como Mata-Mata'
                        }
                      >
                        <div className="relative">
                          <input
                            id={`rodada-tipo-${rodada.id}`}
                            type="checkbox"
                            checked={rodada.tipo === 'MATAMATA'}
                            disabled={isPending}
                            onChange={async () => {
                              const novoTipo =
                                rodada.tipo === 'MATAMATA'
                                  ? 'GRUPO'
                                  : 'MATAMATA';
                              try {
                                await mutationAtualizarTipoRodada.mutateAsync({
                                  rodadaId: rodada.id,
                                  tipo: novoTipo,
                                });
                                toast({
                                  title: `Rodada ${rodada.numero} atualizada para ${novoTipo === 'MATAMATA' ? 'Mata-Mata' : 'Fase de Grupos'}`,
                                });
                                router.refresh();
                              } catch (err) {
                                const e = err as { message?: string };
                                toast({
                                  title: 'Erro',
                                  description: e.message,
                                  variant: 'destructive',
                                });
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700 peer-checked:bg-amber-500 dark:peer-checked:bg-amber-400 transition-colors duration-200" />
                          <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                        </div>
                        <span
                          className={`text-xs font-bold transition-colors ${rodada.tipo === 'MATAMATA' ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`}
                        >
                          {rodada.tipo === 'MATAMATA'
                            ? '⚡ Mata-Mata'
                            : 'Grupos'}
                        </span>
                      </label>
                    </div>

                    {partidasDaRodada.length === 0 ? (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 italic pl-2">
                        Nenhum confronto cadastrado nesta rodada.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {partidasDaRodada
                            .slice(
                              0,
                              visibleLimits[rodada.id] ?? PARTIDAS_POR_PAGINA,
                            )
                            .map((partida) => {
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
                                        <FlagImage
                                          emoji={partida.timeAEmoji}
                                          alt={partida.timeA}
                                          className="h-4 w-4 shrink-0"
                                        />
                                      )}
                                    </div>

                                    {/* Area Placar */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      {isFinalizado &&
                                      !editingPartidas[partida.id] ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-black text-sm">
                                            <span>{partida.golsTimeA}</span>
                                            <span className="text-zinc-400 text-xs">
                                              x
                                            </span>
                                            <span>{partida.golsTimeB}</span>
                                          </div>
                                          {partida.tipoRodada ===
                                            'MATAMATA' && (
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                              {partida.decididoEm ===
                                              'PRORROGACAO'
                                                ? 'Prorrogação'
                                                : partida.decididoEm ===
                                                    'PENALTIS'
                                                  ? partida.timeVencedorPenaltis
                                                    ? `Pênaltis (${partida.timeVencedorPenaltis === 'A' ? partida.timeA : partida.timeB})`
                                                    : 'Pênaltis'
                                                  : 'Tempo Normal'}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center gap-2">
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
                                              disabled={
                                                isPending ||
                                                (isJogoNoFuturo &&
                                                  !editingPartidas[partida.id])
                                              }
                                              className="h-9 w-9 text-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
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
                                              disabled={
                                                isPending ||
                                                (isJogoNoFuturo &&
                                                  !editingPartidas[partida.id])
                                              }
                                              className="h-9 w-9 text-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                                            />
                                          </div>
                                          {partida.tipoRodada ===
                                            'MATAMATA' && (
                                            <>
                                              <select
                                                value={
                                                  decididoEmValores[
                                                    partida.id
                                                  ] ?? 'NORMAL'
                                                }
                                                onChange={(e) =>
                                                  setDecididoEmValores(
                                                    (prev) => ({
                                                      ...prev,
                                                      [partida.id]: e.target
                                                        .value as
                                                        | 'NORMAL'
                                                        | 'PRORROGACAO'
                                                        | 'PENALTIS',
                                                    }),
                                                  )
                                                }
                                                disabled={isPending}
                                                className="text-[10px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 font-bold outline-none text-zinc-800 dark:text-zinc-200"
                                              >
                                                <option value="NORMAL">
                                                  Tempo Normal
                                                </option>
                                                <option value="PRORROGACAO">
                                                  Prorrogação
                                                </option>
                                                <option value="PENALTIS">
                                                  Pênaltis
                                                </option>
                                              </select>
                                              {(decididoEmValores[partida.id] ??
                                                'NORMAL') === 'PENALTIS' &&
                                                placarA !== '' &&
                                                placarB !== '' &&
                                                Number(placarA) ===
                                                  Number(placarB) && (
                                                  <select
                                                    value={
                                                      timeVencedorPenaltisValores[
                                                        partida.id
                                                      ] ?? ''
                                                    }
                                                    onChange={(e) =>
                                                      setTimeVencedorPenaltisValores(
                                                        (prev) => ({
                                                          ...prev,
                                                          [partida.id]: e.target
                                                            .value as 'A' | 'B',
                                                        }),
                                                      )
                                                    }
                                                    disabled={isPending}
                                                    className="text-[10px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-1 font-bold outline-none text-amber-800 dark:text-amber-200"
                                                  >
                                                    <option value="">
                                                      Vencedor pênaltis?
                                                    </option>
                                                    <option value="A">
                                                      {partida.timeA}
                                                    </option>
                                                    <option value="B">
                                                      {partida.timeB}
                                                    </option>
                                                  </select>
                                                )}
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 text-left font-black text-sm truncate flex items-center justify-start gap-1.5">
                                      {partida.timeBEmoji && (
                                        <FlagImage
                                          emoji={partida.timeBEmoji}
                                          alt={partida.timeB}
                                          className="h-4 w-4 shrink-0"
                                        />
                                      )}
                                      <span>{partida.timeB}</span>
                                    </div>
                                  </div>

                                  {/* Ação Finalizar / Revisar */}
                                  {!isFinalizado ||
                                  editingPartidas[partida.id] ? (
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                      {isJogoNoFuturo &&
                                      !editingPartidas[partida.id] ? (
                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                          Não iniciado
                                        </span>
                                      ) : isFinalizado ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            handleCancelarRevisao(partida.id)
                                          }
                                          className="text-xs text-zinc-500 hover:text-zinc-700 h-8 rounded-xl"
                                        >
                                          Cancelar
                                        </Button>
                                      ) : (
                                        <span />
                                      )}
                                      <Button
                                        size="sm"
                                        disabled={
                                          isPending ||
                                          (isJogoNoFuturo &&
                                            !editingPartidas[partida.id])
                                        }
                                        onClick={() =>
                                          handleLancarResultado(partida.id)
                                        }
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3 h-8 rounded-xl flex items-center gap-1 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        {isFinalizado
                                          ? 'Salvar Correção'
                                          : 'Finalizar Jogo'}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleRevisarPartida(partida)
                                        }
                                        className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs px-3.5 h-8 rounded-xl flex items-center gap-1.5 transition-all border border-zinc-200 dark:border-zinc-700"
                                      >
                                        Revisar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {/* Botão Visualizar Mais */}
                        {partidasDaRodada.length >
                          (visibleLimits[rodada.id] ?? PARTIDAS_POR_PAGINA) && (
                          <div className="flex justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => handleVerMais(rodada.id)}
                              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Visualizar mais (
                              {partidasDaRodada.length -
                                (visibleLimits[rodada.id] ??
                                  PARTIDAS_POR_PAGINA)}{' '}
                              restantes)
                            </button>
                          </div>
                        )}
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
