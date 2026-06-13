'use server';

import { validarOrigem } from '@/lib/csrf-server';
import { Palpite } from '@palpita/core';
import {
  comentarios,
  db,
  palpites,
  partidas,
  rodadas,
  times,
  usuarios,
} from '@palpita/db';
import {
  type Column,
  and,
  asc,
  count,
  desc,
  eq,
  lte,
  ne,
  or,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { obterSessao } from './auth';

export interface IEventoTimeline {
  id: string;
  timeA: string;
  timeB: string;
  timeAEmoji: string | null;
  timeBEmoji: string | null;
  golsTimeA: number | null;
  golsTimeB: number | null;
  dataInicio: string;
  status: string;
  rodadaId: string;
  rodadaNome: string;
  comentariosCount: number;
}

export interface IPontuadorRodada {
  usuarioNome: string;
  pontos: number;
}

export interface IPontuadorPartida {
  usuarioNome: string;
  palpiteA: number;
  palpiteB: number;
  pontos: number;
}

export interface IComentarioFormatado {
  id: string;
  usuarioNome: string;
  usuarioId: string;
  conteudo: string;
  dataCriacao: string;
}

// 1. Obter a timeline de eventos (jogos já iniciados ou finalizados)
export async function obterEventosTimeline(): Promise<{
  success: boolean;
  eventos: IEventoTimeline[];
  message?: string;
}> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return { success: false, eventos: [], message: 'Usuário não autenticado.' };
  }

  try {
    const timeA = alias(times, 'time_a');
    const timeB = alias(times, 'time_b');
    const agora = new Date();

    const queryResult = await db
      .select({
        id: partidas.id,
        timeA: timeA.nome,
        timeB: timeB.nome,
        timeAEmoji: timeA.emoji,
        timeBEmoji: timeB.emoji,
        golsTimeA: partidas.golsTimeA,
        golsTimeB: partidas.golsTimeB,
        dataInicio: partidas.dataInicio,
        status: partidas.status,
        rodadaId: partidas.rodadaId,
        rodadaNome: rodadas.nome,
        comentariosCount: count(comentarios.id),
      })
      .from(partidas)
      .innerJoin(rodadas, eq(partidas.rodadaId, rodadas.id))
      .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
      .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
      .leftJoin(comentarios, eq(partidas.id, comentarios.partidaId))
      .where(
        or(
          lte(partidas.dataInicio, agora),
          eq(partidas.status, 'FINALIZADO'),
          eq(partidas.status, 'FINALIZADA'),
        ),
      )
      .groupBy(
        partidas.id,
        timeA.nome,
        timeB.nome,
        timeA.emoji,
        timeB.emoji,
        partidas.golsTimeA,
        partidas.golsTimeB,
        partidas.dataInicio,
        partidas.status,
        partidas.rodadaId,
        rodadas.nome,
      )
      .orderBy(desc(partidas.dataInicio));

    const eventos: IEventoTimeline[] = queryResult.map((item) => ({
      id: item.id,
      timeA: item.timeA,
      timeB: item.timeB,
      timeAEmoji: item.timeAEmoji,
      timeBEmoji: item.timeBEmoji,
      golsTimeA: item.golsTimeA,
      golsTimeB: item.golsTimeB,
      dataInicio: item.dataInicio.toISOString(),
      status: item.status,
      rodadaId: item.rodadaId,
      rodadaNome: item.rodadaNome,
      comentariosCount: Number(item.comentariosCount),
    }));

    return { success: true, eventos };
  } catch (error) {
    console.error('Erro ao obter eventos da timeline:', error);
    return {
      success: false,
      eventos: [],
      message: 'Erro interno ao buscar timeline.',
    };
  }
}

