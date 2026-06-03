## Why

Esta mudança é necessária para estabelecer a base da arquitetura do projeto "Bolão Copa 2026". A inicialização estruturada de um Monorepo com Turborepo e pnpm permitirá o compartilhamento eficiente de tipos de domínio, esquemas de banco de dados e configurações de ferramentas de qualidade (como Biome e Vitest) entre a aplicação web (Next.js) e os pacotes compartilhados.

## What Changes

- Configuração do diretório raiz: arquivos `package.json`, `pnpm-workspace.yaml`, `turbo.json` e `biome.json`.
- Criação do pacote `packages/tsconfig` para configurações compartilhadas do TypeScript.
- Criação do pacote `packages/core` para regras de negócio centrais e entidades de domínio orientadas a objetos (`Palpite`, `Usuario`, `Partida`, `TokenConvite`).
- Criação do pacote `packages/db` para persistência com Drizzle ORM, contendo o esquema do banco de dados (usando termos em português neutros de Copa como Time A e Time B) e configuração do Docker Compose para o PostgreSQL local.
- Criação da aplicação `apps/web` com Next.js (App Router), Tailwind CSS, Biome e Vitest.

## Capabilities

### New Capabilities

- `estrutura-monorepo`: Orquestração de tarefas com Turborepo, dependências com pnpm e padronização com Biome e TypeScript.
- `dominio-core`: Definição de regras de negócio de pontuação (RN01) e validações no modelo orientado a objetos.
- `persistencia-db`: Configuração do banco de dados relacional PostgreSQL local via Docker Compose e Drizzle ORM.

### Modified Capabilities

*Nenhuma capacidade existente foi modificada.*

## Impact

Esta é a mudança fundacional do projeto. Ela afetará toda a estrutura de diretórios e servirá como base obrigatória para o desenvolvimento de todas as telas públicas, painel administrativo, autenticação e rotinas de palpites.
