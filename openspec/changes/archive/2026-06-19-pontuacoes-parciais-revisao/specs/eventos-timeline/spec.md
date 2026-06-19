## MODIFIED Requirements

### Requirement: Timeline de Eventos
O sistema MUST disponibilizar uma página `/eventos` acessível a jogadores logados que lista, em ordem cronológica de acontecimento (data de início), os jogos que foram iniciados ou já finalizados. Além disso, as ocorrências (acontecimentos) de cada jogo MUST ser ordenadas de forma estritamente cronológica, garantindo que acréscimos sejam exibidos após o tempo regulamentar correspondente (ex: `90'` antes de `90+3'`, `90+7'`).

#### Scenario: Visualização dos eventos iniciados ou finalizados
- **WHEN** um jogador autenticado acessa a rota `/eventos`
- **THEN** o sistema exibe os jogos que já começaram ou terminaram, omitindo jogos futuros, ordenando os acontecimentos internos cronologicamente de forma que acréscimos fiquem após o minuto base.

## ADDED Requirements

### Requirement: Exibição de Palpites e Pontuações Parciais
O sistema MUST permitir a visualização dos palpites e das pontuações dos usuários para qualquer partida a qualquer momento (mesmo se o jogo estiver agendado ou em andamento), exibindo claramente no modal se o resultado e os pontos calculados são parciais (para jogos não finalizados) ou finais (para jogos finalizados).

#### Scenario: Visualização de pontuação parcial para jogo em andamento
- **WHEN** o usuário abre o modal de pontuadores de um jogo em andamento ou agendado
- **THEN** o sistema calcula as pontuações com base no placar atual e exibe o badge "Placar Parcial" com a pontuação marcada como "(parcial)".
