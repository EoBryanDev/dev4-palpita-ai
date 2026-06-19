## Purpose

Mitigar ataques comuns de segurança (XSS, clickjacking, MIME sniffing, MITM) através da configuração de headers HTTP de segurança na aplicação Next.js.

## ADDED Requirements

### Requirement: Aplicação deve enviar headers de segurança obrigatórios
O sistema SHALL configurar os seguintes headers de segurança em todas as respostas HTTP: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e `Strict-Transport-Security` (em produção).

#### Scenario: Headers de segurança presentes na resposta
- **GIVEN** um usuário acessando qualquer página da aplicação
- **WHEN** o servidor envia a resposta HTTP
- **THEN** os headers de segurança estão presentes
- **AND** cada header possui o valor correto

#### Scenario: CSP bloqueia script inline malicioso
- **GIVEN** uma página com um script inline não autorizado
- **WHEN** o navegador tenta executar o script
- **THEN** a política CSP bloqueia a execução

### Requirement: CSP deve ser restritiva sem quebrar funcionalidades existentes
O sistema SHALL configurar uma política CSP que restrinja fontes de script, estilo e conexão, mas permita o funcionamento correto dos recursos existentes (Next.js, React Query, imagens externas se houver).

#### Scenario: CSP permite recursos legítimos
- **GIVEN** um usuário acessando a aplicação
- **WHEN** o navegador carrega scripts e estilos legítimos da aplicação
- **THEN** o CSP permite o carregamento
- **AND** nenhum recurso legítimo é bloqueado
