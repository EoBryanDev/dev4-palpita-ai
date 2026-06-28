# pontuacao-penaltis-mata-mata Specification

## Purpose
Define a nova regra de bônus para vencedor nos pênaltis em jogos mata-mata, incluindo campos obrigatórios e validações.

## ADDED Requirements

### Requirement: Bônus de Vencedor nos Pênaltis (+1)
O sistema DEVE conceder +1 ponto extra se o usuário acertar o vencedor nos pênaltis em uma partida MATAMATA que terminou empatada e foi decidida em pênaltis.

#### Scenario: Palpite empata e acerta vencedor nos pênaltis
- **WHEN** o placar oficial é 1 a 1, o time A venceu nos pênaltis, e o palpite do usuário foi 0 a 0 com time A nos pênaltis
- **THEN** o sistema atribui 2 pontos (1 do empate + 1 do bônus de vencedor)

#### Scenario: Palpite empata, acerta placar exato e vencedor nos pênaltis
- **WHEN** o placar oficial é 2 a 2, o time B venceu nos pênaltis, e o palpite do usuário foi 2 a 2 com time B nos pênaltis
- **THEN** o sistema atribui 3 pontos (2 do placar exato + 1 do bônus de vencedor)

#### Scenario: Palpite empata mas erra vencedor nos pênaltis
- **WHEN** o placar oficial é 1 a 1, o time A venceu nos pênaltis, e o palpite do usuário foi 1 a 1 com time B nos pênaltis
- **THEN** o sistema atribui 2 pontos (2 do placar exato, sem bônus de vencedor)

### Requirement: Campo Obrigatório timeVencedorPrevisto
O sistema DEVE exigir que o usuário informe `timeVencedorPrevisto` (A ou B) ao palpitar empate em partida MATAMATA.

#### Scenario: Usuário palpitou empate sem informar vencedor
- **WHEN** o usuário envia um palpite com golsA === golsB para partida MATAMATA e `timeVencedorPrevisto` está vazio
- **THEN** o sistema recusa e exibe erro "Informe quem vence nos pênaltis"

#### Scenario: Usuário palpitou resultado sem empate
- **WHEN** o usuário envia um palpite com golsA !== golsB para partida MATAMATA
- **THEN** o sistema NÃO exige `timeVencedorPrevisto`

### Requirement: Campo Obrigatório timeVencedorPenaltis no Resultado
O sistema DEVE exigir que o admin informe `timeVencedorPenaltis` (A ou B) ao lançar resultado de partida MATAMATA com empate.

#### Scenario: Admin lança resultado de empate sem informar vencedor
- **WHEN** o admin tenta finalizar partida MATAMATA com golsA === golsB e `timeVencedorPenaltis` está vazio
- **THEN** o sistema recusa e exibe erro

### Requirement: momentoPrevisto Automático para Empates
O sistema DEVE ajustar automaticamente `momentoPrevisto` para `'PENALTIS'` quando o palpite é empate em MATAMATA.

#### Scenario: Usuário digita empate em MATAMATA
- **WHEN** o usuário altera o placar para golsA === golsB em partida MATAMATA
- **THEN** o sistema (frontend) força `momentoPrevisto` para `'PENALTIS'` e exibe seletor de vencedor
