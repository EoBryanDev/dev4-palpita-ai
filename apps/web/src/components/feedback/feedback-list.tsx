'use client';

import { FeedbackCard } from '@/components/feedback/feedback-card';
import { Search } from 'lucide-react';
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
type FiltroStatus =
  | 'todos'
  | 'pendente'
  | 'revisando'
  | 'planejado'
  | 'concluido'
  | 'rejeitado';
type Ordenacao = 'votos' | 'recentes';

const statusTabs: { key: FiltroStatus; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'revisando', label: 'Revisando' },
  { key: 'planejado', label: 'Planejado' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'rejeitado', label: 'Rejeitado' },
];

export function FeedbackList({ feedbacks, usuarioLogado }: FeedbackListProps) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('votos');
  const [search, setSearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(10);

  const filtrados = feedbacks.filter((f) => {
    if (filtroTipo !== 'todos' && f.tipo !== filtroTipo) return false;
    if (filtroStatus !== 'todos' && f.status !== filtroStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !f.titulo.toLowerCase().includes(q) &&
        !f.descricao.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const ordenados = [...filtrados].sort((a, b) => {
    if (ordenacao === 'votos') {
      return b.totalVotos - a.totalVotos;
    }
    return (
      new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
    );
  });

  const visiveis = ordenados.slice(0, visibleLimit);

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleLimit(10);
          }}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

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
              onClick={() => {
                setFiltroTipo(tab.key);
                setVisibleLimit(10);
              }}
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

      {/* Status Filter */}
      <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setFiltroStatus(tab.key);
              setVisibleLimit(10);
            }}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              filtroStatus === tab.key
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {visiveis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum feedback encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visiveis.map((f) => (
            <FeedbackCard key={f.id} {...f} usuarioLogado={usuarioLogado} />
          ))}
        </div>
      )}

      {ordenados.length > visibleLimit && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleLimit((prev) => prev + 10)}
            className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm rounded-2xl transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 cursor-pointer"
          >
            Visualizar mais
          </button>
        </div>
      )}
    </div>
  );
}
