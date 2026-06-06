## 1. Helpers e Abstrações de Formatação

- [x] 1.1 Criar o helper de moeda e precisão `apps/web/src/helpers/currency.ts` para controle e conversão de strings e inteiros (centavos)
- [x] 1.2 Atualizar o helper de datas `apps/web/src/helpers/date.ts` para suportar detecção de fuso horário local e conversão UTC no horário de Brasília (`-03:00`)
- [ ] 1.3 Criar o componente visual `<LocalDate />` hidratável em `apps/web/src/components/ui/local-date.tsx` para exibição dinâmica e segura contra hydration mismatch

## 2. Componentes de UI e Tailwind DRY

- [ ] 2.1 Criar e padronizar os elementos `<Label />`, `<Input />`, `<Textarea />` e `<Select />` sob `apps/web/src/components/ui/`
- [ ] 2.2 Criar o componente de cabeçalho unificado `<PageHeader />` em `apps/web/src/components/ui/page-header.tsx`
- [ ] 2.3 Criar o componente reutilizável de bento card `<StatCard />` em `apps/web/src/components/ui/stat-card.tsx`
- [ ] 2.4 Unificar os cabeçalhos das páginas `palpites`, `times`, `agenda`, `ranking` e `chaves` para usarem `<PageHeader />`
- [ ] 2.5 Substituir os bento cards duplicados em `admin/page.tsx`, `admin-usuarios-client.tsx` e `dashboard-palpites.tsx` pelo `<StatCard />`
- [ ] 2.6 Substituir os inputs e labels nos formulários de login, senha, convites e admin pelos novos componentes padronizados `<Input />` e `<Label />`
- [ ] 2.7 Refatorar os retornos condicionais redundantes de `validation-user/[id]/page.tsx` unificando a estrutura externa da página

## 3. Serviços de Banco de Dados (Server-Side)

- [ ] 3.1 Criar `apps/web/src/services/ranking.service.ts` e implementar a lógica única de pontos e classificação servidora `calcularRankingGeral()`
- [ ] 3.2 Criar `apps/web/src/services/times.service.ts` e migrar a consulta SQL de times
- [ ] 3.3 Criar `apps/web/src/services/partidas.service.ts` e migrar a busca e aliasing de partidas
- [ ] 3.4 Criar `apps/web/src/services/chaves.service.ts` e migrar as contas matemáticas de grupos e chaveamentos mata-mata da página `chaves/page.tsx`
- [ ] 3.5 Substituir as queries Drizzle diretas em `times/page.tsx`, `chaves/page.tsx`, `agenda/page.tsx`, `admin/page.tsx`, `admin/partidas/page.tsx`, `admin/usuarios/page.tsx` e `meu-espaco/page.tsx` por chamadas aos novos serviços
- [ ] 3.6 Substituir a lógica duplicada de ranking de `/api/ranking/route.ts` e `meu-espaco/page.tsx` pela chamada a `calcularRankingGeral()`

## 4. Reorganização de Hooks Customizados (TanStack Query)

- [ ] 4.1 Garantir a criação das subpastas `apps/web/src/hooks/queries` e `apps/web/src/hooks/mutations`
- [ ] 4.2 Mover e refatorar as consultas `useQuery` de `ranking-list.tsx` e `palpites-stats.tsx` para `hooks/queries/useQueryRanking.ts` e `hooks/queries/useQueryPalpitesStats.ts`
- [ ] 4.3 Refatorar as chamadas diretas de Server Actions com `useTransition` no `AdminConfiguracoesClient`, `AdminPartidasClient` e `AdminUsuariosClient` utilizando hooks de mutações TanStack Query `useMutation` sob `hooks/mutations/`

## 5. Validação e Testes

- [ ] 5.1 Executar os testes unitários (`pnpm test`) para validação de integridade lógica e de rotas
- [ ] 5.2 Executar linter e formatador (`pnpm lint` e `pnpm format`) para verificar a formatação de todos os arquivos modificados e criados
- [ ] 5.3 Executar o build de produção (`pnpm build`) para garantir a ausência de erros de caminhos, tipagens e compilação de rotas
