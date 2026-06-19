## ADDED Requirements

### Requirement: Middleware de sessão com Next.js
O sistema SHALL implementar um middleware Next.js (`src/middleware.ts`) que proteja rotas autenticadas, verificando a sessão JWT e redirecionando para `/login` se inválida.

#### Scenario: Acesso a rota protegida sem sessão
- **GIVEN** um usuário não autenticado
- **WHEN** o usuário tenta acessar `/dashboard`
- **THEN** o middleware redireciona para `/login`
- **AND** a rota original é preservada como query param `?redirect=/dashboard`

#### Scenario: Acesso a rota protegida com sessão válida
- **GIVEN** um usuário autenticado com sessão JWT válida
- **WHEN** o usuário tenta acessar `/dashboard`
- **THEN** o middleware permite o acesso

### Requirement: Experiência de login segura e amigável
O sistema SHALL fornecer feedback visual claro durante falhas de autenticação e expiração de sessão, com mensagens em português.

#### Scenario: Sessão expirada durante uso
- **GIVEN** um usuário autenticado cuja sessão expirou
- **WHEN** o usuário tenta realizar uma ação que requer autenticação
- **THEN** o sistema exibe um toast/modal "Sua sessão expirou. Faça login novamente."
- **AND** redireciona para a página de login

#### Scenario: Erro de login com mensagem clara
- **GIVEN** um usuário na página de login
- **WHEN** o login falha (credenciais inválidas)
- **THEN** o sistema exibe a mensagem "Email ou senha inválidos"
- **AND** a senha no formulário é limpa
