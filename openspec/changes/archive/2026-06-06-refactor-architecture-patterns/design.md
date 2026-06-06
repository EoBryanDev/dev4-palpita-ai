## Context

A implementação atual do frontend (`apps/web`) mistura responsabilidades visuais com queries de banco de dados diretamente nos Server Components (violando o SRP), e faz chamadas de Server Actions de forma inline nos Client Components sem abstração ou controle de erros adequado.
Além disso, há duplicações lógicas significativas (como o cálculo de ranking compartilhado de forma redundante entre a página `/meu-espaco` e a rota `/api/ranking`) e repetição de estilos visuais Tailwind para cabeçalhos de página, formulários, inputs e cards de métricas.
Por fim, valores monetários (como o preço de inscrição do palpite) são controlados como números de ponto flutuante em JS, o que traz riscos de precisão financeira, e formatações de data utilizam métodos manuais sem padronização de fusos horários.

## Goals / Non-Goals

**Goals:**
- **Abstração Servidora (Queries):** Isolar todas as chamadas diretas de banco de dados (Drizzle ORM) para um diretório de serviços `src/services/*` em Server Components.
- **Unificação de Regra de Negócio (Ranking):** Centralizar a lógica de cálculo de pontuação de palpites e classificação em um serviço único servidor (`src/services/ranking.service.ts`) compartilhado entre páginas e rotas de API.
- **Estruturação de Custom Hooks de Query/Mutation:** Separar queries e mutações do TanStack Query em subdiretórios `src/hooks/queries/` e `src/hooks/mutations/`.
- **Prevenção de Floating Point Bugs:** Armazenar e manipular valores monetários e decimais como Strings ou Inteiros (centavos) internamente, delegando a exibição ao helper `src/helpers/currency.ts` com base no tipo e unidade (ex: BRL).
- **Timezones e Hydration-Safe Dates:** Uniformizar o salvamento de datas no banco em UTC (adicionando offset de Brasília `-03:00` no parse) e exibir datas dinamicamente de acordo com o fuso do navegador usando um componente `<LocalDate />` seguro para evitar erros de hidratação no Next.js.
- **Eliminação de CSS/Markup Duplicado (DRY):** Componentizar elementos de cabeçalho de página, inputs/labels de formulários e cards de métricas em componentes reutilizáveis.

**Non-Goals:**
- Alteração ou migração de esquemas de tabelas no banco de dados (`packages/db`).
- Adição de novas regras de negócio ou de novas telas à aplicação.

## Decisions

### 1. Camada de Serviços para Banco de Dados no Servidor
- **Decisão:** Criar a pasta `src/services/` no projeto do frontend para agrupar funções de leitura de banco de dados (Drizzle). Os componentes de páginas servidoras apenas invocam estes métodos assíncronos.
- **Alternativa Considerada:** Manter Drizzle queries inline nas páginas. Rejeitada, pois dificulta a manutenção, reutilização e a realização de testes unitários.

### 2. Centralização do Cálculo de Ranking (DRY)
- **Decisão:** Mover toda a lógica de pontos para `src/services/ranking.service.ts` e expor a função `calcularRankingGeral()`.
- **Alternativa Considerada:** Fazer com que a página `meu-espaco` chame a API de ranking localmente pelo cliente. Rejeitada, pois causaria atraso no carregamento inicial da página (SSR) comparado ao acesso de dados direto no servidor.

### 3. Componentes de UI Reutilizáveis para Tailwind DRY
- **Decisão:** Criar componentes visuais reutilizáveis em `src/components/ui/` (`Input`, `Label`, `Textarea`, `Select`, `PageHeader` e `StatCard`).
- **Alternativa Considerada:** Utilizar uma biblioteca de componentes externa complexa. Rejeitada para evitar dependências pesadas desnecessárias no projeto.

### 4. Controle de Decimais em Centavos (Inteiros) e String
- **Decisão:** Modificar as rotinas de valor de palpite para trafegar a quantia monetária como string (ex.: `"50.00"`) nas APIs e no estado, convertendo para centavos (inteiro) em caso de multiplicação/soma, e usar o helper `currency.ts` com formatação baseada na unidade.
- **Alternativa Considerada:** Continuar utilizando floats puros. Rejeitada devido aos problemas conhecidos de arredondamento de ponto flutuante do JavaScript.

### 5. Hydration-Safe LocalDate Component
- **Decisão:** Criar o componente `<LocalDate date={date} format={options} />` que pré-renderiza a data no fuso de Brasília (`America/Sao_Paulo`) no servidor e atualiza para o fuso do navegador do usuário no `useEffect` se for diferente.
- **Alternativa Considerada:** Renderizar diretamente com fuso do navegador usando injeção direta no client. Rejeitada, pois causaria erros de *hydration mismatch* no Next.js.

## Risks / Trade-offs

- **[Risco] Hydration Mismatch em Datas Dinâmicas**
  - **Mitigação:** Garantir que o componente `<LocalDate />` faça a atualização de timezone apenas no hook `useEffect` (após o componente estar montado no cliente).
- **[Risco] Quebra de imports após relocalização de hooks**
  - **Mitigação:** Rodar `pnpm build` para que o compilador de TypeScript valide todos os caminhos após as mudanças de pastas.
