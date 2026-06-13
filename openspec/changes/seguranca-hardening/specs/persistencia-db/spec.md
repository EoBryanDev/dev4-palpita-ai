## ADDED Requirements

### Requirement: Esquema deve suportar hash de senha com bcrypt
O sistema SHALL armazenar senhas como hash bcrypt no campo `senha_hash` da tabela de usuários.

#### Scenario: Campo senha_hash na tabela de usuários
- **GIVEN** a tabela de usuários no banco de dados
- **WHEN** o schema é verificado
- **THEN** existe um campo `senha_hash` do tipo `text` ou `varchar`
- **AND** o campo original `senha` (texto puro) não existe mais

### Requirement: Esquema deve suportar status do usuário
O sistema SHALL adicionar um campo `status` à tabela de usuários com valores `'ATIVO'` e `'INATIVO'`, default `'ATIVO'`.

#### Scenario: Campo status na tabela de usuários
- **GIVEN** a tabela de usuários no banco de dados
- **WHEN** o schema é verificado
- **THEN** existe um campo `status` do tipo `varchar` ou `text`
- **AND** o valor default é `'ATIVO'`

### Requirement: Esquema deve suportar data de último login
O sistema SHALL adicionar um campo `ultimo_login_at` (timestamp) à tabela de usuários.

#### Scenario: Campo ultimo_login_at na tabela de usuários
- **GIVEN** a tabela de usuários no banco de dados
- **WHEN** o schema é verificado
- **THEN** existe um campo `ultimo_login_at` do tipo `timestamp`
- **AND** o campo é nullable (pode ser nulo para usuários que nunca logaram)
