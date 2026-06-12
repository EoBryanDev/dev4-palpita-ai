# area-publica-dados Specification

## Purpose
TBD - created by archiving change infra-and-public-area. Update Purpose after archive.
## Requirements
### Requirement: Tabela de Ranking com Carregamento Rápido
O sistema DEVE carregar a página de ranking (`/ranking`) em menos de 2 segundos, utilizando renderização híbrida no servidor (RSC) e cache com revalidação dinâmica no cliente. O sistema DEVE omitir usuários administradores (cargo `ADMIN`) da classificação geral. Caso nenhum usuário possua pontos cadastrados, o sistema DEVE suspender a exibição nominativa do pódio de 1º, 2º e 3º colocados e exibir um status de "Aguardando competição iniciar".

#### Scenario: Visualização do ranking com jogos finalizados e pontos
- **WHEN** o usuário acessa a rota `/ranking` e existem pontos acumulados maiores que zero no ranking geral
- **THEN** o sistema exibe os 3 primeiros colocados destacados no pódio de 1º, 2º e 3º lugar, e a tabela completa contendo todos os competidores (excluindo administradores) ordenados por pontuação decrescente.

#### Scenario: Visualização do ranking antes do início dos jogos ou sem pontos
- **WHEN** o usuário acessa a rota `/ranking` e todos os participantes possuem zero pontos cadastrados
- **THEN** o sistema oculta a visualização nominativa do pódio de 1º, 2º e 3º colocados, exibe uma mensagem de status de "Aguardando competição iniciar" no topo e lista os competidores por ordem alfabética na tabela geral com pontuação zerada.

### Requirement: Segurança de Visualização de Palpites Individuais (RN03)
O sistema DEVE permitir a visualização pública dos palpites individuais detalhados de todos os usuários a qualquer momento, dado que as edições de palpites estão trancadas para o torneio inteiro e a Copa já começou.

#### Scenario: Consulta a palpite individual
- **WHEN** o usuário tenta visualizar o palpite de outro competidor para qualquer partida
- **THEN** o sistema permite a visualização pública e transparente do palpite individual daquele usuário para a respectiva partida.

### Requirement: Analytics Agregado de Palpites
O sistema MUST calcular e exibir na rota `/palpites` a estatística agregada (porcentagem de palpites para vitória do time A, vitória do time B ou empate) para cada jogo, contemplando palpites de usuários que estejam tanto em status "ATIVO" quanto "LIBERADO" no sistema.

#### Scenario: Acesso ao painel de analytics de palpites
- **WHEN** qualquer visitante acessa a rota `/palpites`
- **THEN** o sistema busca os palpites agregados de usuários ativos e liberados, calcula as porcentagens e exibe os gráficos de tendência de cada partida cadastrada utilizando as referências das equipes no banco de dados.

