# dominio-core Specification

## Purpose
TBD - created by archiving change inicializar-monorepo. Update Purpose after archive.
## Requirements
### Requirement: Cálculo de Pontuação (RN01)
O sistema DEVE calcular a pontuação dos palpites de acordo com a fase do torneio (Grupo ou Mata-Mata):

#### Fase de Grupos
1. **Placar Exato:** Atribui 2 pontos se o palpite for idêntico ao placar oficial do jogo.
2. **Vencedor/Empate Correto:** Atribui 1 ponto se o palpite errou o placar exato, mas acertou o resultado (vencedor correto ou ocorrência de empate).
3. **Erro Geral:** Atribui 0 pontos caso contrário.

#### Fase de Mata-Mata (Knockout)
1. **Placar Exato:** Atribui 2 pontos se o palpite for idêntico ao placar do jogo (tempo regulamentar + prorrogação, excluindo disputa de pênaltis).
2. **Vencedor/Empate Correto:** Atribui 1 ponto se o palpite errou o placar, mas acertou o resultado antes de pênaltis.
3. **Bônus de Momento da Vitória (+1 ponto extra):** Se o usuário acertar o momento exato em que a vaga/vitória é decidida (tempo normal, prorrogação ou pênaltis), ganha +1 ponto de bônus.

#### Scenario: Placar exato (Grupos ou Mata-Mata sem bônus)
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 2 a 1 (sem bônus de momento de mata-mata)
- **THEN** o sistema atribui 2 pontos ao palpite.

#### Scenario: Vencedor correto com placar diferente
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 3 a 0
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Empate correto com placar diferente
- **WHEN** o placar oficial é 1 a 1, e o palpite do usuário é 0 a 0
- **THEN** o sistema atribui 1 ponto ao palpite.

#### Scenario: Erro de vencedor e placar
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 0 a 2
- **THEN** o sistema atribui 0 pontos ao palpite.

#### Scenario: Placar exato com acerto de bônus no Mata-Mata
- **WHEN** o placar oficial é 2 a 1 na Prorrogação, e o palpite do usuário é 2 a 1 vencendo na Prorrogação
- **THEN** o sistema atribui 3 pontos (2 do placar + 1 de bônus).

#### Scenario: Empate com acerto de bônus de pênaltis no Mata-Mata
- **WHEN** o placar oficial é 2 a 2 nos pênaltis, e o palpite é 1 a 1 vencendo nos pênaltis
- **THEN** o sistema atribui 2 pontos (1 de empate + 1 de bônus - os gols dos pênaltis são desconsiderados).

### Requirement: Bloqueio de Palpites no Início da Partida (RN02)
O sistema DEVE desativar a gravação ou alteração de palpites seguindo as seguintes restrições:

#### 1. Regra Atual (Código)
*   **Usuários comuns:** Todas as apostas são bloqueadas globalmente 30 minutos antes do início do primeiro jogo do torneio (Copa).
*   **Usuários com liberação tardia:** Têm uma janela de 30 minutos a partir do campo `dataLiberacao` para cadastrar palpites.
*   **Regra individual:** O palpite é individualmente bloqueado assim que a partida se inicia (`agora >= dataInicio`).

#### Scenario: Gravação após o prazo limite do torneio (Usuário normal)
- **WHEN** o usuário comum tenta enviar um palpite após 30 minutos do primeiro jogo da Copa
- **THEN** o sistema bloqueia e gera um erro de validação.

#### Scenario: Gravação após o prazo de liberação tardia
- **WHEN** o usuário tardio tenta enviar um palpite após 30 minutos contados a partir da sua `dataLiberacao`
- **THEN** o sistema bloqueia e impede a gravação.

#### Scenario: Gravação após o início de um jogo individual
- **WHEN** o usuário tenta enviar ou alterar um palpite para uma partida que já se iniciou (`agora >= dataInicio`)
- **THEN** o sistema recusa e exibe erro.

#### 2. Nova Regra Planejada (Rodada)
*   O envio ou a alteração de palpites para qualquer partida de uma rodada é bloqueado exatamente 30 minutos antes do início da primeira partida daquela rodada.

### Requirement: Validação de Expiração de Convite (RN04)
O sistema DEVE considerar inválidos links de convite `/validation-user/{uuid}` cujo tempo decorrido desde a sua criação seja maior que exatamente 5 minutos.

#### Scenario: Acesso ao link expirado
- **WHEN** o usuário acessa o link `/validation-user/{uuid}` e o campo de expiração daquele token no banco de dados já passou do horário atual
- **THEN** a página de validação bloqueia o cadastro de senha e exibe a mensagem de solicitar um novo link ao administrador.


