# area-privada-dashboard Specification

## ADDED Requirements

### Requirement: Seletor de Vencedor nos Pênaltis no Formulário
O sistema DEVE exibir um seletor obrigatório de vencedor nos pênaltis (Time A ou Time B) no formulário de palpite quando o usuário digitar empate em partida MATAMATA.

#### Scenario: Usuário digita empate em MATAMATA no formulário pendente
- **WHEN** o usuário altera o placar para golsA === golsB em partida MATAMATA na seção de palpites pendentes
- **THEN** o sistema esconde o seletor de `momentoPrevisto` e exibe o seletor de `timeVencedorPrevisto` com os nomes dos times

#### Scenario: Usuário digita placar não-empate em MATAMATA
- **WHEN** o usuário altera o placar para golsA !== golsB em partida MATAMATA
- **THEN** o sistema esconde o seletor de vencedor e exibe o seletor de `momentoPrevisto` (NORMAL/PRORROGACAO)

### Requirement: Exibição de Vencedor nos Pênaltis no Histórico
O sistema DEVE exibir no histórico de palpites se o usuário acertou ou errou o vencedor nos pênaltis.

#### Scenario: Visualização de histórico com vencedor nos pênaltis
- **WHEN** o usuário acessa o histórico e a partida MATAMATA foi decidida nos pênaltis
- **THEN** o sistema exibe "Decidido nos pênaltis: <time>" e "Seu palpite: <time> ✓/✗"

### Requirement: Alerta de Prazo por Partida
O sistema DEVE alertar o usuário sobre o prazo individual de cada partida (30 min antes do início), não mais o prazo global da rodada.

#### Scenario: Prazo exibido no dashboard reflete a partida individual
- **WHEN** o usuário acessa o dashboard e há partidas com diferentes horários na mesma rodada
- **THEN** cada partida exibe seu próprio status de prazo baseado em 30 min antes do seu início
