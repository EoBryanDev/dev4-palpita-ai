## MODIFIED Requirements

### Requirement: Tabela de Ranking com Carregamento Rápido
O sistema DEVE carregar a página de ranking (`/ranking`) em menos de 2 segundos, utilizando renderização híbrida no servidor (RSC) e cache com revalidação dinâmica no cliente. O sistema DEVE omitir usuários administradores (cargo `ADMIN`) da classificação geral. Caso nenhum usuário possua pontos cadastrados, o sistema DEVE suspender a exibição nominativa do pódio de 1º, 2º e 3º colocados e exibir um status de "Aguardando competição iniciar".

#### Scenario: Visualização do ranking com jogos finalizados e pontos
- **WHEN** o usuário acessa a rota `/ranking` e existem pontos acumulados maiores que zero no ranking geral
- **THEN** o sistema exibe os 3 primeiros colocados destacados no pódio de 1º, 2º e 3º lugar, e a tabela completa contendo todos os competidores (excluindo administradores) ordenados por pontuação decrescente.

#### Scenario: Visualização do ranking antes do início dos jogos ou sem pontos
- **WHEN** o usuário acessa a rota `/ranking` e todos os participantes possuem zero pontos cadastrados
- **THEN** o sistema oculta a visualização nominativa do pódio de 1º, 2º e 3º colocados, exibe uma mensagem de status de "Aguardando competição iniciar" no topo e lista os competidores por ordem alfabética na tabela geral com pontuação zerada.
