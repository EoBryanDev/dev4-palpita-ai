# area-privada-dashboard Specification

## Purpose
TBD - created by archiving change private-area. Update Purpose after archive.
## Requirements
### Requirement: Exibição de Resumo de Pontuação
O sistema DEVE exibir de forma clara os pontos acumulados do usuário e sua classificação atual no ranking logo ao carregar a página `/meu-espaço`.

#### Scenario: Visualização de pontuação atual no painel
- **WHEN** o usuário logado acessa a rota `/meu-espaço`
- **THEN** o sistema exibe o total de pontos acumulados e a sua posição no ranking corporativo em destaque.

### Requirement: Alerta e Exibição de Jogos Pendentes
O sistema DEVE alertar o usuário sobre partidas da rodada que ele ainda não palpitou e cujo horário de início esteja no futuro.

#### Scenario: Jogos pendentes na rodada
- **WHEN** existirem partidas na rodada atual que o usuário logado não palpitou e que não iniciaram
- **THEN** o painel destaca visualmente estes jogos em uma seção de "Palpites Pendentes" com um atalho rápido para gravação.

### Requirement: Histórico de Palpites
O sistema DEVE disponibilizar uma listagem dos palpites passados do usuário contendo o placar apostado, o placar oficial do jogo e a pontuação que ele obteve.

#### Scenario: Consulta de palpites concluídos
- **WHEN** o usuário acessa seu histórico de palpites no painel
- **THEN** o sistema exibe a lista de partidas finalizadas, comparando a aposta com o resultado oficial e exibindo a marcação de pontos (1 ou 0) de acordo com a RN01.

