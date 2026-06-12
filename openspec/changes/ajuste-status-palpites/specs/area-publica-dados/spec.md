## ADDED Requirements

### Requirement: Exibição de Status Dinâmico de Partidas
O sistema MUST calcular e exibir o status de cada partida na tela de palpites dinamicamente e com cores específicas:
1. **Encerrado**: Rótulo em cinza (zinc). Exibido se o status no banco for FINALIZADO ou FINALIZADA.
2. **Agendado**: Rótulo em verde (emerald). Exibido se a data/hora atual for anterior à data/hora de início do jogo (`dataInicio`).
3. **Em Andamento**: Rótulo em azul claro (blue/sky). Exibido se a data/hora atual for posterior ou igual ao início do jogo, o tempo transcorrido for inferior a 115 minutos, e o status no banco não for finalizado.
4. **Calculando Encerramento**: Rótulo em roxo claro (purple/violet). Exibido se a data/hora atual for posterior ou igual ao início do jogo, o tempo transcorrido for igual ou superior a 115 minutos, e o status no banco não for finalizado.

#### Scenario: Partida finalizada pelo administrador
- **WHEN** a partida tem o status "FINALIZADO" no banco de dados
- **THEN** o rótulo de status exibido é "Encerrado" em cinza

#### Scenario: Partida que ainda não começou
- **WHEN** o status não for finalizado e o horário atual for anterior ao horário de início da partida
- **THEN** o rótulo de status exibido é "Agendado" em verde

#### Scenario: Partida em andamento
- **WHEN** o status não for finalizado, o horário atual for igual ou posterior ao início da partida, e o tempo transcorrido for menor que 115 minutos
- **THEN** o rótulo de status exibido é "Em Andamento" em azul claro

#### Scenario: Partida aguardando finalização (calculando encerramento)
- **WHEN** o status não for finalizado, o horário atual for igual ou posterior ao início da partida, e o tempo transcorrido for igual ou superior a 115 minutos
- **THEN** o rótulo de status exibido é "Calculando Encerramento" em roxo claro
