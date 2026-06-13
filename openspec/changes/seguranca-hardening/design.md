## Context

Uma auditoria de segurança no código do Palpita AI identificou 10 vulnerabilidades confirmadas:

1. **C-01 (Crítica):** Cookie de sessão (`palpita_session`) é `btoa()` do JSON sem assinatura — qualquer um pode forjar um cookie com `cargo: "ADMIN"`
2. **C-02 (Crítica):** Credenciais do banco PostgreSQL hardcoded em `connection.ts`, `drizzle.config.ts` e `docker-compose.yml`
3. **C-03 (Alta):** Nenhuma Server Action valida Origin/Referer — CSRF possível
4. **A-01 (Alta):** `obterSessao()` decodifica cookie mas nunca valida sessão contra o banco
5. **A-02 (Alta):** Nenhum endpoint tem rate limiting
6. **A-03 (Alta):** Nenhum header de segurança (CSP, HSTS) configurado
7. **M-02 (Média):** Login e palpites sem validação Zod
8. **M-04 (Média):** `X-Powered-By` ativo; versão do Next exposta
9. **B-01 (Baixa):** Falhas de login sem lockout/delay
10. **B-02 (Baixa):** Cookie `maxAge` 7d sem `sameSite` explícito

## Goals / Non-Goals

**Goals:**
- Substituir `btoa()`/`atob()` por JWT assinado com `jose` (HS256)
- Adicionar validação de sessão no servidor contra o banco de dados
- Remover todas as credenciais hardcoded do código fonte
- Adicionar validação Origin/Referer nas Server Actions
- Adicionar rate limiting com Upstash
- Adicionar headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Remover `X-Powered-By` e informações de versão
- Validar entradas com Zod nas Server Actions
- Adicionar logging de auditoria para ações sensíveis

**Non-Goals:**
- Autenticação 2FA
- OAuth/SSO
- Gerenciamento de roles/permissões além de USER/ADMIN existente
- Criptografia de dados em repouso no banco
- WAF ou proteção DDoS externa

## Decisions

### 1. JWT para Sessão (C-01, A-01, B-02)
- **Decisão:** Usar `jose` (biblioteca puramente JS, sem native addons) com HS256
- **Alternativa:** `jsonwebtoken` (depende de OpenSSL nativo, problemas com Edge Runtime)
- **Justificativa:** `jose` funciona no Edge Runtime do Next.js e não requer compilação nativa
- **Cookie:** `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 604800` (7d), `secure: true` em produção
- **Payload:** `{ sub: userId, cargo: "USER"|"ADMIN", iat, exp }` — sem dados sensíveis
- **Validação servidor:** Além da verificação da assinatura JWT, consultar banco para verificar se usuário está `ATIVO`

### 2. Remoção de Credenciais Hardcoded (C-02)
- **Decisão:** `connection.ts`, `drizzle.config.ts` e `docker-compose.yml` usarão `process.env.DATABASE_URL`
- **docker-compose.yml:** Manter valores de exemplo para desenvolvimento local
- **.env.example:** Atualizar com `DATABASE_URL` e documentar formato
- **Gitignore:** Verificar se `.env` já está no `.gitignore`

### 3. CSRF Protection (C-03)
- **Decisão:** Validar header `Origin` ou `Referer` em toda Server Action
- **Helper:** Função `validarOrigem(headers)` que verifica se Origin/Referer corresponde ao domínio da aplicação
- **Fallback:** Se ambos os headers estiverem ausentes, rejeitar (POST requests legítimos sempre têm um dos dois)

### 4. Rate Limiting (A-02, B-01)
- **Decisão:** Usar `@upstash/ratelimit` + `@upstash/redis` (serverless Redis via REST, sem latência de conexão)
- **Alternativa:** Middleware custom com `Map` em memória (perde estado em serverless)
- **Login:** Janela deslizante de 5 tentativas por minuto por IP
- **Geral:** 30 requisições por minuto por IP
- **Exceções:** Rotas estáticas e assets não serão rate-limited

### 5. Headers de Segurança (A-03, M-04)
- **Decisão:** Configurar no Next.js middleware para adicionar headers em TODAS as respostas
- **CSP:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`
- **HSTS:** `max-age=31536000; includeSubDomains` (apenas produção)
- **X-Frame-Options:** `DENY`
- **X-Content-Type-Options:** `nosniff`
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **X-Powered-By:** Remover via `next.config.ts` `poweredByHeader: false`

### 6. Validação de Entradas (M-02)
- **Decisão:** Zod schemas para todas as Server Actions
- **Login:** Validar formato de email, senha não vazia
- **Palpites:** Validar `partidaId` como número, `golsTimeA`/`golsTimeB` como números >= 0
- **Admin:** Validar todos os campos de formulário
- **Convites:** Validar UUID, email

### 7. Auditoria Logging
- **Decisão:** Tabela `auditoria_log` no banco PostgreSQL (não Redis — precisa ser permanente)
- **Eventos:** `LOGIN_SUCESSO`, `LOGIN_FALHA`, `PALPITE_ENVIADO`, `PALPITE_ALTERADO`, `ADMIN_ACAO`
- **Payload:** `{ userId?, action, target, details, ip, timestamp }`
- **Retenção:** 90 dias (pode ser ajustado via env)

## Risks / Trade-offs

- **[Risco] Chave JWT exposta no git** → **[Mitigação]** `JWT_SECRET` gerada automaticamente e adicionada ao `.env.example` com instrução clara. CI validation no workflow.
- **[Risco] Upstash Redis dependency para rate limiting** → **[Mitigação]** Fallback para rate limiting em memória se Upstash não estiver configurado. Rate limiting não é crítico para funcionamento do app.
- **[Risco] CSP muito restritivo quebrando funcionalidades** → **[Mitigação]** Usar `default-src 'self'` inicialmente; report-only mode opcional; ajustar conforme necessidade.
- **[Risco] Auditoria logging encher o banco** → **[Mitigação]** Tabela com `createdAt` indexado; cleanup periódico; apenas eventos sensíveis são logados.
