## Why

O administrador atualmente não tem um painel central de visão geral (dashboard) sobre o status dos envios de palpites e cadastros de usuários. Além disso, o cadastro de partidas utiliza nomes de equipes como texto livre (strings), o que gera inconsistências de escrita e dificulta o vínculo real com dados adicionais dos times (como emojis, bandeiras ou confederações). A API de estatísticas de palpites possui um bug que ignora usuários liberados, e o projeto carece de um arquivo padrão de ambiente (.env-example) e de uma esteira de integração contínua (CI) para garantir a saúde do repositório a cada alteração, bem como uma cobertura robusta de testes E2E e de integração.

## What Changes

- **Dashboard Admin**: Nova página `/admin` contendo indicadores de cadastros de usuários e progresso de envios de palpites.
- **Estrutura de Times (Banco de Dados)**: Criação da tabela `times` no banco e atualização de `partidas` para referenciar chaves estrangeiras `timeAId` e `timeBId` em vez de strings livres.
- **Gerenciamento de Times**: Ajustes nas interfaces de cadastro e manipulação de jogos/partidas para utilizar os times cadastrados no banco de dados.
- **Correção da API de Palpites**: Alteração em `/api/palpites` para trazer palpites de usuários que estejam tanto em status `ATIVO` quanto `LIBERADO`.
- **Configuração de Ambiente**: Criação do arquivo `.env-example` na raiz do projeto.
- **Pipeline de CI**: Criação de um workflow do GitHub Actions (.github/workflows/ci.yml) rodando linting (Biome), testes unitários e de integração (Vitest) e build.
- **Cobertura de Testes**: Implementação de testes de integração e ponta a ponta (E2E) cobrindo os fluxos modificados e principais jornadas do usuário e do administrador.

## Capabilities

### New Capabilities
- `times-management`: Cadastro, armazenamento e listagem estruturada de equipes de futebol (times) no sistema.
- `admin-dashboard`: Tela inicial da administração contendo visão geral dos usuários cadastrados e estatísticas de submissão de palpites na rodada.
- `ci-pipeline`: Configuração de esteira automatizada de integração contínua no GitHub Actions.

### Modified Capabilities
- `area-admin-partidas`: Ajustar a criação de partidas no painel administrativo para referenciar as entidades de times em vez de strings livres.
- `area-privada-palpites`: Ajustar a exibição de partidas e salvamento de palpites no dashboard do competidor para renderizar os dados dinâmicos das equipes referenciadas.
- `area-publica-dados`: Atualizar a API de analytics coletivos e individuais de palpites para contemplar usuários com status `LIBERADO` e usar os relacionamentos de times.

## Impact

- **Banco de Dados**: Migração de schema em `@palpita/db` para criar a tabela `times` e alterar as chaves de `partidas`.
- **Interfaces Administrativas**: Telas de cadastro e listagem em `/admin/partidas` agora usarão dropdowns com os times cadastrados no sistema.
- **Interfaces do Competidor**: Exibição de nomes e emojis das equipes no dashboard `/meu-espaco`, `/agenda`, `/home` e `/ranking` agora resolverá os dados a partir do relacionamento com a tabela de times.
- **APIs e Actions**: Server Actions de criação de partida, salvamento de palpites e lançamento de placar precisarão ser atualizadas para validar chaves de times válidos.
- **Infraestrutura**: Novo arquivo `.github/workflows/ci.yml` e arquivo `.env-example` na raiz.
