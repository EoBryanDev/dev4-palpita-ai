## Why

- O status das partidas na tela de palpites precisa refletir de maneira precisa, dinâmica e com cores distintas o andamento real do jogo.
- No "Meu Espaço", jogos em andamento (iniciados mas não finalizados) sumiam da lista de palpites. Eles devem continuar sendo mostrados e paginados, mas ordenados por último.
- Usuários jogadores precisam de um espaço centralizado ("Eventos") para visualizar o histórico de jogos ocorridos e em andamento, ver os maiores pontuadores de cada rodada, e interagir através de comentários sobre cada confronto.

## What Changes

### 1. Rótulos e Cores de Status na Tela de Palpites
- **Encerrado**: Cinza. Quando a partida for finalizada pelo administrador.
- **Agendado**: Verde. Quando a partida ainda não iniciou.
- **Em Andamento**: Azul Claro. Quando a partida iniciou e tem menos de 115 minutos decorridos, sem finalização.
- **Calculando Encerramento**: Roxo Claro. Quando a partida iniciou, tem 115 minutos ou mais decorridos, sem finalização.

### 2. Correção no "Meu Espaço"
- Jogos que estão acontecendo (em andamento) devem continuar aparecendo nas listas de palpites das rodadas e nos palpites salvos da paginação (em vez de serem ocultados).
- Na paginação dos palpites salvos, as partidas em andamento/passadas que ainda não foram finalizadas devem aparecer por último na ordenação.

### 3. Nova Tela "Eventos" para Jogadores
- Rota protegida `/eventos` acessível a usuários logados (não-admins).
- Apresenta os confrontos iniciados ou finalizados em ordem cronológica de acontecimento.
- Exibe o placar oficial e os maiores pontuadores da respectiva rodada do jogo (quem pontuou e quantos pontos obteve na rodada).
- Permite abrir um modal ao clicar no confronto para visualizar os comentários dos outros jogadores e enviar novos comentários sobre a partida.

## Capabilities

### New Capabilities
- `eventos-timeline`: Criação da tela de eventos de jogos iniciados/finalizados, visualização de pontuadores da rodada, e sistema de comentários por confronto.

### Modified Capabilities
- `area-publica-dados`: Modificado o comportamento e exibição das informações das partidas para exibir status calculados dinamicamente com base no tempo de início e status do administrador, com cores personalizadas.
- `area-privada-palpites`: Alterado o filtro de listagem de palpites para incluir partidas iniciadas e não finalizadas, posicionando-as ao final da lista.

## Impact

- Novas tabelas ou campos no banco de dados para os comentários (será criada a tabela `comentarios`).
- Frontend: componente `PalpitesStats` (`apps/web/src/components/palpites-stats.tsx`) e `DashboardPalpites` (`apps/web/src/components/dashboard-palpites.tsx`).
- Criação da nova rota `apps/web/src/app/eventos/page.tsx` e seus respectivos componentes e server actions.
- Atualização do componente de cabeçalho `Header` (`apps/web/src/components/header.tsx`) para incluir a rota de Eventos.
