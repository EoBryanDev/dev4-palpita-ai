# @palpita/scraper

Web scraper que busca automaticamente resultados e eventos de partidas da Copa do Mundo via Google Search e persiste no banco PostgreSQL.

## Estrutura

```
src/
  engines/
    google-engine.ts      # Engine principal (fetch + cheerio)
    playwright-engine.ts  # Fallback (Playwright)
  services/
    sync.service.ts       # Orquestrador: scrape → validação → upsert
  db/
    queries.ts            # Queries Drizzle (buscar pendentes, upsert, eventos)
  types.ts                # Interfaces (IScraperEngine, IScrapeResult, etc.)
  index.ts                # CLI entrypoint
```

## Uso

```bash
# Execução única
pnpm scraper run

# Modo watch (a cada N minutos, default 5)
pnpm scraper watch --interval 10
```

## Variáveis de Ambiente

| Variável                   | Descrição                                                                      | Default           |
|----------------------------|--------------------------------------------------------------------------------|-------------------|
| `DATABASE_URL`             | URL de conexão PostgreSQL.                                                     | `postgres://...`  |
| `NODE_ENV`                 | Ambiente da aplicação (production/development).                                | `development`     |
| `SCRAPER_ENGINE`           | Engine de busca de resultados a ser utilizada (`uol`, `playwright`, `google`). | `uol`             |
| `SCRAPER_INTERVAL_MINUTES` | Intervalo do modo watch em minutos.                                            | `5`               |

## Docker

```bash
# Build
docker build -f apps/scraper/Dockerfile -t eobryandev/palpita-scraper .

# Run
docker run --rm -e DATABASE_URL="$DATABASE_URL" eobryandev/palpita-scraper run
```

## Deploy

O push para `main` com mudanças em `apps/scraper/` ou `packages/` dispara o workflow `.github/workflows/scraper-deploy.yml`, que faz build multi-arquitetura e push para DockerHub.
