## Why

O Palpita AI passou por uma auditoria de segurança que revelou 10 vulnerabilidades confirmadas no código, incluindo uma crítica que permite qualquer usuário forjar um cookie de administrador em segundos. Com a Copa 2026 se aproximando, o aplicativo precisa estar seguro antes de receber usuários reais.

## What Changes

- Substituir `btoa()`/`atob()` por JWT assinado com `jose` para sessão de usuário
- Adicionar validação de sessão no servidor (verificar se usuário está ativo no banco)
- Adicionar `sameSite: 'lax'` e validação de Origin/Referer nas Server Actions (CSRF)
- Remover credenciais hardcoded do repositório e usar variáveis de ambiente
- Adicionar rate limiting no login e endpoints gerais
- Adicionar headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Validar entradas com Zod nas Server Actions de palpites, admin e convites
- Adicionar logging de auditoria para ações sensíveis (login, admin, palpites)

## Capabilities

### New Capabilities
- `auth-sessao-segura`: Sessão de usuário com JWT assinado (HS256), expiração em 7 dias, validação contra banco de dados e cookie com httpOnly + sameSite
- `csrf-protecao`: Validação de Origin/Referer em todas as Server Actions para prevenir Cross-Site Request Forgery
- `rate-limit`: Rate limiting com Upstash para login (5 req/min) e endpoints gerais (30 req/min)
- `seguranca-headers`: Headers de segurança no middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- `credenciais-seguras`: Remoção de senhas hardcoded do código fonte e git, uso exclusivo de variáveis de ambiente
- `validacao-entradas`: Validação de tipos e formatos com Zod nas Server Actions
- `auditoria-logging`: Logging de auditoria no banco para ações sensíveis

### Modified Capabilities
- `infra-web`: Adicionar headers de segurança no middleware Next.js
- `persistencia-db`: Conexão com banco via `process.env.DATABASE_URL` em vez de string hardcoded

## Impact

- **apps/web/src/app/actions/auth.ts**: Substituir criação de sessão Base64 por JWT; adicionar rate limiting
- **apps/web/src/middleware.ts**: Adicionar verificação de JWT; adicionar headers de segurança
- **apps/web/src/app/actions/**: Adicionar CSRF validation e validação Zod em palpites.ts, admin.ts, convites.ts
- **packages/db/src/connection.ts**: Usar `process.env.DATABASE_URL`
- **packages/db/drizzle.config.ts**: Usar `process.env.DATABASE_URL`
- **apps/web/.env.local**: Novo arquivo gitignorado com credenciais reais
- **Novas dependências**: `jose` para JWT, `@upstash/ratelimit` + `@upstash/redis` para rate limiting
- **apps/web/src/lib/session.ts**: Novo módulo helper para criar/verificar JWT
- **apps/web/src/lib/csrf.ts**: Novo módulo helper para validação de origem
- **apps/web/src/lib/rate-limit.ts**: Novo módulo helper para rate limiting
- **docker-compose.yml**: Manter credenciais de exemplo para dev, mas documentar que produção usa env vars
