import { DefinirSenhaForm } from '@/components/form/definir-senha-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { obterTokenEUsuario } from '@/services/usuarios.service';
import { TokenConvite } from '@palpita/core';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface IPageProps {
  params: Promise<{ id: string }>;
}

export default async function ValidationUserPage({
  params,
}: IPageProps): Promise<React.ReactNode> {
  const { id } = await params;

  try {
    // 1. Busca o token e usuario no banco de dados via serviço
    const { token: tokenData, usuario: usuarioData } =
      await obterTokenEUsuario(id);

    if (!tokenData) {
      return renderValidationLayout(
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Link inválido
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              O link de validação não foi encontrado em nosso sistema.
            </p>
            <div className="mt-6 w-full">
              <Link href="/home" className="w-full">
                <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Ir para a Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>,
      );
    }

    if (!usuarioData) {
      return renderValidationLayout(
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Usuário não encontrado
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              O usuário vinculado a este convite não existe ou foi removido.
            </p>
            <div className="mt-6 w-full">
              <Link href="/home" className="w-full">
                <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Ir para a Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>,
      );
    }

    if (usuarioData.status === 'ATIVO') {
      return renderValidationLayout(
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Usuário já ativo!
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Olá, <span className="font-semibold">{usuarioData.nome}</span>.
              Sua conta já está ativada. Você já pode começar a dar seus
              palpites!
            </p>
            <div className="mt-6 w-full">
              <Link href="/home" className="w-full">
                <Button className="w-full bg-emerald-600 text-zinc-50 hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400">
                  Entrar no Painel
                </Button>
              </Link>
            </div>
          </div>
        </div>,
      );
    }

    // Instancia a entidade de domínio para aplicar as regras de negócio
    const tokenConvite = new TokenConvite({
      id: tokenData.id,
      usuarioId: tokenData.usuarioId,
      dataCriacao: tokenData.dataCriacao,
      usado: tokenData.usado,
    });

    const expirado = tokenConvite.estaExpirado();

    if (expirado || tokenData.usado) {
      return renderValidationLayout(
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              O link expirou
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Este link de acesso expirou. Será necessário solicitar ao
              administrador que envie outro link válido.
            </p>
            <div className="mt-6 w-full">
              <Link href="/home" className="w-full">
                <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Voltar para o Início
                </Button>
              </Link>
            </div>
          </div>
        </div>,
      );
    }

    // Token é válido! Exibe o formulário para definição de senha
    return renderValidationLayout(<DefinirSenhaForm tokenId={tokenData.id} />);
  } catch (error) {
    console.error('Erro na validação de usuário:', error);
    return renderValidationLayout(
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Erro inesperado
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Ocorreu um erro ao processar sua ativação. Por favor, tente
            novamente mais tarde.
          </p>
          <div className="mt-6 w-full">
            <Link href="/home" className="w-full">
              <Button className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Voltar para o Início
              </Button>
            </Link>
          </div>
        </div>
      </div>,
    );
  }
}

function renderValidationLayout(children: React.ReactNode) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            PALPITA AI
          </span>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
