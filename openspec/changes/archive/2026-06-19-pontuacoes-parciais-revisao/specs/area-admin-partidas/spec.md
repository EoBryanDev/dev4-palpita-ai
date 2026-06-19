## MODIFIED Requirements

### Requirement: Lançamento de Resultados Oficiais e Recálculo de Pontos (RN01)
O sistema DEVE processar automaticamente a pontuação de todos os palpites válidos de uma partida no momento em que o administrador lançar seu resultado oficial. O administrador MUST ser capaz de revisar/corrigir o placar oficial de partidas que já foram finalizadas, desencadeando o mesmo recálculo automático.

#### Scenario: Inserção de placar de partida finalizada
- **WHEN** o administrador acessa o painel de resultados de jogos, insere o placar final oficial de um jogo e clica em salvar
- **THEN** o sistema atualiza o status do jogo para "Finalizado", executa o algoritmo de cálculo de pontuação (RN01) sobre todos os palpites dos usuários para este jogo, atualiza a soma de pontuação de cada usuário e recalcula as colocações da tabela de ranking.

#### Scenario: Revisão de placar de partida já finalizada
- **WHEN** o administrador acessa o painel, clica em "Revisar" em um jogo já finalizado, altera o placar e clica em salvar a correção
- **THEN** o sistema atualiza o placar oficial da partida finalizada, executa novamente o algoritmo de cálculo de pontuação sobre todos os palpites dos usuários para este jogo, atualizando as pontuações e o ranking de forma consistente.
