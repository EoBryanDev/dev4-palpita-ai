import {
  alterarStatusUsuario,
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from '@/app/actions/admin';
import { useMutation } from '@tanstack/react-query';

export function useMutationAprovarSolicitacao() {
  return useMutation({
    mutationFn: async (usuarioId: string) => {
      const res = await aprovarSolicitacao(usuarioId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}

export function useMutationRejeitarSolicitacao() {
  return useMutation({
    mutationFn: async (usuarioId: string) => {
      const res = await rejeitarSolicitacao(usuarioId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}

export function useMutationAlterarStatusUsuario() {
  return useMutation({
    mutationFn: async ({
      usuarioId,
      novoStatus,
    }: {
      usuarioId: string;
      novoStatus: 'ATIVO' | 'LIBERADO' | 'DESATIVADO';
    }) => {
      const res = await alterarStatusUsuario(usuarioId, novoStatus);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}
