# area-admin-partidas Specification

## ADDED Requirements

### Requirement: Seletor de Vencedor nos Pênaltis no Lançamento de Resultado
O sistema DEVE exibir um seletor obrigatório de vencedor nos pênaltis quando o admin estiver lançando um resultado de partida MATAMATA com placar empatado.

#### Scenario: Admin lança resultado de partida MATAMATA com empate
- **WHEN** o admin digita golsA === golsB em partida MATAMATA e clica em finalizar
- **THEN** o sistema exibe seletor obrigatório de "Quem venceu nos pênaltis?" antes de permitir a finalização

#### Scenario: Admin visualiza partida MATAMATA finalizada com pênaltis
- **WHEN** o admin acessa o painel e uma partida MATAMATA foi finalizada com empate
- **THEN** o sistema exibe "Venceu nos pênaltis: <time>" no card da partida

#### Scenario: Admin revisa resultado de partida MATAMATA
- **WHEN** o admin clica em revisar partida MATAMATA finalizada com empate
- **THEN** o sistema exibe o seletor de vencedor nos pênaltis preenchido com o valor atual, permitindo alteração
