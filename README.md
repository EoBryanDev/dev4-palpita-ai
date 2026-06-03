# 🏆 Bolão Copa 2026 (DEV4-Palpita-AI)

O **Bolão Copa 2026** é um Web App Responsivo focado em dispositivos móveis (Mobile-First) projetado para promover o engajamento e a integração entre colaboradores de uma empresa durante a Copa do Mundo de 2026. A plataforma permite que visitantes solicitem convites, registrem palpites sobre as partidas após aprovação, acompanhem o ranking atualizado em tempo real e visualizem estatísticas coletivas de palpites.

---

## 🚀 Arquitetura & Stack Tecnológica

O projeto é estruturado em um **Monorepo** utilizando as seguintes tecnologias de ponta:

1. **Gerenciamento de Monorepo:** [Turborepo](https://turbo.build/) + [pnpm Workspace](https://pnpm.io/)
2. **Frontend & API:** [Next.js](https://nextjs.org/) (App Router) + Server Actions + React Server Components (RSC)
3. **Design & Interface:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
4. **Gerenciamento de Estado:**
   - **Estado do Servidor (Cache & Sincronização):** [React Query (TanStack Query)](https://tanstack.com/query/latest)
   - **Estado do Cliente (UI Global):** [Zustand](https://zustand-demo.pmnd.rs/)
5. **Formulários e Validação:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
6. **Persistência de Dados & ORM:** [Drizzle ORM](https://orm.drizzle.team/)
   - **Local:** PostgreSQL rodando via Docker
   - **Produção:** Neon Serverless PostgreSQL
7. **Qualidade de Código & Testes:**
   - **Linting & Formatação:** [Biome](https://biomejs.dev/) (Rápido, unificado, limite de 80 caracteres)
   - **Testes Unitários/Integração:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 🛠️ Configuração e Instalação Local

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker & Docker Compose** (para o banco de dados PostgreSQL local)

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd dev4-palpita-ai
   ```

2. **Instalar Dependências:**
   ```bash
   pnpm install
   ```

3. **Subir o Banco de Dados Local:**
   Certifique-se de que o Docker está rodando e execute:
   ```bash
   docker compose up -d
   ```
   Isso subirá uma instância do PostgreSQL 16 configurada no arquivo `docker-compose.yml`.

4. **Configurar as Variáveis de Ambiente:**
   Configure a string de conexão do banco de dados no seu ambiente local (conforme especificado no arquivo `.env` do `apps/web` ou de infraestrutura):
   ```env
   DATABASE_URL="postgres://palpita:palpita_password@localhost:5432/palpita_db"
   ```

5. **Sincronizar o Banco de Dados (Drizzle):**
   Execute o push do schema estruturado diretamente para o banco local:
   ```bash
   pnpm --filter @palpita/db db:push
   ```

6. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   pnpm dev
   ```
   O app estará acessível em `http://localhost:3000`.

---

## 🧪 Qualidade de Código & Scripts Disponíveis

Na raiz do repositório, você pode rodar os seguintes comandos globais gerenciados pelo Turborepo:

- **Desenvolvimento:** `pnpm dev` - Executa o ambiente local.
- **Build de Produção:** `pnpm build` - Compila e valida o projeto completo.
- **Testes Unitários:** `pnpm test` - Executa a suíte de testes com o Vitest.
- **Linter (Biome):** `pnpm lint` - Verifica regras de estilo e problemas de código estático.
- **Formatador (Biome):** `pnpm format` - Corrige automaticamente a formatação do código.

---

## 🛠️ Contribuindo com Novas Features usando OpenSpec

Para garantir a qualidade, rastreabilidade e desenvolvimento organizado, utilizamos o fluxo **OpenSpec** (desenvolvimento orientado a especificações e tarefas).

### 1. Criando/Propondo uma Nova Feature

Antes de codificar, crie uma proposta de mudança (`change`) utilizando o CLI do `openspec`:

```bash
openspec new change "nome-da-feature"
```
*(Use sempre nomes em kebab-case, ex.: `add-user-auth`)*

Isso criará um diretório em `openspec/changes/nome-da-feature/` contendo os seguintes arquivos:
- `proposal.md`: Explicação em alto nível sobre o "o quê" e o "porquê".
- `design.md`: Detalhamento técnico da arquitetura, estrutura de dados e decisões.
- `tasks.md`: Lista detalhada e sequencial de tarefas atômicas para a implementação.

### 2. Fluxo de Trabalho Durante a Implementação

Ao iniciar a implementação de uma mudança:

1. **Verificar Status:** Verifique o status e os pré-requisitos:
   ```bash
   openspec status --change "nome-da-feature"
   ```
2. **Ordem de Execução:** Execute as tarefas listadas no arquivo `tasks.md` rigorosamente na ordem sequencial.
3. **Ciclo de Vida de uma Tarefa:** Para cada tarefa:
   - Crie uma branch de vida curta seguindo a regra `tipo/descricao-curta` (ex.: `feat/ranking-dynamic`).
   - Marque a tarefa como `"IN_PROGRESS"` e adicione o horário de início em `tasks.md`.
   - Implemente o código respeitando as regras em `docs/rules/coding.md`.
   - **Implemente testes de cobertura**: Todo desenvolvimento de funcionalidade ou correção deve ser acompanhado de testes de comportamento automatizados no Vitest utilizando o padrão AAA (Arrange, Act, Assert).
   - **Garantias antes de finalizar**:
     - Execute o linter: `pnpm lint`.
     - Execute todos os testes e garanta que passem: `pnpm test`.
   - Faça commits **atômicos** usando a padronização do [Conventional Commits](https://www.conventionalcommits.org/).
   - Marque a tarefa como concluída (`- [x]`) no arquivo `tasks.md` antes de prosseguir.
4. **Finalizando a Mudança:**
   Após a conclusão de todas as tarefas de desenvolvimento e aprovação do Pull Request, arquive a mudança executando:
   ```bash
   openspec archive --change "nome-da-feature"
   ```

---

## 📚 Documentos de Referência

Consulte os seguintes arquivos para mais detalhes e regras do projeto:
- [AGENTS.md](AGENTS.md) - Regras de execução específicas para Agentes de IA.
- [PRD do Bolão](docs/prds/PRD_001_Plataforma_Palpites_DEV4.md) - Requisitos funcionais, regras de negócio e regras de pontuação (RN01, RN02, etc.).
- [ADR de Arquitetura](docs/adr/fullstack-ADR.md) - Detalhamento da infraestrutura técnica e stack de bibliotecas adotada.
- **Regras do Projeto (`docs/rules/`):**
  - [Convenções de Código](docs/rules/coding.md)
  - [Linting e Formatação com Biome](docs/rules/linting.md)
  - [Convenções de Testes com Vitest](docs/rules/testing.md)
  - [Versionamento e Git Flow](docs/rules/versioning.md)
