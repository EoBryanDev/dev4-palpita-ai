# eventos-timeline Specification

## Purpose
Sincronizado do change ajuste-status-palpites. Timeline de eventos, maiores pontuadores e comentários por partida.
## Requirements
### Requirement: Timeline de Eventos
O sistema MUST disponibilizar uma página `/eventos` acessível a jogadores logados que lista, em ordem cronológica de acontecimento (data de início), os jogos que foram iniciados ou já finalizados. Além disso, as ocorrências (acontecimentos) de cada jogo MUST ser ordenadas de forma estritamente cronológica, garantindo que acréscimos sejam exibidos após o tempo regulamentar correspondente (ex: `90'` antes de `90+3'`, `90+7'`).

#### Scenario: Visualização dos eventos iniciados ou finalizados
- **WHEN** um jogador autenticado acessa a rota `/eventos`
- **THEN** o sistema exibe os jogos que já começaram ou terminaram, omitindo jogos futuros, ordenando os acontecimentos internos cronologicamente de forma que acréscimos fiquem após o minuto base.

### Requirement: Maiores Pontuadores da Rodada
Para cada confronto listado na timeline de eventos, o sistema MUST calcular e exibir os maiores pontuadores daquela rodada específica (quais usuários ganharam pontos com seus palpites nos jogos daquela rodada, e quantos pontos eles obtiveram).

#### Scenario: Exibição dos maiores pontuadores da rodada do confronto
- **WHEN** a rodada do confronto tem partidas finalizadas e usuários com pontos obtidos
- **THEN** o sistema lista os nomes dos participantes e as respectivas pontuações daquela rodada no card do evento.

### Requirement: Comentários por Evento
Cada linha de evento na timeline MUST permitir a abertura de um modal contendo comentários enviados pelos jogadores. O modal deve permitir a leitura dos comentários existentes e o envio de novos comentários.

#### Scenario: Envio de comentário com sucesso
- **WHEN** o usuário abre o modal de comentários de uma partida, insere um texto e clica em enviar
- **THEN** o sistema salva o comentário associando-o ao usuário e à partida, e atualiza a lista de comentários no modal.

### Requirement: Exibição de Palpites e Pontuações Parciais
O sistema MUST permitir a visualização dos palpites e das pontuações dos usuários para qualquer partida a qualquer momento (mesmo se o jogo estiver agendado ou em andamento), exibindo claramente no modal se o resultado e os pontos calculados são parciais (para jogos não finalizados) ou finais (para jogos finalizados).

#### Scenario: Visualização de pontuação parcial para jogo em andamento
- **WHEN** o usuário abre o modal de pontuadores de um jogo em andamento ou agendado
- **THEN** o sistema calcula as pontuações com base no placar atual e exibe o badge "Placar Parcial" com a pontuação marcada como "(parcial)".

