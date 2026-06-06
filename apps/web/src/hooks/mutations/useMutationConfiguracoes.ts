import { salvarValorPalpite } from '@/app/actions/admin';
import { useMutation } from '@tanstack/react-query';

export function useMutationSalvarValorPalpite() {
  return useMutation({
    mutationFn: async (valor: number) => {
      const res = await salvarValorPalpite(valor);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
}
