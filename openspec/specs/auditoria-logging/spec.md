# auditoria-logging Specification

## Purpose
TBD - created by archiving change seguranca-hardening. Update Purpose after archive.
## Requirements
### Requirement: Login bem-sucedido deve ser logado
O sistema SHALL registrar em log estruturado (JSON) todo login bem-sucedido, incluindo timestamp, email do usuário e IP de origem.

#### Scenario: Log de login bem-sucedido
- **GIVEN** um usuário com credenciais válidas
- **WHEN** o login é processado com sucesso
- **THEN** um evento `LOGIN_SUCCESS` é registrado no log
- **AND** o log contém `{ "evento": "LOGIN_SUCCESS", "email": "...", "ip": "...", "timestamp": "..." }`

### Requirement: Falha de login deve ser logada
O sistema SHALL registrar toda tentativa de login mal-sucedida, incluindo o email tentado e o IP de origem.

#### Scenario: Log de falha de login
- **GIVEN** um usuário com credenciais inválidas
- **WHEN** a tentativa de login falha
- **THEN** um evento `LOGIN_FAILURE` é registrado no log
- **AND** o log contém `{ "evento": "LOGIN_FAILURE", "email_tentado": "...", "ip": "...", "motivo": "...", "timestamp": "..." }`

### Requirement: Logout deve ser logado
O sistema SHALL registrar eventos de logout voluntário.

#### Scenario: Log de logout
- **GIVEN** um usuário autenticado
- **WHEN** o usuário realiza logout
- **THEN** um evento `LOGOUT` é registrado no log
- **AND** o log contém email do usuário e timestamp

### Requirement: Logs de segurança não devem conter dados sensíveis
O sistema SHALL garantir que logs de segurança nunca contenham senhas, tokens JWT ou dados pessoais sensíveis em texto puro.

#### Scenario: Senha não aparece em logs
- **GIVEN** uma tentativa de login com senha `"MinhaSenha123!"`
- **WHEN** a requisição é processada e logada
- **THEN** a senha não aparece em nenhum campo do log
- **AND** o campo `motivo` (se houver) não expõe a senha

