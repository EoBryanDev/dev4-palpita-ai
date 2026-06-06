import type { IPartidaStats } from '@/interface/IPalpite';
import { useQuery } from '@tanstack/react-query';

const fetchPalpitesStats = async (): Promise<IPartidaStats[]> => {
  const res = await fetch('/api/palpites');
  if (!res.ok) {
    throw new Error('Erro ao buscar estatísticas de palpites.');
  }
  return res.json();
};

export function useQueryPalpitesStats() {
  return useQuery<IPartidaStats[]>({
    queryKey: ['palpitesStats'],
    queryFn: fetchPalpitesStats,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
  });
}
