## 1. Banco de Dados e Persistência

- [/] 1.1 Criar a tabela `times` no schema do banco em `packages/db` e atualizar a tabela `partidas` para referenciar `timeAId` e `timeBId`. (Status: IN_PROGRESS, Início: 14:01)
- [/] 1.2 Atualizar o arquivo de semente de dados (`packages/db/src/seed.ts`) para incluir o cadastro de times e as rodadas/partidas já associadas aos respectivos IDs. (Status: IN_PROGRESS, Início: 14:01)
- [/] 1.3 Rodar as migrações locais e reexecutar a semente de dados do banco de dados local (`pnpm db:seed`). (Status: IN_PROGRESS, Início: 14:01)

## 2. Refatoração de Lógica de Negócio e APIs

- [ ] 2.1 Atualizar a entidade de partida e as regras de validação no pacote `@palpita/core` para refletir as referências de times.
- [ ] 2.2 Atualizar as Server Actions administrativas em `apps/web/src/app/actions/admin.ts` para cadastro de partidas e lançamento de resultados oficiais usando os relacionamentos de times.
- [ ] 2.3 Atualizar a Server Action de salvar palpites (`apps/web/src/app/actions/palpites.ts`) para suportar a nova estrutura de partida baseada em times.
- [ ] 2.4 Corrigir o bug do filtro de status na API `/api/palpites/route.ts` para abranger usuários `ATIVO` e `LIBERADO`, enriquecendo os nomes e emojis dos times a partir da tabela.

## 3. Interface do Usuário (UI) e Páginas

- [ ] 3.1 Criar a página de Dashboard administrativo raiz `/admin` (`apps/web/src/app/admin/page.tsx`) com os resumos estatísticos de usuários e palpites.
- [ ] 3.2 Atualizar a tela `/admin/partidas` para exibir seletores (dropdowns) de times cadastrados no formulário de criação de partidas e renderizar emojis/nomes dinâmicos.
- [ ] 3.3 Atualizar o dashboard do competidor `/meu-espaco` e as páginas públicas (`/home`, `/agenda`, `/ranking`) para renderizar os dados das seleções obtidas do relacionamento com a tabela de times.

## 4. Configurações de Ambiente e Integração Contínua (CI)

- [ ] 4.1 Criar o arquivo `.env-example` na raiz do projeto contendo as variáveis padrão de ambiente.
- [ ] 4.2 Configurar o workflow do GitHub Actions em `.github/workflows/ci.yml` configurado para rodar Biome check, testes do Vitest e o build de produção.

## 5. Testes Automatizados de Qualidade

- [ ] 5.1 Atualizar as suítes de testes unitários existentes das Server Actions administrativas e de palpites.
- [ ] 5.2 Criar novos testes de integração e testes E2E cobrindo as jornadas do usuário e administrador e as modificações aplicadas, seguindo as diretrizes do `docs/rules/testing.md`.
- [ ] 5.3 Executar validação de linter com Biome (`pnpm lint`), rodar todas as suítes de testes (`pnpm test`) e atestar o sucesso da compilação de build (`pnpm build`).
