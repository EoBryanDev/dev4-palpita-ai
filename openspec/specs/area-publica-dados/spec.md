# area-publica-dados Specification

## Purpose
TBD - created by archiving change infra-and-public-area. Update Purpose after archive.
## Requirements
### Requirement: Tabela de Ranking com Carregamento Rápido
O sistema DEVE carregar a página de ranking (`/ranking`) em menos de 2 segundos, utilizando renderização híbrida no servidor (RSC) e cache com revalidação dinâmica no cliente.

#### Scenario: Visualização do ranking
- **WHEN** o usuário acessa a rota `/ranking`
- **THEN** o sistema exibe a lista atualizada de usuários ordenados por pontuação decrescente, contendo a posição, foto/nome, palpites corretos e pontuação acumulada.

### Requirement: Segurança de Visualização de Palpites Individuais (RN03)
O sistema DEVE impedir a visualização pública dos palpites individuais detalhados de um usuário por partida até que o horário real de início da respectiva partida seja atingido.

#### Scenario: Consulta a palpite individual antes do início
- **WHEN** o usuário tenta visualizar o palpite de outro competidor para uma partida cuja data/hora de início é no futuro
- **THEN** o sistema oculta o palpite individual ou retorna um indicador de "Palpite Fechado/Oculto".

#### Scenario: Consulta a palpite individual após o início
- **WHEN** a partida já iniciou (horário atual igual ou posterior ao início da partida)
- **THEN** o sistema permite a visualização pública e transparente do palpite individual daquele usuário para a respectiva partida.

### Requirement: Analytics Agregado de Palpites
O sistema DEVE calcular e exibir na rota `/palpites` a estatística agregada (porcentagem de palpites para vitória do time A, vitória do time B ou empate) para cada jogo de forma livre e pública.

#### Scenario: Acesso ao painel de analytics de palpites
- **WHEN** qualquer visitante acessa a rota `/palpites`
- **THEN** o sistema exibe gráficos ou barras percentuais de tendência dos palpites coletivos de cada partida cadastrada.

