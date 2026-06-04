'use server';

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
    // 2. Verificar status de liberação do usuário no banco (RN05)
    const user = await db
      .select({ status: usuarios.status })
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

    // 3. Buscar a partida para validar o prazo (RN02)
    const match = await db
      .select({ dataInicio: partidas.dataInicio, status: partidas.status })
      .from(partidas)
      .where(eq(partidas.id, partidaId))
      .limit(1);

    if (match.length === 0) {
      return { success: false, message: 'Partida não encontrada.' };
    }

    const agora = new Date();
    const dataInicioPartida = new Date(match[0].dataInicio);

    if (agora >= dataInicioPartida || match[0].status === 'FINALIZADO') {
      return {
        success: false,
        message:
          'O prazo para palpitar nesta partida já expirou (jogo iniciado ou finalizado).',
      };
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
