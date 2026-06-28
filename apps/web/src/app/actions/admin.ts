'use server';

import { validarOrigem } from '@/lib/csrf-server';
import {
  Partida,
  type TDecididoEm,
  type TPartidaStatus,
  type TUsuarioCargo,
  type TUsuarioStatus,
  Usuario,
} from '@palpita/core';
import {
  configuracoes,
  db,
  partidas,
  rodadas,
  times,
  tokensConvite,
  usuarios,
} from '@palpita/db';
import { and, eq } from 'drizzle-orm';
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
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

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

      // 2. Remover tokens não-usados existentes (expirados) para este usuário
      await tx
        .delete(tokensConvite)
        .where(
          and(
            eq(tokensConvite.usuarioId, usuarioId),
            eq(tokensConvite.usado, false),
          ),
        );

      // 3. Gerar o token de convite
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
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

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

    const usuarioEntity = new Usuario({
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: user.status as TUsuarioStatus,
      cargo: user.cargo as TUsuarioCargo,
      dataCriacao: user.dataCriacao,
      senha: user.senha,
    });

    usuarioEntity.desativar();

    await db
      .update(usuarios)
      .set({ status: usuarioEntity.status })
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
/**
 * Libera um usuário com status ATIVO para palpitar com janela de 30 min (participação parcial).
 * Usado quando a Copa já começou e o usuário entrou atrasado.
 */
export async function liberarUsuarioAtrasado(
  usuarioId: string,
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

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
        message: 'Usuário com status PENDENTE deve primeiro ativar sua conta.',
      };
    }

    if (user.status === 'LIBERADO') {
      return {
        success: false,
        message: 'Usuário já está liberado para palpitar.',
      };
    }

    const agora = new Date();

    await db
      .update(usuarios)
      .set({
        status: 'LIBERADO',
        dataLiberacao: agora,
      })
      .where(eq(usuarios.id, usuarioId));

    return {
      success: true,
      message:
        'Usuário liberado para palpitar! Ele tem 30 minutos para registrar seus palpites.',
    };
  } catch (error) {
    console.error('Erro ao liberar usuário tardio:', error);
    return { success: false, message: 'Erro interno ao liberar usuário.' };
  }
}

