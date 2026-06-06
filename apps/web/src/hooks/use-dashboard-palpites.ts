import { logoutUsuario } from '@/app/actions/auth';
import { salvarPalpite } from '@/app/actions/palpites';
import { useToast } from '@/components/ui/use-toast';
import type { IPartidaDashboard } from '@/interface/IDashboard';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function useDashboardPalpites() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [logoutPending, startLogout] = useTransition();

  // Estado para armazenar os valores temporários digitados nos inputs de palpites
  const [valoresPalpites, setValoresPalpites] = useState<
    Record<string, { golsA: string; golsB: string }>
  >({});

  const handleInputChange = (
    partidaId: string,
    time: 'A' | 'B',
    value: string,
  ) => {
    // Apenas números inteiros positivos ou string vazia
    if (value !== '' && !/^\d+$/.test(value)) return;

    setValoresPalpites((prev) => {
      const atual = prev[partidaId] || { golsA: '', golsB: '' };
      return {
        ...prev,
        [partidaId]: {
          ...atual,
          golsA: time === 'A' ? value : atual.golsA,
          golsB: time === 'B' ? value : atual.golsB,
        },
      };
    });
  };

  const handleSalvar = (partidaId: string, partida: IPartidaDashboard) => {
    const valores = valoresPalpites[partidaId];
    // Se não digitou novos valores, usa o palpite anterior ou assume 0
    const golsAStr = valores?.golsA ?? String(partida.palpiteGolsA ?? '');
    const golsBStr = valores?.golsB ?? String(partida.palpiteGolsB ?? '');

    if (golsAStr === '' || golsBStr === '') {
      toast({
        title: 'Aviso',
        description: 'Preencha ambos os placares para salvar.',
        variant: 'destructive',
      });
      return;
    }

    const golsA = Number.parseInt(golsAStr, 10);
    const golsB = Number.parseInt(golsBStr, 10);

    startTransition(async () => {
      const result = await salvarPalpite(partidaId, golsA, golsB);

      if (result.success) {
        toast({
          title: 'Palpite salvo!',
          description: result.message,
        });
        // Recarregar os dados do servidor para atualizar o dashboard
        router.refresh();
      } else {
        toast({
          title: 'Erro ao salvar',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleLogout = () => {
    startLogout(async () => {
      await logoutUsuario();
      router.push('/login');
      router.refresh();
    });
  };

  return {
    valoresPalpites,
    isPending,
    logoutPending,
    handleInputChange,
    handleSalvar,
    handleLogout,
  };
}
