# infra-web Specification

## Purpose
TBD - created by archiving change infra-and-public-area. Update Purpose after archive.
## Requirements
### Requirement: Gerenciamento de Estado de Servidor com React Query
O sistema MUST utilizar o `@tanstack/react-query` na aplicação web para encapsular a busca de dados de ranking e partidas, fornecendo cache inteligente e sincronização em tempo real do lado do cliente. Todas as chamadas de queries (`useQuery`) e mutações (`useMutation`) do React Query MUST ser isoladas em custom hooks dentro das pastas `src/hooks/queries` e `src/hooks/mutations`, desacoplando a camada de comunicação e regras de rede do JSX/TSX dos componentes visuais.

#### Scenario: Inicialização do React Query Provider
- **WHEN** a aplicação web é inicializada e renderiza a raiz
- **THEN** o QueryClientProvider deve encapsular o layout para disponibilizar os hooks do React Query em todas as rotas.

### Requirement: Gerenciamento de Estado de Cliente com Zustand
O sistema MUST utilizar o `zustand` para o gerenciamento de estados puramente visuais e globais da UI do lado do cliente (como visibilidade de modais, alternador de temas e estados locais efêmeros).

#### Scenario: Atualização de estado global de UI
- **WHEN** o usuário interage com um controle visual gerenciado pelo Zustand (como o toggle de tema)
- **THEN** o estado global correspondente no store é atualizado e as visualizações dependentes são re-renderizadas sem causar atraso perceptível.

### Requirement: Formatação Monetária Precisa e Centralizada
O sistema SHALL armazenar e trafegar valores decimais/monetários de configuração como String ou Inteiros (centavos) internamente, e utilizar o helper `formatarValorComUnidade` para exibi-los associados ao respectivo tipo de moeda ou unidade, garantindo precisão absoluta e impedindo falhas de arredondamento de ponto flutuante.

#### Scenario: Exibição de Valor de Inscrição em BRL
- **WHEN** a interface exibe o valor da inscrição do palpite correspondente a `"50.00"`
- **THEN** o sistema SHALL formatar o valor como `"R$ 50,00"`.

#### Scenario: Exibição de Unidades Customizadas
- **WHEN** o helper formata um valor `"123.44"` com a unidade `"KG"`
- **THEN** o sistema SHALL retornar a string `"123,44 KG"`.

### Requirement: Tratamento de Timezones e Hydration-Safe Dates
O sistema SHALL gravar as datas de início de jogos no banco de dados em UTC (GMT 0) e renderizar a exibição das datas utilizando a timezone local detectada no navegador, com fallback padrão para o horário de Brasília (GMT-3). O componente de exibição no cliente SHALL impedir falhas de hidratação (hydration mismatch) do Next.js renderizando inicialmente no fuso de Brasília (servidor) e atualizando para o fuso do navegador apenas após a montagem do componente.

#### Scenario: Gravação de Jogo em UTC
- **WHEN** a partida é cadastrada no painel administrativo com o valor local `"2026-06-12T16:00"`
- **THEN** a data convertida para UTC SHALL ser armazenada no banco como `"2026-06-12T19:00:00Z"`.

#### Scenario: Hydration Safe Timezone Update
- **WHEN** a data da partida `"2026-06-12T19:00:00Z"` é processada pelo componente no cliente
- **THEN** o componente deve renderizar `"12/06 16:00"` (GMT-3) no servidor e atualizar para o fuso local detectado no navegador após o mount.

