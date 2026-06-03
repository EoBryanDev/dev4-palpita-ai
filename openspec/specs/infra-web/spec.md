# infra-web Specification

## Purpose
TBD - created by archiving change infra-and-public-area. Update Purpose after archive.
## Requirements
### Requirement: Gerenciamento de Estado de Servidor com React Query
O sistema DEVE utilizar o `@tanstack/react-query` na aplicação web para encapsular a busca de dados de ranking e partidas, fornecendo cache inteligente e sincronização em tempo real do lado do cliente.

#### Scenario: Inicialização do React Query Provider
- **WHEN** a aplicação web é inicializada e renderiza a raiz
- **THEN** o QueryClientProvider deve encapsular o layout para disponibilizar os hooks do React Query em todas as rotas.

### Requirement: Gerenciamento de Estado de Cliente com Zustand
O sistema DEVE utilizar o `zustand` para o gerenciamento de estados puramente visuais e globais da UI do lado do cliente (como visibilidade de modais, alternador de temas e estados locais efêmeros).

#### Scenario: Atualização de estado global de UI
- **WHEN** o usuário interage com um controle visual gerenciado pelo Zustand (como o toggle de tema)
- **THEN** o estado global correspondente no store é atualizado e as visualizações dependentes são re-renderizadas sem causar atraso perceptível.

