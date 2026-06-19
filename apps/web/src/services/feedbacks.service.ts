import { db, feedbacks, feedbacksVotos } from '@palpita/db';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';

export interface IFeedbackListaItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  dataCriacao: Date;
  totalVotos: number;
  usuarioVotou: boolean;
  usuarioId: string;
  usuarioNome: string;
}

export async function listarFeedbacks(
  usuarioId?: string,
): Promise<IFeedbackListaItem[]> {
  const votosSubquery = db
    .select({
      feedbackId: feedbacksVotos.feedbackId,
      total: count(feedbacksVotos.id).as('total'),
    })
    .from(feedbacksVotos)
    .groupBy(feedbacksVotos.feedbackId)
    .as('votos_sub');

  const result = await db
    .select({
      id: feedbacks.id,
      titulo: feedbacks.titulo,
      descricao: feedbacks.descricao,
      tipo: feedbacks.tipo,
      status: feedbacks.status,
      dataCriacao: feedbacks.dataCriacao,
      usuarioId: feedbacks.usuarioId,
      usuarioNome: sql<string>`(SELECT nome FROM usuarios WHERE id = ${feedbacks.usuarioId})`,
      totalVotos: sql<number>`COALESCE(${votosSubquery.total}, 0)`,
    })
    .from(feedbacks)
    .leftJoin(votosSubquery, eq(feedbacks.id, votosSubquery.feedbackId))
    .orderBy(
      desc(sql`COALESCE(${votosSubquery.total}, 0)`),
      desc(feedbacks.dataCriacao),
    );

  const votosUsuario = usuarioId
    ? await db
        .select({ feedbackId: feedbacksVotos.feedbackId })
        .from(feedbacksVotos)
        .where(eq(feedbacksVotos.usuarioId, usuarioId))
    : [];

  const votosUsuarioSet = new Set(votosUsuario.map((v) => v.feedbackId));

  return result.map((r) => ({
    ...r,
    totalVotos: Number(r.totalVotos) || 0,
    usuarioVotou: votosUsuarioSet.has(r.id),
  }));
}

export async function obterFeedbackPorId(id: string) {
  const result = await db.query.feedbacks.findFirst({
    where: eq(feedbacks.id, id),
  });
  return result || null;
}

export async function contarFeedbacksHoje(usuarioId: string): Promise<number> {
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);

  const result = await db
    .select({ total: count(feedbacks.id) })
    .from(feedbacks)
    .where(
      and(eq(feedbacks.usuarioId, usuarioId), gte(feedbacks.dataCriacao, hoje)),
    );

  return result[0]?.total ?? 0;
}

export async function jaVotou(
  feedbackId: string,
  usuarioId: string,
): Promise<boolean> {
  const result = await db
    .select({ id: feedbacksVotos.id })
    .from(feedbacksVotos)
    .where(
      and(
        eq(feedbacksVotos.feedbackId, feedbackId),
        eq(feedbacksVotos.usuarioId, usuarioId),
      ),
    );

  return result.length > 0;
}

export async function totalVotos(feedbackId: string): Promise<number> {
  const result = await db
    .select({ total: count(feedbacksVotos.id) })
    .from(feedbacksVotos)
    .where(eq(feedbacksVotos.feedbackId, feedbackId));

  return result[0]?.total ?? 0;
}
