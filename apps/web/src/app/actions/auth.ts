'use server';

import { db, usuarios } from '@palpita/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export interface ILoginResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    cargo: string;
  };
}

export async function loginUsuario(
  email: string,
  senhaInformada: string,
): Promise<ILoginResult> {
  if (!email || email.trim().length === 0) {
    return { success: false, message: 'O e-mail é obrigatório.' };
  }

  if (!senhaInformada || senhaInformada.length === 0) {
    return { success: false, message: 'A senha é obrigatória.' };
  }

  try {
    const usuarioData = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.trim().toLowerCase()))
      .limit(1);

    if (usuarioData.length === 0) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    const usuario = usuarioData[0];

    if (!usuario.senha) {
      return {
        success: false,
        message:
          'Sua conta ainda não foi ativada. Defina sua senha usando o link enviado por e-mail.',
      };
    }

    if (usuario.status !== 'ATIVO') {
      return {
        success: false,
        message: 'Sua conta está pendente de liberação ou inativa.',
      };
    }

    const senhaValida = await bcrypt.compare(senhaInformada, usuario.senha);

    if (!senhaValida) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    return {
      success: true,
      message: 'Autenticação realizada com sucesso!',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return {
      success: false,
      message: 'Erro interno ao realizar login. Tente novamente mais tarde.',
    };
  }
}
