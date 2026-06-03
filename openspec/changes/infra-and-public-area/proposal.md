## Why

O projeto "Bolão Copa 2026" precisa configurar as bases de gerenciamento de estado cliente/servidor (Zustand e TanStack Query) conforme acordado no ADR 001, bem como implementar a primeira fase de valor da plataforma que compreende a navegação e visualização de dados públicos (regras de pontuação, calendário, classificação, estatísticas globais e login de acesso) e o fluxo de solicitação e validação de convites de novos usuários.

## What Changes

- **Infraestrutura & Dependências**: Adição de `@tanstack/react-query` e `zustand` no pacote `@palpita/web` (`apps/web`).
- **Linter & Biome**: Ajuste na configuração global `biome.json` para ignorar as pastas de compilação e cache `.turbo` e `node_modules`.
- **Área Pública (Páginas e Rotas)**:
  - `/home` (ou `/`): Hero theme, banner de timeout regressivo para palpites, CTA "Peça seu convite", formulário de solicitação de interesse (pedir convite), regras de pontuação (RN01), partidas ao vivo e lista de próximos jogos.
  - `/agenda`: Calendário de partidas por dia.
  - `/times`: Visualização interativa das seleções participantes da Copa 2026.
  - `/chaves`: Organização e visualização dos grupos e chaveamento do mata-mata.
  - `/ranking`: Classificação de pontos em tempo real atualizada via React Query/RSC.
  - `/palpites`: Analytics agregados e exibição restrita de palpites individuais antes do início do jogo (RN03).
  - `/login`: Tela premium de autenticação de usuários e admin.
- **Validação de Convites**:
  - Rota `/validation-user/[id]`: Refatoração do fluxo transacional no banco para ativação do usuário após a definição de senha segura, validando a expiração do link em 5 minutos (RN04).

## Capabilities

### New Capabilities
- `infra-web`: Configuração de gerenciamento de estado (TanStack Query, Zustand) e ajustes de linter (Biome).
- `area-publica-navegacao`: Páginas `/home`, `/agenda`, `/times`, `/chaves` e `/login` com layout premium responsivo, toggle de tema e botão de voltar ao topo.
- `area-publica-dados`: Exibição do ranking em tempo real (RSC + React Query) e analytics global com visualização condicionada de palpites individuais (RN03).
- `validacao-convites`: Fluxo de solicitação de interesse (na home) e rota `/validation-user/[id]` com verificação rigorosa de token expirado (RN04).

### Modified Capabilities
- `estrutura-monorepo`: Ajuste na configuração global do Biome para ignorar pastas de cache (`.turbo`) no linting.

## Impact

- **Dependências**: Adição de `@tanstack/react-query`, `zustand` e `@tanstack/react-query-devtools` em `apps/web/package.json`.
- **Configurações**: Modificação de `biome.json` na raiz do monorepo.
- **Frontend (`apps/web`)**: Criação de rotas `/agenda`, `/times`, `/chaves`, `/ranking`, `/palpites`, `/login` e reestruturação de `/home` e `/validation-user/[id]`.
- **Ações e Serviços**: Criação de Server Actions para solicitar convites e validar/cadastrar senha.
