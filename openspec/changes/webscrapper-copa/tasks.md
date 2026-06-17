## 1. App Scaffold

- [x] 1.1 Criar `apps/scraper/package.json` com @palpita/scraper, build script, dependências iniciais
- [x] 1.2 Criar `apps/scraper/tsconfig.json` estendendo @palpita/tsconfig
- [x] 1.3 Adicionar `@palpita/scraper` no Turborepo (turbo.json) se necessário
- [x] 1.4 Instalar dependências: cheerio, zod, node-cron, dotenv

## 2. Database — Migration eventos_partida

- [x] 2.1 Adicionar tabela `eventos_partida` no schema de `@palpita/db`
- [x] 2.2 Gerar migration com `drizzle-kit generate`
- [x] 2.3 Exportar `eventosPartida` no barrel export de `@palpita/db`

## 3. Scraper Engine

- [x] 3.1 Criar interfaces e tipos (`src/types.ts`): IScraperEngine, IScrapeResult, IScrapeEvent
- [x] 3.2 Implementar GoogleEngine (`src/engines/google-engine.ts`) com fetch + cheerio
- [x] 3.3 Implementar query builder sanitizado para busca no Google
- [x] 3.4 Implementar parser do Knowledge Panel (placar, status, eventos)
- [x] 3.5 Implementar PlaywrightEngine (`src/engines/playwright-engine.ts`) como fallback

## 4. Sync Engine

- [x] 4.1 Implementar queries Drizzle em `src/db/queries.ts` (buscar pendentes, upsert resultado, inserir eventos)
- [x] 4.2 Implementar SyncService (`src/services/sync.service.ts`) — orquestrador
- [x] 4.3 Implementar detecção de mudanças (só upsert se o placar mudou)
- [x] 4.4 Implementar dedup de eventos (evitar inserir o mesmo gol duas vezes)
- [x] 4.5 Implementar audit logging estruturado

## 5. CLI

- [x] 5.1 Implementar `src/index.ts` com modo `run` (execução única)
- [x] 5.2 Implementar modo `watch` com node-cron e intervalo configurável
- [x] 5.3 Adicionar script `"scraper"` no package.json: `tsx src/index.ts`

## 6. Testes

- [x] 6.1 Mock do Google Engine para testes unitários
- [x] 6.2 Testes do sync service com DB em memória
- [x] 6.3 Testes do parser de HTML do Knowledge Panel
- [x] 6.4 Testes de integração (scrape → upsert)

## 7. Docker & Deploy

- [x] 7.1 Criar `apps/scraper/Dockerfile` multi-stage
- [x] 7.2 Criar `apps/scraper/.dockerignore` (node_modules, .env, etc)
- [x] 7.3 Criar `.github/workflows/scraper-deploy.yml` (build + push DockerHub)
- [x] 7.4 Documentar variáveis de ambiente e uso no README

## 8. Finalização

- [x] 8.1 Rodar `pnpm build` para verificar build do monorepo
- [x] 8.2 Verificar lint com Biome
- [x] 8.3 Marcar EOB-163, EOB-164, EOB-165 como Done no Linear
