## Context

O monorepo atualmente tem 4 pacotes: `@palpita/core`, `@palpita/db`, `@palpita/web`, `@palpita/tsconfig`. As partidas da Copa 2026 (72 jogos, 3 rodadas) estão cadastradas no banco PostgreSQL via Drizzle, mas os resultados são inseridos manualmente por admin. Não existe nenhum mecanismo de scraping ou ingestão automática.

O usuário deseja que o scraper seja um app dentro de `apps/` (não packages), seguindo a estrutura do monorepo com pnpm + Turborepo.

## Goals / Non-Goals

**Goals:**
- Criar um app `apps/scraper/` com scraper em Node.js que consulta o Google para obter placares e eventos
- Nova tabela `eventos_partida` para armazenar gols, cartões, substituições (migration 0005 em `@palpita/db`)
- Mecanismo de sync que busca partidas pendentes, scrapeia e faz upsert
- Dockerfile multi-stage + GitHub Actions para publicar imagem no DockerHub
- Modos CLI `run` (execução única) e `watch` (cron interno)

**Non-Goals:**
- Não alterar o app `@palpita/web` (Next.js) — o scraper é independente
- Não expor API HTTP pública — o scraper é CLI/processo interno
- Não refatorar o schema existente de `partidas` — apenas adicionar `eventos_partida`
- Não incluir deploy ArgoCD neste repo (é em repo GitOps separado)

## Decisions

### 1. Localização: `apps/scraper/` em vez de `packages/scraper/`
- O usuário explicitamente pediu dentro de `apps/`, não `packages/`
- Faz sentido porque é um executável/deployável, não uma biblioteca reutilizável

### 2. Estratégia de scraping: Google Search + cheerio (fetch puro), fallback Playwright
- Google Search mostra Knowledge Panel com placar para partidas de futebol
- Começamos com fetch + cheerio (leve, sem browser, imagem Docker menor)
- Se Google bloquear, ativamos fallback com Playwright (browser headless + stealth)
- A engine é abstrata por interface, permitindo trocar fonte sem alterar o sync

### 3. Abstração de engine (Strategy Pattern)
```
interface IScraperEngine {
  scrapeMatch(timeA: string, timeB: string): Promise<IScrapeResult | null>
}
```
- GoogleEngine (cheerio) implementa
- PlaywrightEngine (browser) implementa se necessário
- SyncService não conhece a fonte

### 4. Dados no banco: upsert idempotente
- Se a partida já tem resultado e não mudou: skip
- Se mudou (ex: gol novo): atualiza placar e adiciona eventos novos
- Se não tem resultado: insere tudo

### 5. Schema nova tabela em `@palpita/db` (migration 0005)
- `eventos_partida` fica em `packages/db/src/schema.ts`
- Gera migration com `drizzle-kit generate`
- Reaproveita as conexões, tipos e utilitários existentes

### 6. Cron: node-cron no modo watch, mas CronJob do Kubernetes no VPS
- `pnpm scraper watch` usa node-cron internamente para testar local
- Em produção (VPS/ArgoCD), o CronJob do K8s chama `pnpm scraper run` a cada N minutos
- Evita processo idle desnecessário no cluster

### 7. Segurança
- Zod para validar dados scrapados ANTES de escrever no banco
- Rate limiting (1 request a cada 2s no Google)
- Audit log (console estruturado com timestamp e resultado de cada scrape)
- Credenciais via env vars (mesmo padrão do projeto)

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Google bloquear fetch puro (403/429) | Fallback Playwright com stealth mode + rotação de user-agent |
| Google mudar estrutura do HTML/knowledge panel | Extração por selectors específicos + testes que quebram alertando |
| Scraper sobrecarregar banco com muitas escritas | Upsert condicional (só escreve se mudou), batch de eventos |
| Partida ao vivo com placar mudando a cada minuto | Intervalo de 2-5 min entre scrapes, modo watch com cooldown |
| Fonte externa ficar offline | Retry com exponential backoff (3 tentativas), log de erro |