export async function alterarStatusUsuario(
  usuarioId: string,
  novoStatus: 'ATIVO' | 'LIBERADO' | 'DESATIVADO',
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

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

    const usuarioEntity = new Usuario({
      id: user.id,
      nome: user.nome,
      email: user.email,
      status: user.status as TUsuarioStatus,
      cargo: user.cargo as TUsuarioCargo,
      dataCriacao: user.dataCriacao,
      senha: user.senha,
    });

    if (novoStatus === 'ATIVO') usuarioEntity.ativar();
    else if (novoStatus === 'LIBERADO') usuarioEntity.liberar();
    else if (novoStatus === 'DESATIVADO') usuarioEntity.desativar();

    await db
      .update(usuarios)
      .set({ status: usuarioEntity.status })
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

/**
 * Cria uma nova rodada no bolão.
 */
export async function criarRodada(
  numero: number,
  nome: string,
  tipo: 'GRUPO' | 'MATAMATA' = 'GRUPO',
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  if (!numero || numero <= 0) {
    return {
      success: false,
      message: 'O número da rodada deve ser maior que zero.',
    };
  }

  if (!nome || nome.trim().length === 0) {
    return { success: false, message: 'O nome da rodada é obrigatório.' };
  }

  try {
    await db.insert(rodadas).values({
      numero,
      nome: nome.trim(),
      ativa: true,
      tipo,
    });

    return { success: true, message: 'Rodada criada com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar rodada:', error);
    return { success: false, message: 'Erro interno ao criar rodada.' };
  }
}

/**
 * Atualiza o tipo (GRUPO | MATAMATA) de uma rodada existente.
 */
export async function atualizarTipoRodada(
  rodadaId: string,
  tipo: 'GRUPO' | 'MATAMATA',
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  try {
    await db.update(rodadas).set({ tipo }).where(eq(rodadas.id, rodadaId));
    return {
      success: true,
      message: `Rodada atualizada para ${tipo === 'MATAMATA' ? 'Mata-Mata' : 'Fase de Grupos'}.`,
    };
  } catch (error) {
    console.error('Erro ao atualizar tipo da rodada:', error);
    return {
      success: false,
      message: 'Erro interno ao atualizar tipo da rodada.',
    };
  }
}

/**
 * Cria uma nova partida associada a uma rodada.
 */
export async function criarPartida(
  rodadaId: string,
  timeAId: string,
  timeBId: string,
  dataInicioString: string,
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  if (!rodadaId) {
    return { success: false, message: 'O ID da rodada é obrigatório.' };
  }

  if (
    !timeAId ||
    timeAId.trim().length === 0 ||
    !timeBId ||
    timeBId.trim().length === 0
  ) {
    return { success: false, message: 'Os IDs dos times são obrigatórios.' };
  }

  if (timeAId.trim() === timeBId.trim()) {
    return { success: false, message: 'Os times A e B devem ser diferentes.' };
  }

  const dataInicio = new Date(dataInicioString);
  if (Number.isNaN(dataInicio.getTime())) {
    return { success: false, message: 'Data de início inválida.' };
  }

  try {
    // Verificar se a rodada existe
    const rodada = await db.query.rodadas.findFirst({
      where: eq(rodadas.id, rodadaId),
    });

    if (!rodada) {
      return { success: false, message: 'Rodada não encontrada.' };
    }

    // Verificar se os times existem
    const tA = await db.query.times.findFirst({
      where: eq(times.id, timeAId),
    });
    const tB = await db.query.times.findFirst({
      where: eq(times.id, timeBId),
    });

    if (!tA || !tB) {
      return {
        success: false,
        message: 'Um ou ambos os times não foram encontrados.',
      };
    }

    await db.insert(partidas).values({
      rodadaId,
      timeAId: timeAId.trim(),
      timeBId: timeBId.trim(),
      dataInicio,
      status: 'AGENDADO',
    });

    return { success: true, message: 'Partida criada com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    return { success: false, message: 'Erro interno ao criar partida.' };
  }
}

/**
 * Lança o resultado oficial de uma partida e finaliza o jogo.
 */
export async function lancarResultadoOficial(
  partidaId: string,
  golsTimeA: number,
  golsTimeB: number,
  decididoEm?: TDecididoEm,
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  if (!partidaId) {
    return { success: false, message: 'ID da partida inválido.' };
  }

  if (golsTimeA < 0 || golsTimeB < 0) {
    return {
      success: false,
      message: 'Os gols não podem ser valores negativos.',
    };
  }

  try {
    const res = await db.transaction(async (tx) => {
      // 1. Buscar a partida
      const match = await tx.query.partidas.findFirst({
        where: eq(partidas.id, partidaId),
      });

      if (!match) {
        return { success: false, message: 'Partida não encontrada.' };
      }

      const partidaEntity = new Partida({
        id: match.id,
        rodadaId: match.rodadaId,
        timeAId: match.timeAId,
        timeBId: match.timeBId,
        golsTimeA: match.golsTimeA,
        golsTimeB: match.golsTimeB,
        dataInicio: new Date(match.dataInicio),
        status: match.status as TPartidaStatus,
        decididoEm: match.decididoEm as TDecididoEm,
        dataCriacao: match.dataCriacao,
      });

      try {
        partidaEntity.finalizar(golsTimeA, golsTimeB, decididoEm);
      } catch (domainError) {
        return {
          success: false,
          message: (domainError as Error).message,
        };
      }

      // 2. Atualizar o status, o placar e decididoEm
      await tx
        .update(partidas)
        .set({
          golsTimeA: partidaEntity.golsTimeA,
          golsTimeB: partidaEntity.golsTimeB,
          status: 'FINALIZADO',
          decididoEm: partidaEntity.decididoEm,
        })
        .where(eq(partidas.id, partidaId));

      return {
        success: true,
        message:
          'Resultado lançado e partida finalizada com sucesso! Ranking e pontos recalculados.',
      };
    });

    return res;
  } catch (error) {
    console.error('Erro ao lançar resultado oficial:', error);
    return { success: false, message: 'Erro interno ao lançar resultado.' };
  }
}

/**
 * Obtém o valor atual configurado para a inscrição do palpite.
 * Retorna o valor numérico (default R$ 50,00 se não cadastrado).
 */
export async function obterValorPalpite(): Promise<number> {
  try {
    const config = await db.query.configuracoes.findFirst({
      where: eq(configuracoes.chave, 'valor_palpite'),
    });
    if (!config) return 50;
    const valorNum = Number.parseFloat(config.valor);
    return Number.isNaN(valorNum) ? 50 : valorNum;
  } catch (error) {
    console.error('Erro ao obter valor do palpite:', error);
    return 50;
  }
}

/**
 * Salva um novo valor para a inscrição do palpite.
 */
export async function salvarValorPalpite(
  valor: number,
): Promise<IAdminActionResponse> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const isAdmin = await verificarPermissaoAdmin();
  if (!isAdmin) {
    return {
      success: false,
      message:
        'Acesso negado. Apenas administradores podem realizar esta ação.',
    };
  }

  if (typeof valor !== 'number' || Number.isNaN(valor) || valor < 0) {
    return { success: false, message: 'Valor inválido.' };
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Verificar se a configuração já existe
      const config = await tx.query.configuracoes.findFirst({
        where: eq(configuracoes.chave, 'valor_palpite'),
      });

      if (config) {
        // Atualiza
        await tx
          .update(configuracoes)
          .set({
            valor: valor.toFixed(2),
            dataAtualizacao: new Date(),
          })
          .where(eq(configuracoes.chave, 'valor_palpite'));
      } else {
        // Insere
        await tx.insert(configuracoes).values({
          chave: 'valor_palpite',
          valor: valor.toFixed(2),
        });
      }
    });

    return {
      success: true,
      message: 'Valor do palpite atualizado com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao salvar valor do palpite:', error);
    return { success: false, message: 'Erro interno ao salvar configuração.' };
  }
}
