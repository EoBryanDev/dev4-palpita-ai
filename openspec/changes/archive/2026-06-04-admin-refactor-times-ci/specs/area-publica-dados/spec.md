## MODIFIED Requirements

### Requirement: Analytics Agregado de Palpites
O sistema MUST calcular e exibir na rota `/palpites` a estatística agregada (porcentagem de palpites para vitória do time A, vitória do time B ou empate) para cada jogo, contemplando palpites de usuários que estejam tanto em status "ATIVO" quanto "LIBERADO" no sistema.

#### Scenario: Acesso ao painel de analytics de palpites
- **WHEN** qualquer visitante acessa a rota `/palpites`
- **THEN** o sistema busca os palpites agregados de usuários ativos e liberados, calcula as porcentagens e exibe os gráficos de tendência de cada partida cadastrada utilizando as referências das equipes no banco de dados.
