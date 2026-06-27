# area-privada-palpites Specification

## Purpose
TBD - created by archiving change private-area. Update Purpose after archive.
## Requirements
### Requirement: Registro de Palpites de Placares Futuros
O sistema MUST permitir que o competidor insira ou atualize seus palpites para partidas futuras, renderizando os nomes e emojis dos times cadastrados dinamicamente.

#### Scenario: Envio de novo palpite com sucesso
- **WHEN** o usuário seleciona um jogo futuro, insere um placar e clica em salvar
- **THEN** o sistema valida e grava o palpite no banco de dados, associando-o ao usuário logado e à partida, exibindo feedback visual de sucesso.

### Requirement: Bloqueio Temporal de Palpites (RN02)
O sistema DEVE impedir o envio ou a alteração de palpites em conformidade com as travas de prazo ativo:

#### 1. Comportamento Atual (Código)
*   **Usuários comuns:** Bloqueio global 30 minutos antes do primeiro jogo da Copa do Mundo.
*   **Usuários tardios:** Janela de 30 minutos após `dataLiberacao`.
*   **Partidas individuais:** Bloqueio individual assim que o jogo começa.

#### Scenario: Usuário comum tenta salvar após o limite global
- **WHEN** o usuário comum tenta salvar palpites após 30 minutos do primeiro jogo do torneio
- **THEN** o sistema recusa o salvamento e desativa os inputs correspondentes.

#### Scenario: Usuário tardio tenta salvar após o limite de 30 minutos
- **WHEN** o usuário tardio tenta salvar palpites após 30 minutos de ter sido liberado pelo administrador
- **THEN** o sistema recusa o salvamento.

#### Scenario: Tentativa de palpite em jogo que já começou
- **WHEN** o usuário tenta enviar ou alterar o palpite de um jogo que já iniciou (`agora >= dataInicio`)
- **THEN** o sistema rejeita a alteração.

#### 2. Nova Regra Planejada (Rodada)
*   O sistema impede o envio ou a alteração de palpites para uma rodada a partir de 30 minutos antes do início do primeiro jogo correspondente àquela rodada.

#### Scenario: Tentativa de palpite após o prazo limite da rodada (Regra Planejada)
- **WHEN** o horário atual for posterior ou igual a 30 minutos antes do início do primeiro jogo da rodada e o usuário tenta salvar ou alterar o palpite de qualquer jogo da rodada
- **THEN** o sistema rejeita a alteração, exibe um erro de validação e desativa o formulário/inputs correspondentes no dashboard.

### Requirement: Liberação de Palpites Condicionada (RN05)
O sistema DEVE permitir a gravação de palpites apenas para usuários que tenham sido marcados como "Liberado" pelo Administrador do bolão.

#### Scenario: Usuário sem liberação tenta palpitar
- **WHEN** o usuário com status "Pendente de Liberação" tenta gravar um palpite para qualquer jogo
- **THEN** o sistema impede a gravação, rejeita a ação e exibe uma mensagem orientando o usuário a aguardar a liberação do administrador.

#### Scenario: Usuário liberado tenta palpitar
- **WHEN** o usuário com status "Liberado" pelo administrador salva seus palpites
- **THEN** o sistema processa e grava os palpites com sucesso.

### Requirement: Listagem de Palpites em Andamento no Meu Espaço
No painel do competidor, o sistema MUST continuar listando e permitindo visualizar os palpites das partidas que já iniciaram (em andamento) mas que ainda não foram finalizadas pelo administrador. Essas partidas devem ser ordenadas por último nas buscas paginadas e na listagem das rodadas.

#### Scenario: Visualização de palpites salvos contendo jogos em andamento
- **WHEN** o usuário acessa o "Meu Espaço" e existem jogos em andamento (já iniciados, mas não finalizados)
- **THEN** o sistema os exibe no final da lista de palpites da rodada e ao final da paginação de palpites salvos.

