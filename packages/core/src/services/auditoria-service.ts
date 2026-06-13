type AuditoriaEvento =
  | 'LOGIN_SUCESSO'
  | 'LOGIN_FALHA'
  | 'LOGOUT'
  | 'TOKEN_EXPIRADO'
  | 'TOKEN_INVALIDO'
  | 'CSRF_BLOQUEADO'
  | 'RATE_LIMIT_BLOQUEADO'
  | 'ACESSO_NEGADO'
  | 'SESSAO_EXPIRADA';

interface AuditoriaDados {
  usuarioId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  metodo?: string;
  [key: string]: unknown;
}

interface AuditoriaEntry {
  timestamp: string;
  evento: AuditoriaEvento;
  dados: AuditoriaDados;
}

export function logAuditoria(
  evento: AuditoriaEvento,
  dados: AuditoriaDados = {},
): void {
  const entry: AuditoriaEntry = {
    timestamp: new Date().toISOString(),
    evento,
    dados: sanitizarDados(dados),
  };

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry));
  } else {
    const prefix = `[AUDITORIA][${entry.evento}]`;
    console.log(`${prefix} ${JSON.stringify(entry.dados)}`);
  }
}

function sanitizarDados(dados: AuditoriaDados): AuditoriaDados {
  const sanitized = { ...dados };
  if (sanitized.senha) delete sanitized.senha;
  if (sanitized.token && typeof sanitized.token === 'string' && sanitized.token.length > 20) {
    sanitized.token = sanitized.token.slice(0, 8) + '...';
  }
  return sanitized;
}

export type { AuditoriaEvento, AuditoriaDados };
