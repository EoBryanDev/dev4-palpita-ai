import type { IRankUser } from '@/interface/IRanking';
import { useQuery } from '@tanstack/react-query';

const fetchRanking = async (): Promise<IRankUser[]> => {
  const res = await fetch('/api/ranking');
  if (!res.ok) {
    throw new Error('Erro ao buscar a classificação.');
  }
  return res.json();
};

export function useQueryRanking() {
  return useQuery<IRankUser[]>({
    queryKey: ['ranking'],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}
