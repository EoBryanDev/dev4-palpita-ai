## Context

A arquitetura atual de persistência no monorepo (@palpita/db) utiliza campos textuais simples (`timeA` e `timeB` como `text`) na tabela `partidas` para registrar os confrontos. Isso acarreta os seguintes problemas:
1. Inconsistência ortográfica no preenchimento de nomes de seleções.
2. Impossibilidade de centralizar metadados das equipes (como emojis representativos, bandeiras, grupo e confederação) sem duplicar strings.
3. Ausência de integridade referencial nas partidas.

Além disso:
- O administrador não possui um painel administrativo principal na raiz `/admin` para monitoramento.
- A API pública de palpites possui um erro que omite as apostas dos usuários com status `LIBERADO`.
- O repositório não dispõe de uma esteira automatizada de CI para validações rápidas nos commits.

## Goals / Non-Goals

**Goals:**
- Criar a tabela `times` contendo `id`, `nome`, `emoji` e `confederacao`.
- Atualizar a tabela `partidas` para possuir as colunas `timeAId` e `timeBId` apontando como chaves estrangeiras para a tabela de `times`.
- Atualizar os fluxos de criação de partidas e visualização (Server Actions, Web Pages, APIs, Drizzle queries) para usar os novos relacionamentos.
- Criar uma página inicial para o painel administrativo (`/admin`) contendo os indicadores resumo solicitados.
- Corrigir a API `/api/palpites` para retornar palpites de usuários tanto no status `ATIVO` quanto `LIBERADO`.
- Criar o arquivo `.env-example` na raiz do projeto.
- Configurar uma pipeline de CI robusta com GitHub Actions.
- Implementar testes de integração e ponta a ponta (E2E) cobrindo as jornadas modificadas.

**Non-Goals:**
- Integrar com serviços de feeds reais de dados esportivos externos.
- Criar painel visual para edição de metadados das equipes pelo admin (o cadastro de times será realizado via seed de banco e por inputs básicos na interface administrativa).

## Decisions

### 1. Modelagem do Banco de Dados e Relacionamentos
* **Decisão:** Criar a tabela `times` e refatorar `partidas` para usar `timeAId` e `timeBId`.
* **Alternativa considerada:** Manter os nomes textuais e validar por Enums definidos no código da aplicação.
* **Justificativa:** A modelagem relacional preserva a integridade referencial no banco de dados e permite expansão futura de metadados das seleções (como uniformes ou imagens de bandeiras) diretamente no banco, sem a necessidade de novos deploys de código.

### 2. Tratamento da Transição de Dados e Seeds
* **Decisão:** Resetar o banco de dados local e criar um novo script de seed completo.
* **Alternativa considerada:** Escrever uma migração Drizzle que tente mapear as strings atuais de seleções (`'Brasil'`, `'França'`) para novos registros correspondentes em `times` usando queries de inserção com regex.
* **Justificativa:** Como o projeto ainda está em fase de desenvolvimento de funcionalidades principais e não há dados reais de produção em risco, a melhor prática é atualizar o script de semente de dados (`seed.ts`) para primeiro cadastrar todos os `times` da Copa de 2026 e, em seguida, cadastrar as rodadas e partidas referenciando estes IDs de times. Isso evita migrações complexas desnecessárias neste momento.

### 3. Pipeline de Integração Contínua (CI)
* **Decisão:** Configurar o GitHub Actions rodando linting com o Biome, typecheck e testes do runner do monorepo (Vitest e Turbo).
* **Justificativa:** Garante que qualquer PR aberto contra a branch principal seja validado contra quebras de build, lints ou regressão de testes.

## Risks / Trade-offs

- **[Risco] Perda ou inconsistência de dados de testes locais** → **[Mitigação]** Atualização imediata do script de seed (`packages/db/src/seed.ts`) contendo todas as 32 seleções mockadas, de forma que o banco local possa ser limpo e populado com um único comando (`pnpm db:seed`).
- **[Risco] Lerdeza ou gargalos na pipeline do GitHub Actions** → **[Mitigação]** Utilização do cache oficial de pnpm no setup do GitHub Actions para evitar downloads repetidos de pacotes `node_modules`.
