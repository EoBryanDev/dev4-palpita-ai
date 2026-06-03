# tasks - infra-and-public-area

## 1. Configuração e Infraestrutura

- [ ] 1.1 Configurar o `biome.json` na raiz para ignorar explicitamente as pastas `.turbo`, `.next` e `node_modules` no linter e formatação.
- [ ] 1.2 Instalar as dependências `@tanstack/react-query`, `zustand` e `bcryptjs` (e `@types/bcryptjs` como devDependency) no pacote `@palpita/web` (`apps/web`).
- [ ] 1.3 Criar e configurar o QueryClientProvider na raiz do Next.js (`apps/web/src/app/layout.tsx`).
- [ ] 1.4 Criar a store global do Zustand para UI (`useUiStore`) em `apps/web/src/lib/store/ui.ts` para gerenciar o tema claro/escuro.

## 2. Componentes e Estilos Globais

- [ ] 2.1 Configurar o alternador de temas claro/escuro com HSL nos estilos do app e integrá-lo no cabeçalho ou barra de navegação global.
- [ ] 2.2 Criar o botão flutuante de Voltar ao Topo que aparece após 300px de scroll vertical.
- [ ] 2.3 Criar o Banner de Timeout com cronômetro regressivo na raiz (exibindo tempo para bloqueio de palpites da rodada atual).

## 3. Validação de Convites (RN04)

- [ ] 3.1 Criar a Action de servidor ou endpoint para solicitação de convite a partir da Home, inserindo no banco com status pendente.
- [ ] 3.2 Implementar a validação robusta de convite temporário na rota `/validation-user/[id]` de modo que rejeite se criado há mais de 5 minutos (RN04).
- [ ] 3.3 Implementar a definição de senha com hashing usando `bcryptjs` e atualização do status do usuário ativado, com redirecionamento de sucesso para `/login`.
- [ ] 3.4 Escrever testes para cobrir a expiração do link e validação de senhas com Vitest.

## 4. Rotas Públicas de Visualização

- [ ] 4.1 Implementar a página `/home` reformulada: Hero temática, CTA e formulário de solicitação de convites, regras de pontuação (RN01) e listagem de partidas.
- [ ] 4.2 Criar a página `/agenda` mostrando partidas de futebol por dia selecionado.
- [ ] 4.3 Criar a página `/times` exibindo de forma interativa as seleções que disputam a Copa 2026.
- [ ] 4.4 Criar a página `/chaves` exibindo a estrutura de grupos e o chaveamento do mata-mata.
- [ ] 4.5 Criar a página `/login` com layout premium para entrada do usuário.

## 5. Exibição de Dados e Estatísticas (RN03)

- [ ] 5.1 Criar a página `/ranking` que exibe a classificação geral atualizada usando React Query para cache dinâmico.
- [ ] 5.2 Criar a rota `/palpites` que exibe estatísticas agregadas coletivas de cada jogo (vitórias do time A, vitória do time B, empates).
- [ ] 5.3 Implementar o controle rigoroso da regra RN03 na API/Actions: não retornar palpites individuais de usuários antes do início da partida.

## 6. Validação e Qualidade

- [ ] 6.1 Rodar a validação do linter (`pnpm lint`) e certificar-se de que não há falhas.
- [ ] 6.2 Executar os testes (`pnpm test`) garantindo que todos passem com sucesso.
