## Purpose

Garantir que senhas e dados sensíveis dos usuários sejam armazenados e trafegados de forma segura, utilizando hashing forte para senhas e protegendo dados em trânsito.

## ADDED Requirements

### Requirement: Senhas devem ser armazenadas com bcrypt
O sistema SHALL armazenar senhas utilizando bcrypt com fator de custo (salt rounds) mínimo de 12.

#### Scenario: Cadastro de usuário com senha
- **GIVEN** um novo usuário com senha `"MinhaSenha123!"`
- **WHEN** o sistema armazena o usuário
- **THEN** a senha é armazenada como hash bcrypt
- **AND** o hash começa com `$2b$12$` (fator de custo 12)
- **AND** a senha original não é armazenada em texto puro

#### Scenario: Verificação de senha correta
- **GIVEN** um usuário cadastrado com hash bcrypt
- **WHEN** o usuário fornece a senha correta no login
- **THEN** o bcrypt verifica o hash com sucesso
- **AND** o login é autorizado

#### Scenario: Verificação de senha incorreta
- **GIVEN** um usuário cadastrado com hash bcrypt
- **WHEN** o usuário fornece uma senha incorreta no login
- **THEN** o bcrypt rejeita a verificação
- **AND** o login é negado

### Requirement: Hash bcrypt deve ter custo mínimo 12
O sistema SHALL permitir configurar o fator de custo via variável de ambiente `BCRYPT_SALT_ROUNDS` com valor padrão 12.

#### Scenario: Custo configurado via ambiente
- **GIVEN** que `BCRYPT_SALT_ROUNDS=10` está definido
- **WHEN** o sistema gera um hash de senha
- **THEN** o hash usa fator de custo 10
