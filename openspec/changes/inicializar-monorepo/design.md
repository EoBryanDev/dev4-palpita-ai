## Context

O projeto "Bolão Copa 2026" precisa de uma infraestrutura inicial robusta. Atualmente, o repositório está vazio e não possui estrutura física de pastas, configurações ou dependências. Para atender aos requisitos de performance (carregamento de páginas como `/ranking` em menos de 2 segundos), modularidade e tipagem estática integrada, estruturaremos a solução como um **Monorepo** orquestrado pelo **Turborepo** e gerenciado pelo **pnpm**.

## Goals / Non-Goals

**Goals:**
- Configurar o Turborepo e pnpm workspaces no repositório de forma limpa.
- Criar a aplicação Next.js (App Router) em `apps/web` integrada ao Tailwind CSS e Biome.
- Criar o pacote de domínio orientado a objetos em `packages/core`.
- Criar o pacote de persistência Drizzle ORM em `packages/db`.
- Configurar o banco de dados PostgreSQL local usando Docker Compose.
- Unificar a qualidade de código com o Biome (2 espaços, 80 caracteres de largura).

**Non-Goals:**
- Implementar as regras de controle de acesso (autenticação com senhas e rotas administrativas `/admin`).
- Criar as interfaces visuais finais ou formulários de palpite.
- Configurar a esteira de CI/CD para deploy em produção.

## Decisions

### 1. Monorepo com Turborepo + pnpm Workspaces
- **Decisão:** Estruturar o projeto contendo uma pasta `apps/` (para a aplicação Next.js) e uma pasta `packages/` (para bibliotecas compartilhadas: `core`, `db` e `tsconfig`).
- **Alternativa Considerada:** Repositório monolítico único.
- **Racional:** O monorepo separa as responsabilidades de persistência e lógica de negócios (permitindo 100% de cobertura de testes em `core` sem mockar o Next.js) enquanto compartilha tipos TypeScript de ponta a ponta.

### 2. Nomenclatura Neutra de Copa (Time A / Time B) e em Português
- **Decisão:** Nomear os campos e tabelas de partidas e palpites utilizando `timeA` / `timeB` e `golsTimeA` / `golsTimeB` em Português (PT-BR).
- **Alternativa Considerada:** Usar a terminologia em inglês de futebol `home` (mandante) e `away` (visitante).
- **Racional:** Em um torneio com sede neutra como a Copa do Mundo, o conceito de "mandante/visitante" é fictício e gera confusão de negócios. O uso do português facilita o alinhamento com o PRD e a comunicação da equipe.

### 3. Banco de Dados PostgreSQL Local via Docker Compose
- **Decisão:** Configurar uma imagem oficial do PostgreSQL 16 no arquivo `docker-compose.yml` da raiz do projeto.
- **Alternativa Considerada:** Utilizar SQLite localmente.
- **Racional:** Para garantir paridade de ambiente com o banco de produção (Neon Serverless PostgreSQL) e evitar disparidades de tipos do Drizzle ORM, o PostgreSQL local é obrigatório.

### 4. Next.js com App Router e Server Actions
- **Decisão:** Usar Next.js com App Router. Chamadas de mutação (como envio de palpites e aprovação de usuários) utilizarão React Server Actions.
- **Alternativa Considerada:** Next.js Pages Router ou construir uma API REST separada em Express.
- **Racional:** Server Actions reduzem boilerplate de rotas HTTP, mantêm a validação com Zod unificada no servidor e garantem tipagem TypeScript estática nativa das requisições.

### 5. Qualidade de Código com Biome
- **Decisão:** Configurar o Biome no arquivo raiz `biome.json` substituindo ESLint e Prettier.
- **Alternativa Considerada:** ESLint + Prettier tradicionais.
- **Racional:** O Biome executa linting, formatação e ordenação de imports de forma unificada e é até 100 vezes mais rápido, mantendo a regra de 2 espaços e 80 caracteres de limite de linha.

## Risks / Trade-offs

- **[Risco] Sobrecarga de inicialização do monorepo** → *Mitigação:* Usar os templates padrões do Next.js e criar pacotes mínimos compartilhados (`core`, `db`) com exports explícitos via `package.json` para facilitar o build.
- **[Risco] Incompatibilidade com Docker Compose** → *Mitigação:* Fornecer um script simples `pnpm db:up` para gerenciar a inicialização e verificação de saúde do banco de dados PostgreSQL.
