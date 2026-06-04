'use server';

import { db, usuarios } from '@palpita/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

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

export interface ISessionUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
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

    if (usuario.status !== 'ATIVO' && usuario.status !== 'LIBERADO') {
      return {
        success: false,
        message: 'Sua conta está pendente de liberação ou inativa.',
      };
    }

    const senhaValida = await bcrypt.compare(senhaInformada, usuario.senha);

    if (!senhaValida) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    const sessionData: ISessionUser = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    };

    const cookieStore = await cookies();
    cookieStore.set(
      'palpita_session',
      btoa(encodeURIComponent(JSON.stringify(sessionData))),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: '/',
      },
    );

    return {
      success: true,
      message: 'Autenticação realizada com sucesso!',
      user: sessionData,
    };
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return {
      success: false,
      message: 'Erro interno ao realizar login. Tente novamente mais tarde.',
    };
  }
}

export async function logoutUsuario(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('palpita_session');
    return { success: true, message: 'Logout realizado com sucesso!' };
  } catch (error) {
    console.error('Erro ao realizar logout:', error);
    return {
      success: false,
      message: 'Erro interno ao realizar logout. Tente novamente mais tarde.',
    };
  }
}

export async function obterSessao(): Promise<ISessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('palpita_session')?.value;
    if (!sessionCookie) {
      return null;
    }

    const sessionStr = decodeURIComponent(atob(sessionCookie));
    return JSON.parse(sessionStr);
  } catch (error) {
    return null;
  }
}
