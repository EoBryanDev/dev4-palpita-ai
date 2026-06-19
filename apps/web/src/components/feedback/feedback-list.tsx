'use client';

import { FeedbackCard } from '@/components/feedback/feedback-card';
import { useState } from 'react';

interface FeedbackItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  dataCriacao: Date;
  totalVotos: number;
  usuarioVotou: boolean;
  usuarioId: string;
  usuarioNome: string;
  respostaAdmin?: string | null;
  linkAdmin?: string | null;
}

interface FeedbackListProps {
  feedbacks: FeedbackItem[];
  usuarioLogado?: boolean;
}

type FiltroTipo = 'todos' | 'sugestao' | 'bug';
type Ordenacao = 'votos' | 'recentes';

export function FeedbackList({ feedbacks, usuarioLogado }: FeedbackListProps) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('votos');

  const filtrados = feedbacks.filter((f) => {
    if (filtroTipo === 'todos') return true;
    return f.tipo === filtroTipo;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    if (ordenacao === 'votos') {
      return b.totalVotos - a.totalVotos;
    }
    return (
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {(
            [
              { key: 'todos', label: 'Todas' },
              { key: 'sugestao', label: 'Sugestões' },
              { key: 'bug', label: 'Bugs' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFiltroTipo(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                filtroTipo === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {(
            [
              { key: 'votos', label: 'Mais votados' },
              { key: 'recentes', label: 'Recentes' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOrdenacao(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                ordenacao === tab.key
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {ordenados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum feedback encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordenados.map((f) => (
            <FeedbackCard key={f.id} {...f} usuarioLogado={usuarioLogado} />
          ))}
        </div>
      )}
    </div>
  );
}
