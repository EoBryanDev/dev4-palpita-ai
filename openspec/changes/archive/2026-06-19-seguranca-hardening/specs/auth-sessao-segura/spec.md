## Purpose

Garantir que a sessão do usuário seja segura contra falsificação e adulteração. Substitui o cookie `btoa()`/`atob()` sem assinatura por JWT assinado com HS256, adiciona validação da sessão contra o banco de dados e configura corretamente os atributos de segurança do cookie.

## ADDED Requirements

### Requirement: Sessão deve utilizar JWT assinado com HS256
O sistema SHALL substituir o cookie `palpita_session` codificado como `btoa()` de JSON por um JWT assinado com algoritmo HS256.

#### Scenario: Cookie JWT após login bem-sucedido
- **GIVEN** um usuário com credenciais válidas
- **WHEN** o login é processado com sucesso
- **THEN** o sistema cria um JWT com payload `{ sub, cargo, iat, exp }` e o armazena no cookie `palpita_session`
- **AND** o JWT é assinado com segredo HS256
- **AND** o cookie não contém dados sensíveis como email, nome ou senha

#### Scenario: Cookie adulterado é rejeitado
- **GIVEN** um cookie `palpita_session` com payload adulterado (ex: `cargo` alterado de `USER` para `ADMIN`)
- **WHEN** o sistema processa uma requisição com este cookie
- **THEN** a verificação da assinatura falha
- **AND** a requisição é tratada como não autenticada

### Requirement: Cookie deve ter atributos de segurança obrigatórios
O sistema SHALL configurar o cookie `palpita_session` com `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (em produção) e `maxAge` de 7 dias.

#### Scenario: Cookie com atributos corretos
- **GIVEN** um usuário que realizou login
- **WHEN** o cookie `palpita_session` é emitido
- **THEN** o cookie possui os atributos `httpOnly`, `SameSite=Lax` e `Secure` (em produção)
- **AND** o cookie expira em 7 dias (`maxAge: 604800`)

### Requirement: Sessão deve ser validada contra o banco de dados
O sistema SHALL, além de verificar a assinatura JWT, consultar o banco de dados para confirmar que o usuário existe e está com status `ATIVO`.

#### Scenario: Sessão válida — usuário ativo
- **GIVEN** um usuário autenticado com status `ATIVO`
- **WHEN** o sistema valida a sessão
- **THEN** a consulta ao banco retorna o usuário ativo
- **AND** a sessão é considerada válida

#### Scenario: Sessão inválida — usuário inativo
- **GIVEN** um usuário com cookie JWT válido mas status `INATIVO` no banco
- **WHEN** o sistema valida a sessão
- **THEN** a consulta ao banco retorna que o usuário está inativo
- **AND** a sessão é invalidada
- **AND** o cookie é removido

### Requirement: JWT_SECRET deve ser configurável por variável de ambiente
O sistema SHALL ler o segredo JWT da variável de ambiente `JWT_SECRET`. Se ausente, o sistema SHALL gerar um erro em tempo de inicialização (não deve usar fallback hardcoded).

#### Scenario: JWT_SECRET ausente
- **GIVEN** que `JWT_SECRET` não está definida no ambiente
- **WHEN** o sistema tenta inicializar o módulo de sessão
- **THEN** um erro é lançado informando que `JWT_SECRET` é obrigatória

### Requirement: Chave JWT deve ter tamanho mínimo seguro
O sistema SHALL exigir que `JWT_SECRET` tenha no mínimo 32 caracteres para garantir segurança do HS256.

#### Scenario: JWT_SECRET muito curta
- **GIVEN** que `JWT_SECRET` tem menos de 32 caracteres
- **WHEN** o sistema inicializa o módulo de sessão
- **THEN** um erro é lançado informando o tamanho mínimo
