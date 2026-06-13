# Tasks: Segurança e Hardening

## Task 1: Instalar dependências de segurança

- **Status:** COMPLETED
- **Priority:** HIGH
- **Description:** Adicionar e instalar pacotes necessários para segurança (bcrypt já está instalado).

### Implementation
- Adicionar `jsonwebtoken`, `zod` no `packages/core/package.json`
- Adicionar `@types/jsonwebtoken` como devDependency
- Instalar dependências com o gerenciador de pacotes do monorepo

## Task 2: Configurar variáveis de ambiente de segurança

- **Status:** COMPLETED
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

## Task 3: Migração do schema — ultimo_login_at

- **Status:** COMPLETED
- **Priority:** HIGH
- **Description:** Adicionar campo de tracking de login (senha já está com bcrypt, status já existe).

### Implementation
- Adicionar campo `ultimo_login_at timestamp` (nullable) na tabela `usuario`
- Migration manual `0003_add_ultimo_login_at.sql` (DrizzleKit bloqueado por mismatch schemal/snapshot)
- `_journal.json` e `0003_snapshot.json` atualizados
- Migration aplicada no banco via `pnpm db:migrate`
- `IUsuarioProps` e classe `Usuario` em `packages/core/src/domain/usuario.entity.ts` atualizados com `ultimoLoginAt` e método `registrarLogin()`

## Task 4: Módulo de sessão com JWT

- **Status:** COMPLETED
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

- **Status:** COMPLETED
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

- **Status:** COMPLETED
- **Priority:** HIGH
- **Description:** Implementar proteção CSRF via double-submit cookie pattern.

### Implementation
- Criar `GET /api/csrf` — gera token aleatório, retorna no body e seta cookie httpOnly
- Criar middleware/helper `validarCsrf(req)`:
  - Pular validação para GET/HEAD/OPTIONS
  - Comparar cookie `csrf-token` com header `X-CSRF-Token`
  - Retornar 403 se inválido ou ausente
- Aplicar validação CSRF em todas as rotas de mutação protegidas por cookie
- Service `csrf-service.ts` criado com `gerarTokenCsrf()`, `validarTokenCsrf()`, `validarCsrf()`
- `GET /api/csrf` criado e integrado ao middleware via `CSRF_CONFIG.COOKIE_NAME` / `CSRF_CONFIG.HEADER_NAME`

## Task 7: Rate limiting

- **Status:** COMPLETED
- **Priority:** MEDIUM
- **Description:** Implementar rate limiting para endpoints de API.

### Implementation
- `verificarRateLimit(ip, 'LOGIN')` adicionado no início da server action `loginUsuario` em `auth.ts`.
- `verificarRateLimit(ip, 'API')` para toda rota `/api/` no middleware, retornando 429 + `Retry-After`.
- IP extraído de `x-forwarded-for` → `x-real-ip` → `'unknown'`.
- `LOGIN`: 5 req/min, `API`: 100 req/min (config in-memory em `packages/core/src/services/rate-limit-service.ts`).

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

## Task 9: Login seguro com validação Zod e JWT

- **Status:** COMPLETED
- **Priority:** HIGH
- **Description:** Atualizar fluxo de login com validação Zod (senha já usa bcrypt existente).

### Implementation
- Atualizar schema Zod de login: `{ email: z.string().email(), senha: z.string().min(6) }`
- No login handler:
  - Validar entrada com Zod, retornar 400 se inválida
  - Buscar usuário por email
  - Comparar senha com bcrypt (já existente)
  - Se falhar: log `LOGIN_FALHA`, retornar "Credenciais inválidas."
  - Se ok: atualizar `ultimo_login_at`, gerar JWT, setar cookie, log `LOGIN_SUCESSO`

## Task 10: Logs de auditoria de segurança

- **Status:** COMPLETED
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
