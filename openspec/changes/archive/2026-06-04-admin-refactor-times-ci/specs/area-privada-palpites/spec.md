## MODIFIED Requirements

### Requirement: Registro de Palpites de Placares Futuros
O sistema MUST permitir que o competidor insira ou atualize seus palpites para partidas futuras, renderizando os nomes e emojis dos times cadastrados dinamicamente.

#### Scenario: Envio de novo palpite com sucesso
- **WHEN** o usuário seleciona um jogo futuro, insere um placar e clica em salvar
- **THEN** o sistema valida e grava o palpite no banco de dados, associando-o ao usuário logado e à partida, exibindo feedback visual de sucesso.
