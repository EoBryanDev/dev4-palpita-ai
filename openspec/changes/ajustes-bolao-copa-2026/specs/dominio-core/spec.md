## MODIFIED Requirements

### Requirement: Cálculo de Pontuação (RN01)
O sistema DEVE atribuir 2 pontos para palpites que acertarem o placar exato da partida. O sistema DEVE atribuir 1 ponto para palpites que errarem o placar exato, mas acertarem o resultado oficial da partida (vencedor correto ou ocorrência de empate). Em qualquer outro caso (erro de resultado e placar), o sistema DEVE atribuir 0 pontos.

#### Scenario: Placar exato
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 2 a 1 para o Time A
- **THEN** o sistema atribui 2 pontos ao palpite.

#### Scenario: Vencedor correto com placar diferente
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 3 a 0 para o Time A
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Empate correto com placar diferente
- **WHEN** o placar oficial is 1 a 1, e o palpite do usuário é 0 a 0
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Erro de vencedor e placar
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 0 a 2 para o Time B
- **THEN** o sistema atribui 0 pontos ao palpite.

### Requirement: Bloqueio de Palpites no Início da Partida (RN02)
O sistema DEVE desativar a gravação ou alteração de palpites para qualquer partida de uma determinada rodada a partir de exatamente 30 minutos antes do horário cadastrado de início da primeira partida daquela rodada.

#### Scenario: Gravação após o limite de 30 minutos antes do primeiro jogo
- **WHEN** o usuário tenta enviar ou atualizar um palpite para uma partida e o horário atual é posterior ou igual a 30 minutos antes da primeira partida da rodada à qual o jogo pertence
- **THEN** o sistema recusa a gravação do palpite e gera um erro de validação.
