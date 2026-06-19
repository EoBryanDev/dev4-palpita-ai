# csrf-protecao Specification

## Purpose
TBD - created by archiving change seguranca-hardening. Update Purpose after archive.
## Requirements
### Requirement: Endpoints de mutação devem exigir token CSRF
O sistema SHALL exigir um token CSRF válido em toda requisição mutante (POST, PUT, DELETE) que utilize autenticação por cookie.

#### Scenario: Requisição com token CSRF ausente
- **GIVEN** um usuário autenticado
- **WHEN** o usuário envia uma requisição POST sem token CSRF
- **THEN** o sistema retorna erro 403 (Forbidden)
- **AND** a operação não é executada

#### Scenario: Requisição com token CSRF inválido
- **GIVEN** um usuário autenticado
- **WHEN** o usuário envia uma requisição POST com token CSRF inválido/expirado
- **THEN** o sistema retorna erro 403 (Forbidden)
- **AND** a operação não é executada

#### Scenario: Requisição com token CSRF válido
- **GIVEN** um usuário autenticado
- **WHEN** o usuário envia uma requisição POST com token CSRF válido
- **THEN** o sistema processa a requisição normalmente

### Requirement: Token CSRF deve utilizar double-submit cookie pattern
O sistema SHALL implementar proteção CSRF via double-submit cookie pattern: o token é enviado em um cookie não httpOnly e também no corpo/header da requisição; o servidor compara ambos.

#### Scenario: Double-submit cookie com valores iguais
- **GIVEN** um usuário com um cookie CSRF e o mesmo valor enviado no header `X-CSRF-Token`
- **WHEN** o sistema valida a requisição POST
- **THEN** a requisição é considerada válida

#### Scenario: Double-submit cookie com valores diferentes
- **GIVEN** um usuário com um cookie CSRF mas valor diferente enviado no header `X-CSRF-Token`
- **WHEN** o sistema valida a requisição POST
- **THEN** a requisição é rejeitada com 403

### Requirement: Token CSRF deve ser gerado por endpoint dedicado
O sistema SHALL expor um endpoint `GET /api/csrf` que retorna um token CSRF único e o define no cookie.

#### Scenario: Geração de token CSRF
- **GIVEN** um usuário autenticado
- **WHEN** o usuário acessa `GET /api/csrf`
- **THEN** o sistema retorna um token CSRF único
- **AND** o token é armazenado em cookie não httpOnly

