## ADDED Requirements

### Requirement: Campo dataLiberacao na entidade Usuario
A entidade `Usuario` DEVE expor o campo `dataLiberacao` para rastrear liberações tardias.

#### Scenario: Leitura do campo dataLiberacao
- **WHEN** o sistema consulta um usuário que foi liberado tardiamente
- **THEN** o campo `dataLiberacao` contém a data/hora exata da liberação

## MODIFIED Requirements

### Requirement: Liberação de Palpites Condicionada (RN05)
O sistema DEVE permitir a gravação de palpites apenas para usuários que tenham sido marcados como "Liberado" pelo Administrador do bolão. Usuários com `dataLiberacao` preenchida têm uma janela de 30 minutos a partir da liberação para enviar palpites em partidas que ainda não iniciaram.

#### Scenario: Usuário sem liberação tenta palpitar
- **WHEN** o usuário com status "Pendente de Liberação" tenta gravar um palpite para qualquer jogo
- **THEN** o sistema impede a gravação, rejeita a ação e exibe uma mensagem orientando o usuário a aguardar a liberação do administrador.

#### Scenario: Usuário liberado tardiamente dentro da janela de 30 min
- **WHEN** o usuário com `dataLiberacao` preenchida tenta palpitar em uma partida que ainda não começou, dentro de 30 minutos após a liberação
- **THEN** o sistema permite o palpite apenas para aquela partida.

#### Scenario: Usuário liberado tardiamente após 30 min
- **WHEN** o usuário com `dataLiberacao` preenchida tenta palpitar após 30 minutos da liberação
- **THEN** o sistema recusa o palpite com mensagem de prazo expirado.

#### Scenario: Usuário liberado normal (sem dataLiberacao) tenta palpitar
- **WHEN** o usuário com status "Liberado" sem `dataLiberacao` salva seus palpites
- **THEN** o sistema processa e grava os palpites aplicando a regra de deadline global (30 min antes da 1ª partida do torneio).
