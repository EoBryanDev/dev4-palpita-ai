## ADDED Requirements

### Requirement: Dashboard Resumo do Administrador
O sistema SHALL exibir na rota `/admin` um dashboard contendo estatísticas agregadas de usuários e palpites.

#### Scenario: Visualizar estatísticas do painel administrativo
- **WHEN** o administrador acessa a rota `/admin`
- **THEN** o sistema renderiza os indicadores de total de usuários, total de usuários com status "LIBERADO" (confirmados), total de convites pendentes e percentual de palpites submetidos em relação ao esperado para a rodada atual.
