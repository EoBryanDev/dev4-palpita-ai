# persistencia-db Specification

## Purpose
TBD - created by archiving change inicializar-monorepo. Update Purpose after archive.
## Requirements
### Requirement: Banco de Dados Local via Docker Compose
O sistema MUST fornecer um banco de dados PostgreSQL configurado em um contêiner Docker para isolar os dados locais de desenvolvimento.

#### Scenario: Inicialização do contêiner
- **WHEN** o comando `docker compose up -d` é executado na raiz do projeto
- **THEN** o contêiner do PostgreSQL local é executado e fica pronto para receber conexões na porta padrão 5432.

### Requirement: Persistência com Drizzle ORM e Termos da Copa
O esquema do banco de dados gerido pelo Drizzle ORM MUST conter as tabelas de usuários, tokens de convite, partidas, rodadas e palpites, utilizando a nomenclatura de Time A e Time B em português.

#### Scenario: Geração e execução de migrações
- **WHEN** o comando de migração do Drizzle é executado
- **THEN** as tabelas correspondentes às entidades são criadas no banco de dados com seus respectivos relacionamentos e chaves primárias/estrangeiras.

