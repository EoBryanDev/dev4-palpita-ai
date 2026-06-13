'use client';

import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface AuthFetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

export function useAuthFetch() {
  const router = useRouter();
  const { toast } = useToast();

  const authFetch = useCallback(
    async (url: string, options: AuthFetchOptions = {}): Promise<Response> => {
      const { skipAuthRedirect, ...fetchOptions } = options;

      const res = await fetch(url, fetchOptions);

      if (res.status === 401 && !skipAuthRedirect) {
        toast({
          title: 'Sessão expirada',
          description: 'Sua sessão expirou. Faça login novamente.',
          variant: 'destructive',
        });

        setTimeout(() => {
          router.push('/home');
          router.refresh();
        }, 2000);
      }

      return res;
    },
    [router, toast],
  );

  return { authFetch };
}
