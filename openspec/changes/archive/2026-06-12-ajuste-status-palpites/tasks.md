## 1. Banco de Dados

- [x] 1.1 Adicionar a tabela `comentarios` em `packages/db/src/schema.ts`.
- [x] 1.2 Gerar arquivos de migração com `pnpm --filter @palpita/db db:generate`.
- [x] 1.3 Aplicar alterações/migração no banco de dados local.

## 2. Ajuste de Status e Correção de Palpites

- [x] 2.1 Atualizar `getStatusLabel` no componente `PalpitesStats` (`apps/web/src/components/palpites-stats.tsx`) com os novos rótulos, cores (cinza, verde, azul claro e roxo claro) e cálculo dinâmico de tempo.
- [x] 2.2 Corrigir os métodos `obterTotalPalpitesSalvosFuturos` e `obterPalpitesSalvosFuturosPaginados` em `palpites.service.ts` para incluir jogos em andamento e ordená-los por último.
- [x] 2.3 Ajustar o componente `DashboardPalpites` (`apps/web/src/components/dashboard-palpites.tsx`) para listar partidas em andamento e fazer a ordenação correspondente.

## 3. Aba Eventos, Pontuadores e Comentários

- [x] 3.1 Criar arquivo de Server Actions `eventos.ts` em `apps/web/src/app/actions/eventos.ts` para lidar com listagem de eventos, envio de comentários e cálculo de pontuadores por rodada.
- [x] 3.2 Implementar a rota `/eventos` (`apps/web/src/app/eventos/page.tsx`) e seu respectivo layout/componente cliente.
- [x] 3.3 Adicionar o link de navegação para a rota `/eventos` no menu do componente `Header` (`apps/web/src/components/header.tsx`).

## 4. Testes, Linting e Build

- [x] 4.1 Adicionar testes de unidade para os 4 tipos de status de partida no arquivo `apps/web/tests/unitarios/components/palpites-stats.spec.tsx`.
- [x] 4.2 Executar a suíte de testes unitários para validar as alterações e garantir que todos passam.
- [x] 4.3 Rodar a verificação de linting e formatação com o Biome.
- [x] 4.4 Executar a build final de produção de toda a aplicação.
