'use server';

import { obterSessao } from '@/app/actions/auth';
import {
  contarFeedbacksHoje,
  jaVotou,
  totalVotos,
} from '@/services/feedbacks.service';
import { db, feedbacks, feedbacksVotos } from '@palpita/db';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const criarFeedbackSchema = z.object({
  titulo: z.string().min(3).max(200),
  descricao: z.string().min(10).max(2000),
  tipo: z.enum(['sugestao', 'bug']),
});

export async function criarFeedback(data: z.infer<typeof criarFeedbackSchema>) {
  const session = await obterSessao();
  if (!session) {
    return { success: false, error: 'Faça login para enviar feedback.' };
  }

  const parsed = criarFeedbackSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const feedbacksHoje = await contarFeedbacksHoje(session.id);
  if (feedbacksHoje >= 3) {
    return {
      success: false,
      error: 'Você já enviou 3 feedbacks hoje. Tente novamente amanhã.',
    };
  }

  const result = await db
    .insert(feedbacks)
    .values({
      usuarioId: session.id,
      titulo: parsed.data.titulo,
      descricao: parsed.data.descricao,
      tipo: parsed.data.tipo,
    })
    .returning();

  revalidatePath('/feedback');

  return {
    success: true,
    feedback: result[0],
  };
}

export async function votarFeedback(feedbackId: string) {
  const session = await obterSessao();
  if (!session) {
    return { success: false, error: 'Faça login para votar.' };
  }

  const jaVotouFeedback = await jaVotou(feedbackId, session.id);

  if (jaVotouFeedback) {
    await db
      .delete(feedbacksVotos)
      .where(
        and(
          eq(feedbacksVotos.feedbackId, feedbackId),
          eq(feedbacksVotos.usuarioId, session.id),
        ),
      );
  } else {
    await db.insert(feedbacksVotos).values({
      feedbackId,
      usuarioId: session.id,
    });
  }

  const votos = await totalVotos(feedbackId);
  revalidatePath('/feedback');

  return {
    success: true,
    votou: !jaVotouFeedback,
    totalVotos: votos,
  };
}

export async function atualizarStatusFeedback(
  feedbackId: string,
  status: string,
  respostaAdmin?: string | null,
  linkAdmin?: string | null,
) {
  const session = await obterSessao();
  if (!session || session.cargo !== 'ADMIN') {
    return {
      success: false,
      error: 'Apenas administradores podem fazer isso.',
    };
  }

  const statusValidos = [
    'pendente',
    'revisando',
    'planejado',
    'concluido',
    'rejeitado',
  ];
  if (!statusValidos.includes(status)) {
    return { success: false, error: 'Status inválido.' };
  }

  if (status === 'rejeitado' && (!respostaAdmin || !respostaAdmin.trim())) {
    return {
      success: false,
      error: 'Por favor, informe a razão da rejeição.',
    };
  }

  await db
    .update(feedbacks)
    .set({
      status,
      respostaAdmin: respostaAdmin?.trim() || null,
      linkAdmin: linkAdmin?.trim() || null,
    })
    .where(eq(feedbacks.id, feedbackId));

  revalidatePath('/feedback');
  revalidatePath('/admin/feedbacks');

  return { success: true };
}
