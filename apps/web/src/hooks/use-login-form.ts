import { loginUsuario } from '@/app/actions/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarMe, setLembrarMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || email.trim().length === 0) {
      setErrorMsg('O e-mail é obrigatório.');
      return;
    }

    if (!senha || senha.length === 0) {
      setErrorMsg('A senha é obrigatória.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUsuario(email, senha);
      if (res.success) {
        setSuccess(true);
        queryClient.clear();
        const redirectTo =
          res.user?.cargo === 'ADMIN' ? '/admin' : '/meu-espaco';
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.message);
        setSenha('');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    senha,
    setSenha,
    lembrarMe,
    setLembrarMe,
    loading,
    errorMsg,
    success,
    handleSubmit,
  };
}
