import { solicitarConvite } from '@/app/actions/convites';
import type React from 'react';
import { useState } from 'react';

export function useSolicitarConvite() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await solicitarConvite(nome, email);
      setResult(res);
      if (res.success) {
        setNome('');
        setEmail('');
      }
    } catch (err) {
      setResult({
        success: false,
        message: 'Ocorreu um erro ao enviar a solicitação. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    nome,
    setNome,
    email,
    setEmail,
    loading,
    result,
    handleSubmit,
  };
}
