## 1. Autenticação e Middleware de Segurança

- [x] 1.1 Configurar o armazenamento de sessão e cookies (Server Actions de login, logout e sessão). (Status: DONE, Início: 20:24, Concluído: 20:33)
- [x] 1.2 Criar o arquivo `middleware.ts` na raiz da aplicação web (`apps/web/src/middleware.ts`) para proteger `/meu-espaço/*` e `/admin/*`. (Status: DONE, Início: 20:24, Concluído: 20:35)
- [x] 1.3 Implementar testes de unidade para validar os bloqueios e redirecionamentos do middleware. (Status: DONE, Início: 20:24, Concluído: 20:35)

## 2. Página Meu Espaço (Dashboard do Competidor)

- [x] 2.1 Criar a página `/meu-espaço` (RSC) exibindo o resumo do usuário (pontos acumulados e posição no ranking geral) obtido dinamicamente. (Status: DONE, Início: 20:41, Concluído: 20:44)
- [x] 2.2 Listar partidas da rodada com status de palpites pendentes, bloqueando após o horário de início da partida (RN02). (Status: DONE, Início: 20:41, Concluído: 20:44)
- [x] 2.3 Implementar o salvamento de palpites validando o prazo (RN02) e o status de liberação do usuário (RN05). (Status: DONE, Início: 20:41, Concluído: 20:44)
- [x] 2.4 Criar testes de componente para o Dashboard e formulário de palpites. (Status: DONE, Início: 20:41, Concluído: 20:44)

## 3. Painel Administrativo de Convites e Usuários (/admin/usuarios)

- [x] 3.1 Criar a interface de administração `/admin/usuarios` listando usuários pendentes e liberados. (Status: DONE, Início: 13:01, Concluído: 13:04)
- [x] 3.2 Implementar Server Actions para aprovação de solicitações, geração de tokens temporários (RN04) e ativação. (Status: DONE, Início: 13:01, Concluído: 13:04)
- [x] 3.3 Adicionar controle de liberação de apostas ("Liberado" / "Pendente") conforme RN05. (Status: DONE, Início: 13:01, Concluído: 13:04)
- [x] 3.4 Escrever testes de integração para o fluxo de aprovação e ativação de convites. (Status: DONE, Início: 13:01, Concluído: 13:04)

## 4. Painel de Cadastro de Jogos e Resultados (/admin/partidas)

- [x] 4.1 Criar a tela `/admin/partidas` para visualização e cadastro de novos jogos e rodadas de palpites. (Status: DONE, Início: 13:21, Concluído: 13:25)
- [x] 4.2 Desenvolver a funcionalidade de lançamento de placar final oficial das partidas. (Status: DONE, Início: 13:21, Concluído: 13:25)
- [x] 4.3 Implementar transação segura no banco de dados para salvar resultados oficiais, executar recálculo dinâmico de palpites (RN01) e atualizar ranking corporativo. (Status: DONE, Início: 13:21, Concluído: 13:25)
- [x] 4.4 Escrever testes cobrindo a transação de recálculo de pontos pós-jogo e atualização geral de ranking. (Status: DONE, Início: 13:21, Concluído: 13:25)

## 5. Validação e Qualidade

- [x] 5.1 Rodar a verificação de linting e formatação com Biome em todo o repositório (`biome check --write .`). (Status: DONE, Início: 13:30, Concluído: 13:30)
- [x] 5.2 Executar todos os testes de unidade da aplicação web para garantir que a cobertura está adequada e tudo compila com sucesso. (Status: DONE, Início: 13:30, Concluído: 13:31)

