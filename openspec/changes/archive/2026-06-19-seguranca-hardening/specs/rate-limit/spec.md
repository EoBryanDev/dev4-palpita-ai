## Purpose

Proteger a aplicação contra abuso de requisições, ataques de força bruta em endpoints de autenticação e sobrecarga acidental ou maliciosa do servidor.

## ADDED Requirements

### Requirement: Login deve ter limite de tentativas por IP
O sistema SHALL limitar tentativas de login a 5 por minuto por IP.

#### Scenario: Tentativas de login abaixo do limite
- **GIVEN** um IP que fez 3 tentativas de login nos últimos 60 segundos
- **WHEN** o IP tenta fazer login novamente
- **THEN** a requisição é processada normalmente

#### Scenario: Tentativas de login excedem o limite
- **GIVEN** um IP que fez 5 tentativas de login nos últimos 60 segundos
- **WHEN** o IP tenta fazer login novamente
- **THEN** o sistema retorna erro 429 (Too Many Requests)
- **AND** o header `Retry-After` informa o tempo restante

### Requirement: Endpoints gerais devem ter rate limit por IP
O sistema SHALL limitar requisições a endpoints de API a 100 requisições por minuto por IP.

#### Scenario: Requisições abaixo do limite geral
- **GIVEN** um IP que fez 50 requisições no último minuto
- **WHEN** o IP envia mais uma requisição
- **THEN** a requisição é processada normalmente

#### Scenario: Requisições excedem o limite geral
- **GIVEN** um IP que fez 100 requisições no último minuto
- **WHEN** o IP envia mais uma requisição
- **THEN** o sistema retorna erro 429 (Too Many Requests)

### Requirement: Limites devem ser configuráveis por variável de ambiente
O sistema SHALL permitir configurar os limites de rate limit via variáveis de ambiente `RATE_LIMIT_LOGIN_MAX` e `RATE_LIMIT_GENERAL_MAX`.

#### Scenario: Limites customizados
- **GIVEN** que `RATE_LIMIT_LOGIN_MAX=10` e `RATE_LIMIT_GENERAL_MAX=200` estão definidos
- **WHEN** o sistema inicializa o módulo de rate limit
- **THEN** os limites são aplicados conforme os valores configurados
