## MODIFIED Requirements

### Requirement: Bloqueio Temporal de Palpites (RN02)
O sistema DEVE impedir o envio ou a alteração de palpites para uma rodada a partir de 30 minutos antes do início do primeiro jogo correspondente àquela rodada.

#### Scenario: Tentativa de palpite após o prazo limite da rodada
- **WHEN** o horário atual for posterior ou igual a 30 minutos antes do início do primeiro jogo da rodada e o usuário tenta salvar ou alterar o palpite de qualquer jogo da rodada
- **THEN** o sistema rejeita a alteração, exibe um erro de validação e desativa o formulário/inputs correspondentes no dashboard do usuário competidor.
