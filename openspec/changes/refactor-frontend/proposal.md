## Why

A base de código atual do frontend (`apps/web`) apresenta componentes com baixa coesão, onde responsabilidades visuais (JSX) estão misturadas com lógica de estado complexo, regras de validação de formulários, chamadas diretas a Server Actions e lógicas de formatação de dados. Esta refatoração visa realinhar o projeto com as regras definidas em `docs/rules/nextjs.md` e nos princípios do SOLID, melhorando a manutenibilidade, testabilidade e legibilidade do código.

## What Changes

- **Extração de Interfaces e Tipos:** Interfaces e tipos declarados inline dentro dos componentes TSX (como em `dashboard-palpites.tsx` e rotas do App Router) serão extraídos para arquivos específicos dentro de `/src/interface` (para interfaces prefixadas com `I`) e `/src/types` (para tipos prefixados com `T`).
- **Abstração de Lógica em Custom Hooks:** Estados de formulários, controle de carregamento, alertas e chamadas a Server Actions em componentes interativos (como `solicitar-convite-form.tsx`, `login-form.tsx` e `dashboard-palpites.tsx`) serão isolados em hooks customizados específicos sob a pasta `/src/hooks`.
- **Centralização de Formatação (Helpers):** Cálculos de datas/fusos horários e moedas duplicados de forma inline serão movidos para `/src/helpers/date.ts`.
- **Reorganização de Stores do Zustand:** O store de interface `ui.ts` será movido de `src/lib/store/ui.ts` para `/src/store/ui-store.ts` para conformidade com a estrutura de pastas descrita em `nextjs.md`.

## Capabilities

### New Capabilities
- Nenhuma (refatoração estrutural sem introdução de novas regras ou comportamentos funcionais).

### Modified Capabilities
- Nenhuma (os requisitos e jornadas de usuário descritos no PRD original permanecem os mesmos).

## Impact

- **`apps/web/src/components/*`**: Componentes de formulário e dashboard simplificados (foco visual puro).
- **`apps/web/src/hooks/*`**: Criação de hooks de controle de estado e comportamento.
- **`apps/web/src/helpers/*`**: Consolidação de utilitários de data/fuso horário.
- **`apps/web/src/store/*`**: Centralização de stores de estado global.
