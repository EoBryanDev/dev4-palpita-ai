## Why

A Copa do Mundo 2026 (início: 11/jun) está rodando e atualmente os resultados das partidas são inseridos manualmente por administradores. A cada partida, o administrador precisa entrar no sistema e lançar cada resultado manualmente, o que é insustentável para 72+ jogos em tempo real. Precisamos de um scraper automático que busque os resultados e eventos das partidas do Google Sports para alimentar o banco em tempo real, liberando o admin e permitindo novas funcionalidades como histórico de partidas.

## What Changes

- Novo app `apps/scraper/` no monorepo (`@palpita/scraper`) — scraper CLI em Node.js que consulta o Google para obter placares e eventos
- Nova tabela `eventos_partida` no schema do banco para armazenar gols, cartões, substituições
- Mecanismo de upsert automático: busca partidas pendentes (dataInicio <= now(), status != FINALIZADO), scrapeia o Google, atualiza placar e eventos no banco
- Dockerfile multi-stage para gerar imagem leve (~60MB)
- GitHub Actions para build + push da imagem no DockerHub
- Modo CLI: `run` (execução única) e `watch` (cron interno para atualização periódica durante jogos ao vivo)

## Capabilities

### New Capabilities
- `web-scraper`: Motor de scraping que consulta o Google Search, extrai placar, status e eventos de partidas de futebol utilizando fetch + cheerio (com fallback para Playwright)
- `scraper-sync-engine`: Orquestrador que consulta partidas pendentes no banco, executa o scraper e faz upsert dos resultados e eventos no PostgreSQL
- `scraper-deploy`: Dockerfile multi-stage + GitHub Actions para publicar imagem no DockerHub, consumida por ArgoCD no VPS como CronJob

### Modified Capabilities
- Nenhuma — o scraper é independente e não altera os requisitos das capabilities existentes

## Impact

- **Novo app**: `apps/scraper/` com package `@palpita/scraper`
- **Banco**: Nova tabela `eventos_partida` (migration 0005 em `@palpita/db`)
- **Infra**: Dockerfile no repo, GitHub Actions para DockerHub, novo CronJob no ArgoCD
- **Segurança**: Mesmos padrões do projeto (validação Zod, rate limiting nas requests, audit logging, env vars para credenciais)
