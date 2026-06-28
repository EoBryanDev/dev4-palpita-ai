import {
  atualizarTipoRodada,
  criarPartida,
  criarRodada,
  lancarResultadoOficial,
} from '@/app/actions/admin';
import type { TPenaltyWinner } from '@palpita/core';
import { useMutation } from '@tanstack/react-query';

export function useMutationCriarRodada() {
  return useMutation({
    mutationFn: async ({
      numero,
      nome,
      tipo,
    }: {
      numero: number;
      nome: string;
      tipo: 'GRUPO' | 'MATAMATA';
    }) => {
      const res = await criarRodada(numero, nome, tipo);
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
      timeVencedorPenaltis,
    }: {
      partidaId: string;
      golsTimeA: number;
      golsTimeB: number;
      decididoEm?: 'NORMAL' | 'PRORROGACAO' | 'PENALTIS';
      timeVencedorPenaltis?: TPenaltyWinner;
    }) => {
      const res = await lancarResultadoOficial(
        partidaId,
        golsTimeA,
        golsTimeB,
        decididoEm,
        timeVencedorPenaltis,
      );
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}

export function useMutationAtualizarTipoRodada() {
  return useMutation({
    mutationFn: async ({
      rodadaId,
      tipo,
    }: {
      rodadaId: string;
      tipo: 'GRUPO' | 'MATAMATA';
    }) => {
      const res = await atualizarTipoRodada(rodadaId, tipo);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}
