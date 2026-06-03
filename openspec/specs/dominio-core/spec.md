# dominio-core Specification

## Purpose
TBD - created by archiving change inicializar-monorepo. Update Purpose after archive.
## Requirements
### Requirement: Cálculo de Pontuação (RN01)
O sistema DEVE atribuir 1 ponto para palpites que acertarem o placar exato ou o resultado oficial da partida (vencedor ou empate). Em qualquer outro caso, o sistema DEVE atribuir 0 pontos.

#### Scenario: Placar exato
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 2 a 1 para o Time A
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Vencedor correto com placar diferente
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 3 a 0 para o Time A
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Empate correto com placar diferente
- **WHEN** o placar oficial é 1 a 1, e o palpite do usuário é 0 a 0
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Erro de vencedor e placar
- **WHEN** o placar oficial é 2 a 1 para o Time A, e o palpite do usuário é 0 a 2 para o Time B
- **THEN** o sistema atribui 0 pontos ao palpite.

### Requirement: Bloqueio de Palpites no Início da Partida (RN02)
O sistema DEVE desativar a gravação ou alteração de palpites para uma partida no minuto exato cadastrado como o de início real do jogo.

#### Scenario: Gravação após o início do jogo
- **WHEN** o usuário tenta enviar ou atualizar um palpite para uma partida e o horário atual é maior ou igual ao horário de início da partida
- **THEN** o sistema recusa a gravação do palpite e gera um erro de validação.

### Requirement: Validação de Expiração de Convite (RN04)
O sistema DEVE considerar inválidos links de convite `/validation-user/{uuid}` cujo tempo decorrido desde a sua criação seja maior que exatamente 5 minutos.

#### Scenario: Acesso ao link expirado
- **WHEN** o usuário acessa o link `/validation-user/{uuid}` e o campo de expiração daquele token no banco de dados já passou do horário atual
- **THEN** a página de validação bloqueia o cadastro de senha e exibe a mensagem de solicitar um novo link ao administrador.