// 2. Obter pontuadores de uma determinada rodada
export async function obterPontuadoresRodada(rodadaId: string): Promise<{
  success: boolean;
  pontuadores: IPontuadorRodada[];
  message?: string;
}> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return {
      success: false,
      pontuadores: [],
      message: 'Usuário não autenticado.',
    };
  }

  try {
    // Buscar todos os competidores ativos/liberados (que não sejam ADMIN)
    const competidores = await db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
      })
      .from(usuarios)
      .where(
        and(
          or(eq(usuarios.status, 'ATIVO'), eq(usuarios.status, 'LIBERADO')),
          ne(usuarios.cargo, 'ADMIN'),
        ),
      );

    // Buscar partidas finalizadas dessa rodada
    const partidasFinalizadas = await db
      .select({
        id: partidas.id,
        golsTimeA: partidas.golsTimeA,
        golsTimeB: partidas.golsTimeB,
      })
      .from(partidas)
      .where(
        and(
          eq(partidas.rodadaId, rodadaId),
          or(
            eq(partidas.status, 'FINALIZADO'),
            eq(partidas.status, 'FINALIZADA'),
          ),
        ),
      );

    if (partidasFinalizadas.length === 0) {
      return { success: true, pontuadores: [] };
    }

    const partidasMap = new Map<
      string,
      { golsTimeA: number; golsTimeB: number }
    >();
    const partidaIds: string[] = [];
    for (const p of partidasFinalizadas) {
      if (p.golsTimeA !== null && p.golsTimeB !== null) {
        partidasMap.set(p.id, {
          golsTimeA: p.golsTimeA,
          golsTimeB: p.golsTimeB,
        });
        partidaIds.push(p.id);
      }
    }

    // Buscar palpites nessas partidas
    const palpitesRodada = await db
      .select({
        usuarioId: palpites.usuarioId,
        partidaId: palpites.partidaId,
        golsTimeA: palpites.golsTimeA,
        golsTimeB: palpites.golsTimeB,
      })
      .from(palpites)
      .where(inArrayOrTrue(palpites.partidaId, partidaIds));

    // Agrupar palpites por usuário
    const palpitesPorUsuario = new Map<string, typeof palpitesRodada>();
    for (const palpite of palpitesRodada) {
      const list = palpitesPorUsuario.get(palpite.usuarioId) || [];
      list.push(palpite);
      palpitesPorUsuario.set(palpite.usuarioId, list);
    }

    // Calcular os pontos obtidos nessa rodada para cada usuário
    const pontuadores: IPontuadorRodada[] = [];

    for (const comp of competidores) {
      const userGuesses = palpitesPorUsuario.get(comp.id) || [];
      let pontosRodada = 0;

      for (const guess of userGuesses) {
        const match = partidasMap.get(guess.partidaId);
        if (match) {
          const palpiteEntity = new Palpite({
            id: 'placeholder',
            usuarioId: comp.id,
            partidaId: guess.partidaId,
            golsTimeA: guess.golsTimeA,
            golsTimeB: guess.golsTimeB,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
          });
          pontosRodada += palpiteEntity.calcularPontos(
            match.golsTimeA,
            match.golsTimeB,
          );
        }
      }

      if (pontosRodada > 0) {
        pontuadores.push({
          usuarioNome: comp.nome,
          pontos: pontosRodada,
        });
      }
    }

    // Ordenar pontuadores por pontos desc
    pontuadores.sort((a, b) => b.pontos - a.pontos);

    return { success: true, pontuadores };
  } catch (error) {
    console.error('Erro ao obter pontuadores da rodada:', error);
    return {
      success: false,
      pontuadores: [],
      message: 'Erro interno ao calcular pontuadores.',
    };
  }
}

// Auxiliar para lidar com inArray vazio
function inArrayOrTrue(column: Column, values: string[]) {
  if (values.length === 0) {
    return eq(column, '00000000-0000-0000-0000-000000000000'); // ID nulo para retornar nada
  }
  const { inArray } = require('drizzle-orm');
  return inArray(column, values);
}

// 3. Adicionar um comentário no confronto
export async function adicionarComentario(
  partidaId: string,
  conteudo: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await validarOrigem();
  } catch {
    return {
      success: false,
      message: 'Requisição inválida. Origem não permitida.',
    };
  }

  const session = await obterSessao();
  if (!session || !session.id) {
    return { success: false, message: 'Usuário não autenticado.' };
  }

  const texto = conteudo?.trim();
  if (!texto) {
    return {
      success: false,
      message: 'O conteúdo do comentário não pode estar vazio.',
    };
  }

  if (texto.length > 280) {
    return {
      success: false,
      message:
        'O comentário deve ter no máximo 280 caracteres (tamanho de um tweet).',
    };
  }

  try {
    const existingCommentsCount = await db
      .select({ count: count() })
      .from(comentarios)
      .where(
        and(
          eq(comentarios.partidaId, partidaId),
          eq(comentarios.usuarioId, session.id),
        ),
      );

    const totalCount = existingCommentsCount[0]?.count ?? 0;
    if (totalCount >= 10) {
      return {
        success: false,
        message: 'Você já atingiu o limite de 10 comentários para este jogo.',
      };
    }

    await db.insert(comentarios).values({
      partidaId,
      usuarioId: session.id,
      conteudo: texto,
    });

    return { success: true, message: 'Comentário enviado com sucesso!' };
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return {
      success: false,
      message: 'Erro ao enviar comentário. Tente novamente.',
    };
  }
}

