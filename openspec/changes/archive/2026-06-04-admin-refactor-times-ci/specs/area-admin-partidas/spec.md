## MODIFIED Requirements

### Requirement: Gerenciamento de Jogos e Rodadas
O sistema MUST permitir que o administrador configure as rodadas do bolão e cadastre/atualize as partidas escolhendo obrigatoriamente equipes pré-cadastradas no sistema como Time A e Time B (não permitindo texto livre).

#### Scenario: Cadastro de novo jogo
- **WHEN** o administrador cria uma nova partida escolhendo as equipes a partir da listagem de times cadastrados, insere data/hora do jogo e clica em salvar
- **THEN** a partida é gravada com status "Não Iniciada" e passa a estar disponível no calendário e para preenchimento de palpites.
