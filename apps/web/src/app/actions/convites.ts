'use server';

import { TokenConvite } from '@palpita/core';
import { db, tokensConvite, usuarios } from '@palpita/db';
import bcrypt from 'bcryptjs';
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

export async function cadastrarSenha(
  tokenId: string,
  senha: string,
): Promise<{ success: boolean; message: string }> {
  if (!tokenId) {
    return { success: false, message: 'Token inválido.' };
  }

  if (!senha || senha.length < 6) {
    return {
      success: false,
      message: 'A senha deve conter no mínimo 6 caracteres.',
    };
  }

  try {
    const res = await db.transaction(async (tx) => {
      // 1. Busca o token no banco
      const tokenData = await tx.query.tokensConvite.findFirst({
        where: eq(tokensConvite.id, tokenId),
      });

      if (!tokenData) {
        return { success: false, message: 'Token de convite não encontrado.' };
      }

      // 2. Cria a entidade de domínio do TokenConvite para validação
      const tokenConvite = new TokenConvite({
        id: tokenData.id,
        usuarioId: tokenData.usuarioId,
        dataCriacao: tokenData.dataCriacao,
        usado: tokenData.usado,
      });

      if (tokenConvite.usado) {
        return { success: false, message: 'Este token já foi utilizado.' };
      }

      if (tokenConvite.estaExpirado()) {
        return {
          success: false,
          message: 'Este link de convite expirou (limite de 5 minutos).',
        };
      }

      // 3. Busca o usuário vinculado
      const usuarioData = await tx.query.usuarios.findFirst({
        where: eq(usuarios.id, tokenData.usuarioId),
      });

      if (!usuarioData) {
        return { success: false, message: 'Usuário não encontrado.' };
      }

      if (usuarioData.status === 'ATIVO') {
        return { success: false, message: 'Este usuário já está ativo.' };
      }

      // 4. Gera o hash da senha
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);

      // 5. Atualiza o usuário e o token
      await tx
        .update(usuarios)
        .set({
          senha: hash,
          status: 'ATIVO',
        })
        .where(eq(usuarios.id, usuarioData.id));

      await tx
        .update(tokensConvite)
        .set({
          usado: true,
        })
        .where(eq(tokensConvite.id, tokenId));

      return { success: true, message: 'Cadastro concluído com sucesso!' };
    });

    return res;
  } catch (error) {
    console.error('Erro ao cadastrar senha:', error);
    return {
      success: false,
      message: 'Erro interno ao salvar os dados. Tente novamente mais tarde.',
    };
  }
}
