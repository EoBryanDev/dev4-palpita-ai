'use server';

import type { IPartidaDashboard } from '@/interface/IDashboard';
import { validarOrigem } from '@/lib/csrf-server';
import {
  obterPalpitesSalvosFuturosPaginados,
  obterTodosPalpitesUsuario,
  obterTotalPalpitesSalvosFuturos,
} from '@/services/palpites.service';
import { db, palpites, partidas, usuarios } from '@palpita/db';
import { and, eq } from 'drizzle-orm';
import { obterSessao } from './auth';

export interface ISalvarPalpiteResult {
  success: boolean;
  message: string;
}

export async function salvarPalpite(
  partidaId: string,
  golsTimeA: number,
  golsTimeB: number,
): Promise<ISalvarPalpiteResult> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  // 1. Validar autenticação
  const session = await obterSessao();
  if (!session || !session.id) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  // Validar placares negativos
  if (golsTimeA < 0 || golsTimeB < 0) {
    return { success: false, message: 'Os placares não podem ser negativos.' };
  }

  try {
    // 2. Verificar status de liberação do usuário no banco
    const user = await db
      .select({
        status: usuarios.status,
        dataLiberacao: usuarios.dataLiberacao,
      })
      .from(usuarios)
      .where(eq(usuarios.id, session.id))
      .limit(1);

    if (user.length === 0) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (user[0].status !== 'LIBERADO') {
      return {
        success: false,
        message:
          'Apostas bloqueadas. Sua conta está pendente de liberação pelo administrador.',
      };
    }

    // 3. Buscar a partida para validar o prazo
    const match = await db
      .select({
        dataInicio: partidas.dataInicio,
        status: partidas.status,
      })
      .from(partidas)
      .where(eq(partidas.id, partidaId))
      .limit(1);

    if (match.length === 0) {
      return { success: false, message: 'Partida não encontrada.' };
    }

    // 4. Validar prazos
    const agora = new Date();

    if (match[0].status === 'FINALIZADO') {
      return {
        success: false,
        message: 'Esta partida já foi finalizada.',
      };
    }

    // Se a partida já começou, bloquear
    if (agora >= new Date(match[0].dataInicio)) {
      return {
        success: false,
        message: 'Esta partida já começou. Não é mais possível palpitar.',
      };
    }

    // Verificar se usuário tem dataLiberacao (liberado tardiamente)
    if (user[0].dataLiberacao) {
      const dataLiberacao = new Date(user[0].dataLiberacao);
      const prazoLiberacao = new Date(dataLiberacao.getTime() + 30 * 60 * 1000);

      if (agora >= prazoLiberacao) {
        return {
          success: false,
          message:
            'Seu prazo de 30 minutos para palpitar expirou. Entre em contato com o administrador.',
        };
      }
    } else {
      // Usuário normal: validar deadline global (30 min antes da 1ª partida)
      const primeiraPartidaTorneio = await db
        .select({ dataInicio: partidas.dataInicio })
        .from(partidas)
        .orderBy(partidas.dataInicio)
        .limit(1);

      if (primeiraPartidaTorneio.length === 0) {
        return { success: false, message: 'Nenhuma partida encontrada.' };
      }

      const dataLimite = new Date(
        new Date(primeiraPartidaTorneio[0].dataInicio).getTime() -
          30 * 60 * 1000,
      );

      if (agora >= dataLimite) {
        return {
          success: false,
          message:
            'O prazo para palpitar expirou (palpites fechados 30 minutos antes do primeiro jogo da Copa do Mundo).',
        };
      }
    }

    // 4. Salvar ou Atualizar o Palpite
    const palpiteExistente = await db
      .select()
      .from(palpites)
      .where(
        and(
          eq(palpites.usuarioId, session.id),
          eq(palpites.partidaId, partidaId),
        ),
      )
      .limit(1);

    if (palpiteExistente.length > 0) {
      // Atualizar palpite
      await db
        .update(palpites)
        .set({
          golsTimeA,
          golsTimeB,
          dataAtualizacao: new Date(),
        })
        .where(eq(palpites.id, palpiteExistente[0].id));

      return { success: true, message: 'Palpite atualizado com sucesso!' };
    }

    // Criar novo palpite
    await db.insert(palpites).values({
      usuarioId: session.id,
      partidaId,
      golsTimeA,
      golsTimeB,
    });

    return { success: true, message: 'Palpite registrado com sucesso!' };
  } catch (error) {
    console.error('Erro ao salvar palpite:', error);
    return {
      success: false,
      message: 'Erro interno ao salvar palpite. Tente novamente mais tarde.',
    };
  }
}

export interface IObterPalpitesSalvosPaginadosResult {
  success: boolean;
  palpites: IPartidaDashboard[];
  total: number;
  message?: string;
}

export async function obterPalpitesSalvosPaginadosAction(
  limit: number,
  offset: number,
): Promise<IObterPalpitesSalvosPaginadosResult> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return {
      success: false,
      palpites: [],
      total: 0,
      message: 'Usuário não autenticado.',
    };
  }

  try {
    const total = await obterTotalPalpitesSalvosFuturos(session.id);
    const resultPalpites = await obterPalpitesSalvosFuturosPaginados(
      session.id,
      limit,
      offset,
    );

    return {
      success: true,
      palpites: resultPalpites,
      total,
    };
  } catch (error) {
    console.error('Erro ao obter palpites salvos paginados:', error);
    return {
      success: false,
      palpites: [],
      total: 0,
      message: 'Erro interno ao carregar palpites.',
    };
  }
}

export interface IObterTodosPalpitesResult {
  success: boolean;
  palpites: IPartidaDashboard[];
  message?: string;
}

export async function obterTodosPalpitesAction(): Promise<IObterTodosPalpitesResult> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return {
      success: false,
      palpites: [],
      message: 'Usuário não autenticado.',
    };
  }

  try {
    const resultPalpites = await obterTodosPalpitesUsuario(session.id);
    return {
      success: true,
      palpites: resultPalpites,
    };
  } catch (error) {
    console.error('Erro ao obter todos os palpites do usuário:', error);
    return {
      success: false,
      palpites: [],
      message: 'Erro interno ao carregar todos os palpites.',
    };
  }
}
