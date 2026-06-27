## ADDED Requirements

### Requirement: Coluna data_liberacao na tabela usuarios
A tabela `usuarios` DEVE conter uma coluna opcional `data_liberacao` (timestamp) que registra quando o administrador liberou o usuário para palpitar. Usuários liberados antes do início da copa podem ter este campo nulo.

#### Scenario: Registro de liberação tardia
- **WHEN** o administrador usa a ação "Liberar Acesso Tardio" para um usuário
- **THEN** o sistema registra a data/hora atual no campo `data_liberacao` do usuário
