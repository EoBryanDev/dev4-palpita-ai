# area-privada-palpites Specification

## Purpose
TBD - created by archiving change private-area. Update Purpose after archive.
## Requirements
### Requirement: Registro de Palpites de Placares Futuros
O sistema DEVE permitir que o competidor insira ou atualize seus palpites (placar do Time A e placar do Time B) para partidas futuras.

#### Scenario: Envio de novo palpite com sucesso
- **WHEN** o usuário seleciona um jogo futuro, insere um placar e clica em salvar
- **THEN** o sistema valida e grava o palpite no banco de dados, associando-o ao usuário logado e à partida.

### Requirement: Bloqueio Temporal de Palpites (RN02)
O sistema DEVE impedir o envio ou a alteração de palpites para uma partida a partir do minuto exato de seu início cadastrado.

#### Scenario: Tentativa de palpite após início da partida
- **WHEN** o horário atual for igual ou posterior à data/hora de início da partida e o usuário tenta salvar ou alterar o palpite
- **THEN** o sistema rejeita a alteração, exibe um erro de validação e desativa o formulário correspondente na interface do usuário.

### Requirement: Liberação de Palpites Condicionada (RN05)
O sistema DEVE permitir a gravação de palpites apenas para usuários que tenham sido marcados como "Liberado" pelo Administrador do bolão.

#### Scenario: Usuário sem liberação tenta palpitar
- **WHEN** o usuário com status "Pendente de Liberação" tenta gravar um palpite para qualquer jogo
- **THEN** o sistema impede a gravação, rejeita a ação e exibe uma mensagem orientando o usuário a aguardar a liberação do administrador.

#### Scenario: Usuário liberado tenta palpitar
- **WHEN** o usuário com status "Liberado" pelo administrador salva seus palpites
- **THEN** o sistema processa e grava os palpites com sucesso.

