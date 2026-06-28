# dominio-core Specification

## MODIFIED Requirements

### Requirement: Cálculo de Pontuação (RN01)
O sistema DEVE calcular a pontuação dos palpites de acordo com a fase do torneio (Grupo ou Mata-Mata):

#### Fase de Grupos
1. **Placar Exato:** Atribui 2 pontos se o palpite for idêntico ao placar oficial do jogo.
2. **Vencedor/Empate Correto:** Atribui 1 ponto se o palpite errou o placar exato, mas acertou o resultado.
3. **Erro Geral:** Atribui 0 pontos caso contrário.

#### Fase de Mata-Mata (Knockout)
1. **Placar Exato:** Atribui 2 pontos se o palpite for idêntico ao placar do jogo.
2. **Vencedor/Empate Correto:** Atribui 1 ponto se o palpite errou o placar, mas acertou o resultado.
3. **Bônus de Período (+1):** Se o jogo NÃO terminou empatado e o usuário acertou o momento da vitória (NORMAL ou PRORROGACAO), ganha +1 ponto.
4. **Bônus de Vencedor nos Pênaltis (+1):** Se o jogo terminou empatado e o usuário acertou o vencedor nos pênaltis, ganha +1 ponto.
5. **Os bônus são mutuamente exclusivos**: nunca se acumulam na mesma partida.

#### Scenario: Placar exato (Grupos ou Mata-Mata sem bônus)
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 2 a 1 (fase de grupos)
- **THEN** o sistema atribui 2 pontos ao palpite

#### Scenario: Vencedor correto com placar diferente
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 3 a 0
- **THEN** o sistema atribui 1 ponto ao palpite

#### Scenario: Empate correto com placar diferente
- **WHEN** o placar oficial é 1 a 1, e o palpite do usuário é 0 a 0
- **THEN** o sistema atribui 1 ponto ao palpite

#### Scenario: Erro de vencedor e placar
- **WHEN** o placar oficial é 2 a 1, e o palpite do usuário é 0 a 2
- **THEN** o sistema atribui 0 pontos ao palpite

#### Scenario: Placar exato com acerto de bônus no Mata-Mata (sem empate)
- **WHEN** o placar oficial é 2 a 1 na Prorrogação, e o palpite do usuário é 2 a 1 com Prorrogação
- **THEN** o sistema atribui 3 pontos (2 do placar + 1 de bônus de período)

#### Scenario: Empate com acerto de vencedor nos pênaltis
- **WHEN** o placar oficial é 1 a 1, Time A nos pênaltis, e o palpite é 1 a 1 com Time A nos pênaltis
- **THEN** o sistema atribui 3 pontos (2 placar exato + 1 bônus de vencedor)

#### Scenario: Empate com placar diferente mas acerto de vencedor nos pênaltis
- **WHEN** o placar oficial é 1 a 1, Time A nos pênaltis, e o palpite é 0 a 0 com Time A nos pênaltis
- **THEN** o sistema atribui 2 pontos (1 empate + 1 bônus de vencedor)

#### Scenario: Empate com placar exato mas vencedor errado
- **WHEN** o placar oficial é 1 a 1, Time A nos pênaltis, e o palpite é 1 a 1 com Time B nos pênaltis
- **THEN** o sistema atribui 2 pontos (2 placar exato, sem bônus)

#### Scenario: Erro de resultado em Mata-Mata
- **WHEN** o placar oficial é 2 a 1 no tempo normal, e o palpite do usuário é 1 a 1 com Time A nos pênaltis
- **THEN** o sistema atribui 0 pontos

### Requirement: Bloqueio de Palpites por Partida (RN02)
O sistema DEVE bloquear a gravação ou alteração de palpites seguindo as seguintes restrições:

1. **Usuários comuns:** Cada partida é bloqueada individualmente 30 minutos antes do seu início.
2. **Usuários com liberação tardia:** Têm uma janela de 30 minutos a partir do campo `dataLiberacao` para cadastrar palpites.
3. **Regra individual:** O palpite é bloqueado assim que a partida se inicia (`agora >= dataInicio`).

#### Scenario: Gravação dentro do prazo de 30 minutos antes da partida
- **WHEN** o usuário tenta enviar um palpite para uma partida que começa em 35 minutos
- **THEN** o sistema permite a gravação

#### Scenario: Gravação com menos de 30 minutos antes da partida
- **WHEN** o usuário tenta enviar um palpite para uma partida que começa em 25 minutos
- **THEN** o sistema bloqueia com erro "Prazo para palpitar nesta partida expirou"

#### Scenario: Gravação após o prazo de liberação tardia
- **WHEN** o usuário tardio tenta enviar um palpite após 30 minutos contados a partir da sua `dataLiberacao`
- **THEN** o sistema bloqueia e impede a gravação

#### Scenario: Gravação após o início de um jogo individual
- **WHEN** o usuário tenta enviar ou alterar um palpite para uma partida que já se iniciou
- **THEN** o sistema recusa e exibe erro
