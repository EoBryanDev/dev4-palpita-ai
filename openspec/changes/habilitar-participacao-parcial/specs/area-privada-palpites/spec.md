## MODIFIED Requirements

### Requirement: Bloqueio Temporal de Palpites (RN02)
O sistema DEVE impedir o envio ou a alteração de palpites para uma rodada a partir de 30 minutos antes do início do primeiro jogo correspondente àquela rodada. Para usuários com `dataLiberacao` preenchida (liberação tardia), o prazo é de 30 minutos a partir da `dataLiberacao`, limitado às partidas que ainda não iniciaram.

#### Scenario: Tentativa de palpite após o prazo limite da rodada (usuário normal)
- **WHEN** o horário atual for posterior ou igual a 30 minutos antes do início do primeiro jogo da rodada e o usuário (sem `dataLiberacao`) tenta salvar ou alterar o palpite de qualquer jogo da rodada
- **THEN** o sistema rejeita a alteração, exibe um erro de validação e desativa o formulário/inputs correspondentes no dashboard do usuário competidor.

#### Scenario: Tentativa de palpite de usuário tardio em partida já iniciada
- **WHEN** o usuário com `dataLiberacao` tenta palpitar em uma partida cujo `dataInicio` já passou
- **THEN** o sistema rejeita o palpite com mensagem "Esta partida já iniciou".

#### Scenario: Palpite de usuário tardio em partida futura dentro da janela
- **WHEN** o usuário com `dataLiberacao` tenta palpitar em uma partida futura dentro de 30 minutos após a liberação
- **THEN** o sistema permite e grava o palpite com sucesso.

### Requirement: Liberação de Palpites Condicionada (RN05)
O sistema DEVE permitir a gravação de palpites apenas para usuários que tenham sido marcados como "Liberado" pelo Administrador do bolão. Usuários com `dataLiberacao` preenchida têm 30 minutos para palpitar apenas em partidas não iniciadas.

#### Scenario: Usuário com liberação tardia dentro do prazo
- **WHEN** o usuário com `dataLiberacao` está dentro da janela de 30 min e a partida é futura
- **THEN** o sistema processa e grava os palpites com sucesso.

#### Scenario: Usuário com liberação tardia fora do prazo
- **WHEN** o usuário com `dataLiberacao` está fora da janela de 30 min
- **THEN** o sistema bloqueia todos os inputs e exibe banner "Seu prazo para palpitar expirou".
