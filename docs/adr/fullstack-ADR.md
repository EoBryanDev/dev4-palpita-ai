# ADR 001: Arquitetura Fullstack e Definição da Stack Tecnológica

- **Versão:** 1.0.0
- **Status:** Accepted
- **Data:** 2026-06-03
- **Criado por:** Bryan

## Contexto

O projeto "Bolão Copa 2026" visa desenvolver um Web App Responsivo focado em
dispositivos móveis (Mobile-First) para promover o engajamento e a integração
entre colaboradores de uma empresa durante a Copa do Mundo de 2026. A plataforma
deve permitir que visitantes solicitem convites, registrem palpites sobre os
jogos após aprovação do administrador, visualizem rankings atualizados de forma
dinâmica e acompanhem análises agregadas de palpites de forma transparente.

Para atender aos requisitos de performance (carregamento do ranking em menos de
2 segundos), segurança das rotas administrativas, e regras de negócio
específicas (como expiração de convites de 5 minutos, bloqueio automático de
palpites no início da partida e liberação manual de apostas pelo administrador),
é necessária uma arquitetura robusta, eficiente e de baixo custo operacional.
A solução estruturada em **Monorepo** visa otimizar a organização do código e o
compartilhamento de tipagem entre pacotes de infraestrutura e aplicação.

## Decisão

Optou-se por utilizar as seguintes tecnologias e decisões arquiteturais para
suportar o ciclo de vida do projeto:

1. **Gerenciamento de Monorepo e Pacotes:**
   Utilizaremos o **Turborepo** em conjunto com o gerenciador de pacotes
   **pnpm**. Essa escolha permite orquestrar múltiplos pacotes com facilidade,
   otimizar tarefas de compilação/teste com cache inteligente e gerenciar as
   dependências com alta velocidade e eficiência de disco.

2. **Framework Web (Front-end e API):**
   Adotaremos o **Next.js** com a estrutura de **App Router**. A renderização
   inicial de páginas críticas de alta leitura (como `/ranking`) será otimizada
   no servidor utilizando React Server Components (RSC). As mutações e ações do
   sistema serão geridas por **Server Actions**, permitindo interações seguras,
   sem a necessidade de construir APIs REST tradicionais e garantindo tipagem
   estática unificada.

3. **Design e Interface de Usuário:**
   Utilizaremos o **Tailwind CSS** e componentes da **shadcn/ui** para construir
   uma interface altamente responsiva e esteticamente premium, suportando de
   forma nativa temas claros (Light Theme) e escuros (Dark Theme).

4. **Gerenciamento de Estado:**
   - **Estado do Servidor (Fetch e Cache):** Usaremos o **React Query**
     (TanStack Query) para lidar com o cache, sincronização e revalidação de
     dados em tempo real no cliente (ex.: atualização rápida do ranking após
     inserção de resultados).
   - **Estado do Cliente:** Usaremos o **Zustand** para controle global leve de
     estados puramente de UI (ex.: alternador de temas, visibilidade de menus
     laterais e estados de modais).

5. **Gerenciamento de Formulários e Validação:**
   Utilizaremos o **React Hook Form** integrado ao **Zod**. O Zod será a única
   fonte de verdade para validação de esquemas (schemas), sendo compartilhado no
   lado do cliente (para validação imediata em formulários) e no servidor
   (validação e sanitização nas Server Actions).

6. **Persistência de Dados e ORM:**
   Adotaremos o **Drizzle ORM** por ser leve, performático e oferecer tipagem
   estática robusta.
   - **Ambiente de Desenvolvimento:** Utilizaremos o **PostgreSQL** rodando em um
     container Docker configurado via **docker-compose.yml**, isolando os dados
     locais e unificando o ambiente dos desenvolvedores.
   - **Ambiente de Produção:** Utilizaremos o **Neon Serverless PostgreSQL**,
     aproveitando sua infraestrutura gerenciada, escalabilidade sob demanda e
     tier gratuito generoso para evitar custos operacionais e sobrecarga no VPS.

7. **Qualidade de Código e Testes:**
   - **Linting e Formatação:** Utilizaremos o **Biome** configurado com
     indentação de 2 espaços e limite de 80 caracteres. Ele unifica o linter e o
     formatter em uma única ferramenta extremamente rápida.
   - **Testes:** Utilizaremos o **Vitest** com **React Testing Library** para
     testes unitários e de integração de componentes de UI. Lógicas de negócio
     críticas (ex.: cálculo de pontuação da RN01 e regras de expiração) serão
     testadas prioritariamente, visando 100% de cobertura.

## Consequências

- **Performance e Tempo de Resposta:** O caching inteligente do React Query com
  renderização híbrida no Next.js garante tempos de resposta inferiores a 2
  segundos nas rotas públicas essenciais.
- **Tipagem de Ponta a Ponta:** A integração de TypeScript, Drizzle ORM e Zod
  minimiza bugs em produção, garantindo que qualquer mudança estrutural no banco
  seja refletida imediatamente até o nível de validação de formulários.
- **Consistência no Desenvolvimento:** A conteinerização do PostgreSQL via Docker
  Compose assegura que todos os desenvolvedores compartilhem um banco de dados
  idêntico, eliminando problemas de configuração de ambiente ("funciona na minha
  máquina").
- **Paridade entre Ambientes:** Utilizar PostgreSQL tanto no desenvolvimento
  local quanto em produção elimina disparidades de dialeto SQL e discrepâncias de
  comportamento de ORM, reduzindo a complexidade na manutenção de migrações.
- **Mutações Simplificadas:** O uso de Server Actions do Next.js reduz a escrita
  de código repetitivo (boilerplate) para comunicação assíncrona, além de manter
  regras de negócio críticas no servidor (evitando manipulações maliciosas).
- **Cobertura de Código Crítico:** A separação de responsabilidades assegura que
  as lógicas complexas (como a RN01 de pontuação e RN02 de bloqueio de palpites)
  possam ser isoladas em serviços puros para testes rápidos com o Vitest.
