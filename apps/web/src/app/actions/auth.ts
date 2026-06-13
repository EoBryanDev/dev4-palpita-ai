'use server';

import {
  Usuario,
  criarToken,
  verificarToken,
  logAuditoria,
  verificarRateLimit,
} from '@palpita/core';
import { db, usuarios } from '@palpita/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';

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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.')
    .max(255, 'E-mail muito longo.'),
  senha: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .max(128, 'Senha muito longa.'),
});

export async function loginUsuario(
  email: string,
  senhaInformada: string,
): Promise<ILoginResult> {
  const validated = loginSchema.safeParse({ email, senha: senhaInformada });
  if (!validated.success) {
    const firstError = validated.error.errors[0]?.message ?? 'Dados inválidos.';
    return { success: false, message: firstError };
  }

  const { email: emailValido, senha: senhaValida } = validated.data;

  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown';

  const rateCheck = verificarRateLimit(ip, 'LOGIN');
  if (!rateCheck.permitido) {
    logAuditoria('LOGIN_FALHA', {
      email: emailValido,
      motivo: 'rate_limit_excedido',
    });
    return {
      success: false,
      message: `Muitas tentativas de login. Tente novamente em ${Math.ceil(rateCheck.resetEmMs / 1000)} segundos.`,
    };
  }

  try {
    const usuarioData = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, emailValido.trim().toLowerCase()))
      .limit(1);

    if (usuarioData.length === 0) {
      logAuditoria('LOGIN_FALHA', {
        email: emailValido,
        motivo: 'usuario_nao_encontrado',
      });
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
      logAuditoria('LOGIN_FALHA', {
        email: emailValido,
        motivo: 'senha_incorreta',
      });
      return { success: false, message: 'Credenciais inválidas.' };
    }

    await db
      .update(usuarios)
      .set({ ultimoLoginAt: new Date() })
      .where(eq(usuarios.id, usuario.id))
      .execute();

    const usuarioEntity = new Usuario({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      status: usuario.status,
      dataCriacao: usuario.dataCriacao,
      ultimoLoginAt: usuario.ultimoLoginAt,
      senha: usuario.senha,
    });

    const token = await criarToken(usuarioEntity);
    logAuditoria('LOGIN_SUCESSO', {
      usuarioId: usuario.id,
      email: emailValido,
    });

    const cookieStore = await cookies();
    cookieStore.set('palpita_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

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

export async function logoutUsuario(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('palpita_session');
    logAuditoria('LOGOUT', {});
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

    const sessao = await verificarToken(sessionCookie);
    if (!sessao) return null;

    return {
      id: sessao.sub,
      nome: sessao.nome,
      email: sessao.email,
      cargo: sessao.cargo,
    };
  } catch (error) {
    return null;
  }
}
