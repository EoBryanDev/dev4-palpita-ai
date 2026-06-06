## Why

A base de código atual do frontend (`apps/web`) apresenta acoplamento de chamadas do banco de dados (Drizzle ORM) e Server Actions diretamente na árvore de renderização visual (JSX/TSX), o que viola o princípio de responsabilidade única (SRP) e as diretrizes de nextjs.md. Além disso, há duplicações críticas de lógica (como cálculo de ranking) e repetição exaustiva de estilos Tailwind e markup visual em formulários e estruturas de cards (violando o princípio DRY), necessitando de uma padronização arquitetural e visual que preserve a performance de execução no lado do servidor.

## What Changes

- **Abstração das Queries do Drizzle (Server-Side):** Remoção de queries escritas diretamente nos Server Components (`times/page.tsx`, `chaves/page.tsx`, `agenda/page.tsx`, `admin/page.tsx`, etc.) e extração para arquivos de serviços dedicados em `src/services/` (ex.: `times.service.ts`, `partidas.service.ts`, `ranking.service.ts`).
- **Unificação da Lógica de Ranking:** Extração da lógica de cálculo de pontos de palpites do dashboard (`meu-espaco/page.tsx`) e da API (`api/ranking/route.ts`) para uma função servidora única `calcularRankingGeral()` in `src/services/ranking.service.ts`.
- **Componentização Base de UI (Tailwind DRY):** Criação de subcomponentes base de UI em `src/components/ui/` (`Label`, `Input`, `Textarea`, `Select`, `PageHeader`, `StatCard`) para centralizar os estilos repetitivos do Tailwind de formulários e cabeçalhos.
- **Formatação de Valores (Monetário String):** Substituição do controle de valores floats por strings decimais controlados em centavos (inteiros) internamente para evitar imprecisões numéricas, unificados pelo helper `src/helpers/currency.ts` para exibição formatada com o respectivo tipo e unidade.
- **GMT 0 no Banco de Dados com Offset Brasília (-03:00):** Padronização das datas de criação de partidas no GMT 0 e exibição hidratada e reativa baseada no fuso do navegador com fallback para o horário de Brasília.
- **Componentização de Layouts Repetidos:** Extração do template de card e cabeçalhos da página `validation-user/[id]/page.tsx` para evitar a repetição de markup idêntico em retornos condicionais.

## Capabilities

### New Capabilities

- Nenhuma (refatoração arquitetural e estrutural sem novas funcionalidades de negócios).

### Modified Capabilities
- `infra-web`: O sistema deve utilizar hooks customizados para encapsular React Query e gerenciar formatação e timezones de forma padronizada.

## Impact

- **`apps/web/src/app/`**: Páginas e rotas mais enxutas e focadas unicamente em renderização estrutural.
- **`apps/web/src/components/`**: Redução de CSS repetido através de componentes visuais base e encapsulamento em custom hooks.
- **`apps/web/src/services/`**: Concentração de todas as queries Drizzle/banco de dados servidoras.
- **`apps/web/src/helpers/`**: Novos helpers para conversão de moedas (`currency.ts`) e tratamento unificado de datas/timezones (`date.ts`).
