## Context

A implementação atual dos componentes interativos no frontend (`apps/web`) agrupa markup visual (JSX), estado do React, validações de entrada, chamadas de rede/Server Actions e formatações de data em um único arquivo de componente. Isso viola o Princípio de Responsabilidade Única (SRP) do SOLID e as diretrizes do `docs/rules/nextjs.md`. Este documento detalha como desacoplar estas camadas de forma segura e coerente.

## Goals / Non-Goals

**Goals:**
- **Separação de Responsabilidades:** Componentes visuais devem focar exclusivamente na renderização e na interação com o usuário, delegando a lógica para hooks customizados.
- **Segregação de Tipos e Interfaces:** Tipos (`T...`) e Interfaces (`I...`) declarados inline serão movidos para arquivos próprios de definição.
- **Centralização de Utilitários de Data:** Fusos horários e formatações serão centralizados na pasta `/src/helpers`.
- **Alinhamento Arquitetural:** Mover o store do Zustand para `/src/store/*` para cumprir a especificação de diretórios.
- **Manter Funcionalidade Original:** Garantir que nenhuma regra de negócio ou jornada descrita no PRD sofra regressão.

**Non-Goals:**
- Alteração ou criação de tabelas e esquemas no banco de dados (`packages/db`).
- Alterações em regras de negócios ou endpoints de API.
- Modificação no design visual (estilização) das páginas.

## Decisions

### 1. Criação de Custom Hooks para Componentes Interativos
- **Decisão:** Toda lógica de formulários (estados de inputs, transições de carregamento, tratamento de erros e respostas de Server Actions) será extraída para Hooks customizados.
- **Alternativa Considerada:** Manter a lógica no próprio componente utilizando sub-funções (rejeitada por violar o SRP e reduzir a testabilidade).
- **Hooks a serem criados:**
  - `useSolicitarConvite` (para `SolicitarConviteForm`)
  - `useLoginForm` (para `LoginForm`)
  - `useDashboardPalpites` (para `DashboardPalpites`)
  - `useCountdown` (para `TimeoutBanner` e cálculos de tempo restante)

### 2. Isolamento de Interfaces e Tipos em Pastas Dedicadas
- **Decisão:** Criar as pastas `/src/types` e `/src/interface` para separar definições de tipo (prefixadas com `T`) e interfaces (prefixadas com `I`).
- **Alternativa Considerada:** Manter tipos declarados no arquivo `.tsx` do componente (rejeitada para evitar duplicações e facilitar importação cruzada).

### 3. Centralização das Lógicas de Fuso Horário e Datas
- **Decisão:** Centralizar os formatos `Intl.DateTimeFormat` configurados com o fuso `America/Sao_Paulo` em `helpers/date.ts`.
- **Alternativa Considerada:** Manter o uso do `toLocaleString` inline nos arquivos das páginas (rejeitada, pois causa duplicação e dificulta a manutenção em caso de alterações globais de localidade).

### 4. Relocação das Zustand Stores
- **Decisão:** Mover `apps/web/src/lib/store` para `apps/web/src/store`, adequando a localização à estrutura padrão de pastas descrita na diretriz Next.js do projeto.

## Risks / Trade-offs

- **[Risco] Quebra de importações ou caminhos de imports de arquivos após movimentações de diretórios.**
  - **Mitigação:** Executar o compilador de TypeScript (`pnpm run build` ou `tsc --noEmit`) após as mudanças e verificar erros de caminhos imediatamente.
- **[Risco] Regressão funcional no comportamento interativo de login ou palpites devido a perdas de transição de estado.**
  - **Mitigação:** Executar e validar a base com a suíte de testes existente (`pnpm run test`) antes e depois da refatoração.
