# Tasks: Segurança e Hardening

## Task 1: Instalar dependências de segurança

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Adicionar e instalar pacotes necessários para segurança.

### Implementation
- Adicionar `jsonwebtoken`, `bcrypt`, `zod` no `packages/core/package.json`
- Adicionar `@types/jsonwebtoken`, `@types/bcrypt` como devDependencies
- Instalar dependências com o gerenciador de pacotes do monorepo

## Task 2: Configurar variáveis de ambiente de segurança

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Adicionar e documentar variáveis de ambiente para módulos de segurança.

### Implementation
- Adicionar ao `.env.example`:
  - `JWT_SECRET` (min 32 caracteres)
  - `JWT_EXPIRES_IN` (default: `7d`)
  - `BCRYPT_SALT_ROUNDS` (default: `12`)
  - `RATE_LIMIT_LOGIN_MAX` (default: `5`)
  - `RATE_LIMIT_LOGIN_WINDOW_MS` (default: `60000`)
  - `RATE_LIMIT_GENERAL_MAX` (default: `100`)
  - `RATE_LIMIT_GENERAL_WINDOW_MS` (default: `60000`)
- Validar `JWT_SECRET` no startup (min 32 chars, obrigatório)
- Validar `BCRYPT_SALT_ROUNDS` (mínimo 10)

## Task 3: Migração do schema — senha_hash, status e ultimo_login_at

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Alterar schema do banco para suportar hash de senha, status do usuário e tracking de login.

### Implementation
- Adicionar campo `senha_hash text not null` na tabela `usuario`
- Remover campo `senha` (texto puro) da tabela `usuario`
- Adicionar campo `status text not null default 'ATIVO'` na tabela `usuario`, com constraint check `status in ('ATIVO', 'INATIVO')`
- Adicionar campo `ultimo_login_at timestamp` (nullable) na tabela `usuario`
- Criar migration Drizzle

## Task 4: Módulo de sessão com JWT

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Implementar módulo de sessão usando JWT assinado com HS256.

### Implementation
- Criar `packages/core/src/domain/sessao.ts` — entidade de domínio com `sub`, `cargo`, `iat`, `exp`
- Criar `packages/core/src/services/sessao-service.ts`:
  - `criarToken(usuario): string` — gera JWT com payload `{ sub, cargo, iat, exp }`
  - `verificarToken(token): Sessao | null` — verifica assinatura e expiração
  - `obterSegredo(): string` — lê de `process.env.JWT_SECRET`, valida tamanho
- Usar `jsonwebtoken` com algoritmo HS256
- Payload: `{ sub: usuario.id, cargo: usuario.cargo, iat: Date.now(), exp: Date.now() + 7d }`

## Task 5: Middleware de sessão Next.js

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Implementar middleware Next.js para proteger rotas autenticadas.

### Implementation
- Criar `src/middleware.ts`:
  - Ler cookie `palpita_session`
  - Verificar JWT via `sessao-service.verificarToken`
  - Validar sessão contra banco (usuário ativo)
  - Redirecionar para `/login` com `?redirect=...` se inválido
  - Permitir acesso a rotas públicas (`/login`, `/api/login`, `/api/csrf`, etc.)
- Configurar cookie com `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (produção), `maxAge: 604800`

## Task 6: Proteção CSRF

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Implementar proteção CSRF via double-submit cookie pattern.

### Implementation
- Criar `GET /api/csrf` — gera token aleatório, retorna no body e seta cookie não httpOnly
- Criar middleware/helper `validarCsrf(req)`:
  - Pular validação para GET/HEAD/OPTIONS
  - Comparar cookie `csrf-token` com header `X-CSRF-Token`
  - Retornar 403 se inválido ou ausente
- Aplicar validação CSRF em todas as rotas de mutação protegidas por cookie

## Task 7: Rate limiting

- **Status:** PENDING
- **Priority:** MEDIUM
- **Description:** Implementar rate limiting para endpoints de API.

### Implementation
- Criar `packages/core/src/services/rate-limit-service.ts`:
  - Store em memória (Map com IP -> { count, windowStart })
  - Limpeza periódica de janelas expiradas
  - `verificar(ip, tipo: 'login' | 'general'): { permitido: boolean, resetEm: number }`
- Criar middleware/helper para rotas de API
- Aplicar limite de 5/min para login, 100/min para geral
- Retornar 429 com `Retry-After` quando excedido
- Configurável via variáveis de ambiente

## Task 8: Security headers

- **Status:** PENDING
- **Priority:** MEDIUM
- **Description:** Configurar headers de segurança HTTP na aplicação Next.js.

### Implementation
- Configurar `next.config.js` com `headers()`:
  - `Content-Security-Policy` — restritiva mas permitindo recursos legítimos
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 0`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — restrições mínimas
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (apenas produção)
- Testar que headers estão presentes em respostas

## Task 9: Login seguro com bcrypt e validação Zod

- **Status:** PENDING
- **Priority:** HIGH
- **Description:** Atualizar fluxo de login para usar bcrypt e validação de entrada com Zod.

### Implementation
- Atualizar schema Zod de login: `{ email: z.string().email(), senha: z.string().min(6) }`
- No login handler:
  - Validar entrada com Zod, retornar 400 se inválida
  - Buscar usuário por email
  - Comparar senha com bcrypt
  - Se falhar: log `LOGIN_FAILURE`, retornar 401 "Email ou senha inválidos"
  - Se ok: atualizar `ultimo_login_at`, gerar JWT, setar cookie, log `LOGIN_SUCCESS`
- Atualizar cadastro de usuário para usar `senha_hash` e bcrypt

## Task 10: Logs de auditoria de segurança

- **Status:** PENDING
- **Priority:** MEDIUM
- **Description:** Implementar logging estruturado de eventos de segurança.

### Implementation
- Criar `packages/core/src/services/auditoria-service.ts`:
  - `logar(evento: string, dados: Record<string, unknown>)` — loga em formato JSON
  - Eventos: `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `SESSAO_INVALIDA`
- Garantir que logs NUNCA contenham senhas ou tokens completos
- Usar `console.log` com JSON.stringify (pode ser substituído por winston/pino depois)

## Task 11: Feedback de segurança no frontend

- **Status:** PENDING
- **Priority:** MEDIUM
- **Description:** Adicionar feedback visual para eventos de segurança no frontend.

### Implementation
- Criar hook/componente para detectar sessão expirada (401 em requisição autenticada)
- Exibir toast/modal "Sua sessão expirou. Faça login novamente."
- Integrar obtenção de token CSRF no fluxo de formulários
- Limpar campo de senha em falha de login
- Mensagens de erro em português
