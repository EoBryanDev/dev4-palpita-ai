import {
  criarPartida,
  criarRodada,
  lancarResultadoOficial,
} from '@/app/actions/admin';
import { useMutation } from '@tanstack/react-query';

export function useMutationCriarRodada() {
  return useMutation({
    mutationFn: async ({ numero, nome }: { numero: number; nome: string }) => {
      const res = await criarRodada(numero, nome);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}

export function useMutationCriarPartida() {
  return useMutation({
    mutationFn: async ({
      rodadaId,
      timeAId,
      timeBId,
      dataInicio,
    }: {
      rodadaId: string;
      timeAId: string;
      timeBId: string;
      dataInicio: string;
    }) => {
      const res = await criarPartida(rodadaId, timeAId, timeBId, dataInicio);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}

export function useMutationLancarResultadoOficial() {
  return useMutation({
    mutationFn: async ({
      partidaId,
      golsTimeA,
      golsTimeB,
      decididoEm,
    }: {
      partidaId: string;
      golsTimeA: number;
      golsTimeB: number;
      decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
    }) => {
      const res = await lancarResultadoOficial(
        partidaId,
        golsTimeA,
        golsTimeB,
        decididoEm,
      );
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}
