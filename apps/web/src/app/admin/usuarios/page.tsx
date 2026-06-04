import { obterSessao } from '@/app/actions/auth';
import { AdminUsuariosClient } from '@/components/admin-usuarios-client';
import { db, tokensConvite, usuarios } from '@palpita/db';
import { desc, eq } from 'drizzle-orm';
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
  const result = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      status: usuarios.status,
      cargo: usuarios.cargo,
      dataCriacao: usuarios.dataCriacao,
      tokenId: tokensConvite.id,
      tokenUsado: tokensConvite.usado,
    })
    .from(usuarios)
    .leftJoin(tokensConvite, eq(usuarios.id, tokensConvite.usuarioId))
    .orderBy(desc(usuarios.dataCriacao));

  // Deduplicate and map
  const uniqueUsersMap = new Map<
    string,
    {
      id: string;
      nome: string;
      email: string;
      status: 'PENDENTE' | 'ATIVO' | 'DESATIVADO' | 'LIBERADO';
      cargo: 'ADMIN' | 'COLABORADOR';
      dataCriacao: string;
      tokenId?: string | null;
    }
  >();

  for (const r of result) {
    const existing = uniqueUsersMap.get(r.id);
    const hasUnusedToken = r.tokenId && !r.tokenUsado;

    // If we don't have this user yet, or we found a record with an unused token for them, save it
    if (!existing || (!existing.tokenId && hasUnusedToken)) {
      uniqueUsersMap.set(r.id, {
        id: r.id,
        nome: r.nome,
        email: r.email,
        status: r.status,
        cargo: r.cargo,
        dataCriacao: r.dataCriacao.toISOString(),
        tokenId: hasUnusedToken ? r.tokenId : null,
      });
    }
  }

  const uniqueUsers = Array.from(uniqueUsersMap.values());

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-amber-400">
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
