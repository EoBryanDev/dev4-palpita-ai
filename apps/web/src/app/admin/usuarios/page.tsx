import { obterSessao } from '@/app/actions/auth';
import { AdminUsuariosClient } from '@/components/admin-usuarios-client';
import { obterUsuariosComToken } from '@/services/usuarios.service';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin - Usuários | Palpita AI',
  description: 'Gerenciamento de usuários e convites do Palpita AI.',
};

export default async function AdminUsuariosPage() {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    redirect('/meu-espaco');
  }

  // Fetch all users and left join tokensConvite to get activation tokens
  const uniqueUsers = await obterUsuariosComToken();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
          Painel de Usuários
        </h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2">
          Gerencie permissões de palpites, aprove convites e visualize usuários
          do bolão.
        </p>
      </div>
      <AdminUsuariosClient usuarios={uniqueUsers} adminEmail={session.email} />
    </div>
  );
}
