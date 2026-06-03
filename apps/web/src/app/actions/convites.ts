'use server';

import { db, usuarios } from '@palpita/db';
import { eq } from 'drizzle-orm';

interface ISolicitarConviteResult {
  success: boolean;
  message: string;
}

export async function solicitarConvite(
  nome: string,
  email: string,
): Promise<ISolicitarConviteResult> {
  if (!nome || nome.trim().length === 0) {
    return { success: false, message: 'O nome é obrigatório.' };
  }

  if (!email || email.trim().length === 0) {
    return { success: false, message: 'O e-mail é obrigatório.' };
  }

  // Regex simples para validação de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Formato de e-mail inválido.' };
  }

  try {
    // Verifica se já existe um usuário com esse e-mail
    const usuarioExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.trim().toLowerCase()))
      .limit(1);

    if (usuarioExistente.length > 0) {
      return {
        success: false,
        message: 'Este e-mail já possui cadastro ou solicitação pendente.',
      };
    }

    // Insere o usuário com status PENDENTE e cargo COLABORADOR
    await db.insert(usuarios).values({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      status: 'PENDENTE',
      cargo: 'COLABORADOR',
      dataCriacao: new Date(),
    });

    return {
      success: true,
      message:
        'Solicitação enviada com sucesso! Aguarde a aprovação do administrador.',
    };
  } catch (error) {
    console.error('Erro ao solicitar convite:', error);
    return {
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
    };
  }
}
