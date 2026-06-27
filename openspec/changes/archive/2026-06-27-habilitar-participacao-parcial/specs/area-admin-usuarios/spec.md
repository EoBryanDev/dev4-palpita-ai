## ADDED Requirements

### Requirement: Liberação de Acesso Tardio (RN06)
O sistema DEVE permitir que o administrador libere usuários com status ATIVO para palpitar em partidas futuras quando a Copa já começou, concedendo uma janela de 30 minutos.

#### Scenario: Liberação de acesso tardio
- **WHEN** o administrador clica em "Liberar Acesso Tardio" para um usuário com status ATIVO (após o início da copa)
- **THEN** o sistema altera o status para LIBERADO, registra `dataLiberacao` com a data/hora atual, e o usuário recebe 30 min para palpitar.

#### Scenario: Botão desabilitado para usuário já liberado
- **WHEN** o administrador visualiza um usuário com status LIBERADO
- **THEN** o botão "Liberar Acesso Tardio" não é exibido, apenas as ações padrão (Bloquear Apostas, Desativar).

## MODIFIED Requirements

### Requirement: Gestão de Permissões e Liberação de Usuários (RN05)
O sistema DEVE permitir que o administrador alterne o status de participação de um usuário cadastrado entre "Pendente de Liberação" e "Liberado" para gerenciar quem pode registrar palpites. Para usuários que se cadastraram após o início da Copa, o admin pode usar a opção "Liberar Acesso Tardio" que concede uma janela de 30 minutos.

#### Scenario: Liberação manual de usuário (normal)
- **WHEN** o administrador seleciona um usuário cadastrado (ANTES do início da copa) e altera seu status para "Liberado"
- **THEN** o sistema atualiza o status do usuário no banco de dados sem `dataLiberacao`, habilitando imediatamente sua permissão para enviar palpites com deadline global.

#### Scenario: Liberação tardia de usuário
- **WHEN** o administrador seleciona "Liberar Acesso Tardio" para um usuário ATIVO (APÓS o início da copa)
- **THEN** o sistema atualiza o status para LIBERADO, registra `dataLiberacao`, e informa que o usuário terá 30 min para palpitar.