// 4. Obter os comentários de uma partida
export async function obterComentariosPartida(partidaId: string): Promise<{
  success: boolean;
  comentarios: IComentarioFormatado[];
  message?: string;
}> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return {
      success: false,
      comentarios: [],
      message: 'Usuário não autenticado.',
    };
  }

  try {
    const list = await db
      .select({
        id: comentarios.id,
        conteudo: comentarios.conteudo,
        dataCriacao: comentarios.dataCriacao,
        usuarioNome: usuarios.nome,
        usuarioId: usuarios.id,
      })
      .from(comentarios)
      .innerJoin(usuarios, eq(comentarios.usuarioId, usuarios.id))
      .where(eq(comentarios.partidaId, partidaId))
      .orderBy(asc(comentarios.dataCriacao));

    const result: IComentarioFormatado[] = list.map((item) => ({
      id: item.id,
      usuarioNome: item.usuarioNome,
      usuarioId: item.usuarioId,
      conteudo: item.conteudo,
      dataCriacao: item.dataCriacao.toISOString(),
    }));

    return { success: true, comentarios: result };
  } catch (error) {
    console.error('Erro ao obter comentários da partida:', error);
    return {
      success: false,
      comentarios: [],
      message: 'Erro interno ao obter comentários.',
    };
  }
}

// 5. Obter pontuadores de uma partida/jogo específico
export async function obterPontuadoresPartida(partidaId: string): Promise<{
  success: boolean;
  pontuadores: IPontuadorPartida[];
  timeA?: string;
  timeB?: string;
  golsA?: number | null;
  golsB?: number | null;
  message?: string;
}> {
  const session = await obterSessao();
  if (!session || !session.id) {
    return {
      success: false,
      pontuadores: [],
      message: 'Usuário não autenticado.',
    };
  }

  try {
    const timeA = alias(times, 'time_a');
    const timeB = alias(times, 'time_b');

    const matchResult = await db
      .select({
        id: partidas.id,
        golsTimeA: partidas.golsTimeA,
        golsTimeB: partidas.golsTimeB,
        timeANome: timeA.nome,
        timeBNome: timeB.nome,
        status: partidas.status,
      })
      .from(partidas)
      .innerJoin(timeA, eq(partidas.timeAId, timeA.id))
      .innerJoin(timeB, eq(partidas.timeBId, timeB.id))
      .where(eq(partidas.id, partidaId))
      .limit(1);

    if (matchResult.length === 0) {
      return {
        success: false,
        pontuadores: [],
        message: 'Partida não encontrada.',
      };
    }

    const match = matchResult[0];

    // Se o jogo ainda não foi finalizado/não tem resultado, não há pontuação calculada
    if (
      match.golsTimeA === null ||
      match.golsTimeB === null ||
      (match.status !== 'FINALIZADO' && match.status !== 'FINALIZADA')
    ) {
      return {
        success: true,
        pontuadores: [],
        timeA: match.timeANome,
        timeB: match.timeBNome,
        golsA: match.golsTimeA,
        golsB: match.golsTimeB,
        message:
          'A pontuação será exibida quando o jogo for finalizado pelo administrador.',
      };
    }

    // Buscar todos os palpites para esta partida, trazendo o nome do usuário
    const listPalpites = await db
      .select({
        usuarioNome: usuarios.nome,
        palpiteA: palpites.golsTimeA,
        palpiteB: palpites.golsTimeB,
      })
      .from(palpites)
      .innerJoin(usuarios, eq(palpites.usuarioId, usuarios.id))
      .where(eq(palpites.partidaId, partidaId));

    const golsRealA = match.golsTimeA;
    const golsRealB = match.golsTimeB;

    const pontuadores: IPontuadorPartida[] = listPalpites.map((p) => {
      const palpiteEntity = new Palpite({
        id: 'placeholder',
        usuarioId: 'placeholder',
        partidaId,
        golsTimeA: p.palpiteA,
        golsTimeB: p.palpiteB,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });
      const pontos = palpiteEntity.calcularPontos(golsRealA, golsRealB);

      return {
        usuarioNome: p.usuarioNome,
        palpiteA: p.palpiteA,
        palpiteB: p.palpiteB,
        pontos,
      };
    });

    // Ordenar por pontos desc, e em caso de empate, por nome do competidor
    pontuadores.sort((a, b) => {
      if (b.pontos !== a.pontos) {
        return b.pontos - a.pontos;
      }
      return a.usuarioNome.localeCompare(b.usuarioNome);
    });

    return {
      success: true,
      pontuadores,
      timeA: match.timeANome,
      timeB: match.timeBNome,
      golsA: match.golsTimeA,
      golsB: match.golsTimeB,
    };
  } catch (error) {
    console.error('Erro ao obter pontuadores da partida:', error);
    return {
      success: false,
      pontuadores: [],
      message: 'Erro interno ao calcular pontuadores.',
    };
  }
}
