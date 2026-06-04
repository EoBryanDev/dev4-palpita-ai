'use server';

import { db, tokensConvite, usuarios } from '@palpita/db';
import { eq } from 'drizzle-orm';
import { obterSessao } from './auth';

/**
 * Auxiliar para validar se a sessão atual pertence a um administrador.
 */
async function verificarPermissaoAdmin(): Promise<boolean> {
  const session = await obterSessao();
  return !!(session && session.cargo === 'ADMIN');
}

export interface IAdminActionResponse {
  success: boolean;
  message: string;
}

export interface IAprovacaoResponse extends IAdminActionResponse {
  link?: string;
}

/**
 * Aprova uma solicitação de convite pendente, gerando um token de convite temporário.
 */
export async function aprovarSolicitacao(
  usuarioId: string,
): Promise<IAprovacaoResponse> {
  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message:
        'Acesso negado. Apenas administradores podem realizar esta ação.',
    };
  }

  if (!usuarioId) {
    return { success: false, message: 'ID do usuário inválido.' };
  }

  try {
    const res = await db.transaction(async (tx) => {
      // 1. Verificar se o usuário existe e está PENDENTE
      const user = await tx.query.usuarios.findFirst({
        where: eq(usuarios.id, usuarioId),
      });

      if (!user) {
        return { success: false, message: 'Usuário não encontrado.' };
      }

      if (user.status !== 'PENDENTE') {
        return {
          success: false,
          message: `Usuário já possui status: ${user.status}`,
        };
      }

      // 2. Gerar o token de convite
      const result = await tx
        .insert(tokensConvite)
        .values({
          usuarioId: user.id,
          dataCriacao: new Date(),
          usado: false,
        })
        .returning({ id: tokensConvite.id });

      const tokenId = result[0].id;
      const link = `/validation-user/${tokenId}`;

      return {
        success: true,
        message: 'Solicitação aprovada com sucesso! Link de ativação gerado.',
        link,
      };
    });

    return res;
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    return { success: false, message: 'Erro interno ao processar aprovação.' };
  }
}

/**
 * Rejeita uma solicitação de convite, desativando o registro do usuário.
 */
export async function rejeitarSolicitacao(
  usuarioId: string,
): Promise<IAdminActionResponse> {
  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message:
        'Acesso negado. Apenas administradores podem realizar esta ação.',
    };
  }

  if (!usuarioId) {
    return { success: false, message: 'ID do usuário inválido.' };
  }

  try {
    // Busca o usuário para garantir a existência e status pendente
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, usuarioId),
    });

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (user.status !== 'PENDENTE') {
      return {
        success: false,
        message: 'Somente usuários com status PENDENTE podem ser rejeitados.',
      };
    }

    // Altera o status para DESATIVADO
    await db
      .update(usuarios)
      .set({ status: 'DESATIVADO' })
      .where(eq(usuarios.id, usuarioId));

    return {
      success: true,
      message: 'Solicitação de convite rejeitada com sucesso.',
    };
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    return { success: false, message: 'Erro interno ao processar rejeição.' };
  }
}

/**
 * Altera o status de liberação de palpites do usuário (entre ATIVO e LIBERADO ou desativação).
 */
export async function alterarStatusUsuario(
  usuarioId: string,
  novoStatus: 'ATIVO' | 'LIBERADO' | 'DESATIVADO',
): Promise<IAdminActionResponse> {
  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message:
        'Acesso negado. Apenas administradores podem realizar esta ação.',
    };
  }

  if (!usuarioId) {
    return { success: false, message: 'ID do usuário inválido.' };
  }

  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, usuarioId),
    });

    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (user.status === 'PENDENTE') {
      return {
        success: false,
        message:
          'Usuários com status PENDENTE devem primeiro ativar sua conta definindo uma senha.',
      };
    }

    await db
      .update(usuarios)
      .set({ status: novoStatus })
      .where(eq(usuarios.id, usuarioId));

    const msgMap = {
      ATIVO: 'Usuário ativado (palpites bloqueados/pendentes de liberação).',
      LIBERADO: 'Usuário liberado para palpitar com sucesso!',
      DESATIVADO: 'Usuário desativado com sucesso.',
    };

    return { success: true, message: msgMap[novoStatus] };
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return {
      success: false,
      message: 'Erro interno ao alterar status do usuário.',
    };
  }
}
