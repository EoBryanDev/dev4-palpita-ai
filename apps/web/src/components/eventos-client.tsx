'use client';

import {
  type IComentarioFormatado,
  type IEventoTimeline,
  type IPontuadorRodada,
  adicionarComentario,
  obterComentariosPartida,
  obterEventosTimeline,
  obterPontuadoresRodada,
} from '@/app/actions/eventos';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/ui/flag-image';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  MessageCircle,
  MessageSquareOff,
  Send,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import type React from 'react';

export function EventosClient() {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<IEventoTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal de Comentários
  const [selectedMatch, setSelectedMatch] = useState<IEventoTimeline | null>(
    null,
  );
  const [comentariosList, setComentariosList] = useState<
    IComentarioFormatado[]
  >([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [novoComentarioText, setNovoComentarioText] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Estados dos Pontuadores da Rodada por RodadaID
  const [pontuadoresMap, setPontuadoresMap] = useState<
    Record<string, IPontuadorRodada[]>
  >({});
  const [loadingPontuadores, setLoadingPontuadores] = useState<
    Record<string, boolean>
  >({});

  // Carregar timeline inicial
  const carregarTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await obterEventosTimeline();
      if (res.success) {
        setEventos(res.eventos);
      } else {
        setError(res.message || 'Erro ao carregar timeline de eventos.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao se conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarTimeline();
  }, [carregarTimeline]);

  // Carregar pontuadores de uma rodada
  const carregarPontuadores = async (rodadaId: string) => {
    if (pontuadoresMap[rodadaId] || loadingPontuadores[rodadaId]) return;

    setLoadingPontuadores((prev) => ({ ...prev, [rodadaId]: true }));
    try {
      const res = await obterPontuadoresRodada(rodadaId);
      if (res.success) {
        setPontuadoresMap((prev) => ({ ...prev, [rodadaId]: res.pontuadores }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPontuadores((prev) => ({ ...prev, [rodadaId]: false }));
    }
  };

  // Carregar comentários de um jogo
  const carregarComentarios = async (partida: IEventoTimeline) => {
    setSelectedMatch(partida);
    setLoadingComentarios(true);
    setNovoComentarioText('');
    try {
      const res = await obterComentariosPartida(partida.id);
      if (res.success) {
        setComentariosList(res.comentarios);
      } else {
        toast({
          title: 'Erro',
          description: res.message || 'Erro ao carregar comentários.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Erro de conexão.',
        variant: 'destructive',
      });
    } finally {
      setLoadingComentarios(false);
    }
  };

  // Enviar comentário
  const handleEnviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !novoComentarioText.trim() || enviandoComentario)
      return;

    setEnviandoComentario(true);
    try {
      const res = await adicionarComentario(
        selectedMatch.id,
        novoComentarioText,
      );
      if (res.success) {
        setNovoComentarioText('');
        // Recarregar os comentários
        const fresh = await obterComentariosPartida(selectedMatch.id);
        if (fresh.success) {
          setComentariosList(fresh.comentarios);
        }
        toast({
          title: 'Sucesso',
          description: 'Comentário enviado com sucesso!',
        });
      } else {
        toast({
          title: 'Erro',
          description: res.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar comentário.',
        variant: 'destructive',
      });
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Calcular status visual igual ao da tela de palpites
  const getStatusLabel = (status: string, dataInicioStr: string) => {
    if (status === 'FINALIZADO' || status === 'FINALIZADA') {
      return {
        label: 'Encerrado',
        styles: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
      };
    }

    const dataInicio = new Date(dataInicioStr);
    const agora = new Date();
    const diffMs = agora.getTime() - dataInicio.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes < 0) {
      return {
        label: 'Agendado',
        styles: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };
    }

    if (diffMinutes >= 115) {
      return {
        label: 'Calculando Encerramento',
        styles:
          'bg-purple-500/10 text-purple-500 dark:text-purple-400 animate-pulse',
      };
    }

    return {
      label: 'Em Andamento',
      styles: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 animate-pulse',
    };
  };

  const formatarData = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-650 dark:text-emerald-400" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Carregando a linha do tempo de eventos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <div className="rounded-full bg-red-50 dark:bg-red-950/20 p-3 text-red-650 dark:text-red-400">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Erro ao carregar eventos</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {error}
          </p>
        </div>
        <Button
          onClick={carregarTimeline}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {eventos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10">
          <Calendar className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-semibold mt-4">
            Nenhum evento registrado ainda
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Os confrontos iniciados ou encerrados aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 md:ml-6 space-y-12">
          {eventos.map((evento) => {
            const statusInfo = getStatusLabel(evento.status, evento.dataInicio);
            const showScorers = !!pontuadoresMap[evento.rodadaId];
            const scorers = pontuadoresMap[evento.rodadaId] || [];
            const isLoadingScorers = !!loadingPontuadores[evento.rodadaId];

            return (
              <div key={evento.id} className="relative pl-8 md:pl-10">
                {/* Marcador na Timeline */}
                <span className="absolute -left-[9px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-500 ring-4 ring-white dark:ring-zinc-950 shadow-sm" />

                <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/30 transition-all hover:shadow-lg">
                  {/* Cabeçalho do Confronto */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {evento.rodadaNome}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-450 font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatarData(evento.dataInicio)}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusInfo.styles}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Detalhes do Jogo */}
                  <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-5 mb-4 select-none">
                    <div className="w-[42%] text-right font-black text-zinc-850 dark:text-zinc-200 truncate flex items-center justify-end gap-2">
                      <span className="text-sm md:text-base">
                        {evento.timeA}
                      </span>
                      {evento.timeAEmoji && (
                        <FlagImage
                          emoji={evento.timeAEmoji}
                          alt={evento.timeA}
                          className="h-5 w-5 shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-zinc-55 dark:bg-zinc-800/60 px-3.5 py-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50">
                      <span>
                        {evento.golsTimeA !== null ? evento.golsTimeA : '-'}
                      </span>
                      <span className="text-zinc-350 dark:text-zinc-650 text-sm font-normal">
                        x
                      </span>
                      <span>
                        {evento.golsTimeB !== null ? evento.golsTimeB : '-'}
                      </span>
                    </div>
                    <div className="w-[42%] text-left font-black text-zinc-850 dark:text-zinc-200 truncate flex items-center justify-start gap-2">
                      {evento.timeBEmoji && (
                        <FlagImage
                          emoji={evento.timeBEmoji}
                          alt={evento.timeB}
                          className="h-5 w-5 shrink-0"
                        />
                      )}
                      <span className="text-sm md:text-base">
                        {evento.timeB}
                      </span>
                    </div>
                  </div>

                  {/* Ações e Informações Adicionais */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Botão para Pontuadores */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => carregarPontuadores(evento.rodadaId)}
                        className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-0 hover:bg-transparent flex items-center gap-1.5"
                      >
                        <Trophy className="h-4 w-4 text-amber-500" />
                        {showScorers
                          ? 'Ocultar pontuadores da rodada'
                          : 'Ver pontuadores da rodada'}
                      </Button>
                    </div>

                    {/* Botão de Comentários */}
                    <Button
                      size="sm"
                      onClick={() => carregarComentarios(evento)}
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 font-bold text-xs px-4 h-9 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-all"
                    >
                      <MessageCircle className="h-4.5 w-4.5 text-blue-500" />
                      Comentários
                    </Button>
                  </div>

                  {/* Seção Expandida: Maiores Pontuadores */}
                  {showScorers && (
                    <div className="mt-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-2.5 animate-in fade-in duration-250">
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-zinc-400" />
                        Classificação da {evento.rodadaNome}
                      </h5>

                      {isLoadingScorers ? (
                        <div className="flex items-center gap-1 text-xs text-zinc-500 py-1">
                          <Loader2 className="h-3 w-3 animate-spin" />{' '}
                          Carregando pontuações...
                        </div>
                      ) : scorers.length === 0 ? (
                        <div className="text-xs text-zinc-400 italic py-1">
                          Nenhum ponto registrado nesta rodada ainda.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {scorers.map((pt, idx) => (
                            <div
                              key={`${pt.usuarioNome}-${pt.pontos}`}
                              className="flex items-center justify-between bg-white dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-150 dark:border-zinc-800/80"
                            >
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {idx + 1}º. {pt.usuarioNome}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg">
                                +{pt.pontos} PTS
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Comentários */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-850 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h4 className="font-black text-sm tracking-tight">
                  Comentários da Partida
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 select-none">
                  {selectedMatch.timeA} x {selectedMatch.timeB} (
                  {selectedMatch.rodadaNome})
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMatch(null)}
                className="rounded-full h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>

            {/* Listagem de Comentários */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-[300px]">
              {loadingComentarios ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                  <p className="text-xs text-zinc-400">
                    Carregando comentários...
                  </p>
                </div>
              ) : comentariosList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 space-y-2">
                  <MessageSquareOff className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs font-semibold">
                    Nenhum comentário ainda
                  </p>
                  <p className="text-[10px] text-zinc-500 max-w-[200px]">
                    Seja o primeiro a enviar suas percepções sobre o confronto!
                  </p>
                </div>
              ) : (
                comentariosList.map((com) => (
                  <div
                    key={com.id}
                    className="flex flex-col bg-zinc-50 dark:bg-zinc-950/30 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850/50"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-450 dark:text-zinc-500 mb-1.5">
                      <span>{com.usuarioNome}</span>
                      <span>{formatarData(com.dataCriacao)}</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                      {com.conteudo}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Input Form de Envio */}
            <form
              onSubmit={handleEnviarComentario}
              className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950/20 flex gap-2 items-center"
            >
              <input
                type="text"
                maxLength={500}
                required
                disabled={enviandoComentario}
                value={novoComentarioText}
                onChange={(e) => setNovoComentarioText(e.target.value)}
                placeholder="Envie seu comentário sobre o jogo..."
                className="flex-1 h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-900 dark:text-zinc-50 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!novoComentarioText.trim() || enviandoComentario}
                className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400 rounded-xl h-10 w-10 flex items-center justify-center"
              >
                {enviandoComentario ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
