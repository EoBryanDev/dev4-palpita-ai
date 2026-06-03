## 1. Setup da Estrutura Raiz do Monorepo

- [ ] 1.1 Criar os arquivos de configuração na raiz: pnpm-workspace.yaml, package.json, turbo.json e biome.json.
- [ ] 1.2 Criar o pacote packages/tsconfig com as configurações globais do TypeScript.
- [ ] 1.3 Criar o arquivo docker-compose.yml na raiz configurado com o PostgreSQL 16 local.

## 2. Pacote Compartilhado de Domínio Core

- [ ] 2.1 Criar a estrutura do pacote packages/core (package.json, tsconfig.json e src/index.ts).
- [ ] 2.2 Implementar as entidades de domínio orientadas a objetos (Palpite, Usuario, Partida, TokenConvite) aplicando as regras RN01 (pontuação), RN02 (bloqueio por horário) e RN04 (expiração do link em 5 min).
- [ ] 2.3 Implementar testes de unidade com Vitest para validar as regras RN01, RN02 e RN04 no pacote core.

## 3. Pacote de Persistência com Drizzle

- [ ] 3.1 Criar a estrutura de packages/db (package.json, tsconfig.json, drizzle.config.ts e conexão).
- [ ] 3.2 Desenhar o esquema de tabelas no Drizzle utilizando português e nomenclatura neutra (tabelas: usuarios, partidas, palpites, rodadas, tokens_convite; campos: gols_time_a, gols_time_b).
- [ ] 3.3 Subir o banco PostgreSQL local via Docker Compose, gerar a migração inicial com Drizzle Kit e rodá-la.

## 4. Inicialização da Aplicação Web Next.js

- [ ] 4.1 Criar a pasta apps/web e inicializar o Next.js com App Router.
- [ ] 4.2 Configurar o Tailwind CSS e shadcn/ui em apps/web para suporte nativo a temas (Light/Dark).
- [ ] 4.3 Configurar o Biome e o Vitest no subprojeto apps/web.
- [ ] 4.4 Ligar as dependências locais de packages/core e packages/db em apps/web para importar os tipos e regras.
- [ ] 4.5 Criar uma versão esqueleto da rota pública `/home` (com Banner de Timeout e Toggle de Tema) e da rota `/validation-user/[id]` para validação de tokens.

## 5. Validação Final de Qualidade

- [ ] 5.1 Rodar a verificação de linting e formatação com Biome em todo o repositório (`biome check --apply .`).
- [ ] 5.2 Executar todos os testes de unidade via Turborepo para garantir que a cobertura está adequada e tudo compila.
