## Purpose

Prevenir ataques de injeção e dados malformados através de validação rigorosa de todas as entradas do usuário, utilizando esquemas Zod no backend e sanitização no frontend.

## ADDED Requirements

### Requirement: Toda entrada de usuário deve ser validada com Zod
O sistema SHALL validar todas as entradas de API (body, query params, path params) utilizando schemas Zod, rejeitando dados que não correspondam ao schema esperado.

#### Scenario: Entrada válida é aceita
- **GIVEN** um schema Zod que espera `{ email: string, senha: string }`
- **WHEN** o usuário envia `{ "email": "user@example.com", "senha": "MinhaSenha123!" }`
- **THEN** a validação passa
- **AND** a requisição prossegue

#### Scenario: Entrada inválida é rejeitada
- **GIVEN** um schema Zod que espera `{ email: string, senha: string }`
- **WHEN** o usuário envia `{ "email": "invalido", "senha": "" }`
- **THEN** a validação falha
- **AND** o sistema retorna erro 400 com detalhes dos campos inválidos

### Requirement: Sanitização de XSS no frontend
O sistema SHALL sanitizar qualquer dado renderizado que venha de entrada do usuário, prevenindo execução de scripts maliciosos.

#### Scenario: Sanitização de conteúdo textual
- **GIVEN** um palpite com texto `"<script>alert('xss')</script>"`
- **WHEN** o componente renderiza este texto
- **THEN** o texto é exibido como string literal
- **AND** o script não é executado
