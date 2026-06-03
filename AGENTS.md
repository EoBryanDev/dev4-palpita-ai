# Instruções de Execução do Agente

Este documento define as regras de operação, consulta de documentação e fluxo de trabalho que devem ser seguidas durante o desenvolvimento.

## 1. Consulta e Diretrizes do Projeto

- **Código:** Todo o desenvolvimento de código deve ser baseado rigorosamente no arquivo `docs/rules/coding.md`.
- **Dúvidas Gerais:** Consulte o diretório `docs/` para diretrizes gerais do projeto.
- **Regras Específicas:** Consulte o diretório `docs/rules/` para regras detalhadas (como `linting.md`, `testing.md` e `versioning.md`).
- **Arquitetura e Design:** Siga sempre as decisões de design e arquitetura estipuladas nos documentos de proposta ou requisitos (ex.: `docs/prds/PRD_001_Plataforma_Palpites_DEV4.md` e eventuais arquivos `design.md` ou `proposal.md`).

## 2. Fluxo de Trabalho de Tarefas

Ao trabalhar no arquivo de controle de tarefas (`openspec/changes/name-of-change/tasks.md`), cumpra o seguinte ciclo de vida:

- **Ordem de Execução:** Sempre tente realizar as tarefas na ordem em que estão listadas.
- **Ao Iniciar uma Tarefa:**
    1. Crie uma nova branch seguindo as regras definidas em `docs/rules/versioning.md`.
    2. Atualize o status da tarefa para `"IN_PROGRESS"`.
    3. Atualize o horário de início da tarefa.
- **Antes de Concluir uma Tarefa:**
    1. Execute o linter para garantir que o código está formatado corretamente e segue as regras de linting. Consulte `docs/rules/linting.md` para mais informações.
    2. Verifique se todos os testes estão passando. Consulte `docs/rules/testing.md` para mais informações.
    3. Crie um novo commit seguindo as regras de padronização do `docs/rules/versioning.md`.
    4. Marque a tarefa como concluída (Done).

## 3. Utilização de Habilidades (Skills)

- Sempre que estiver trabalhando em alguma alteração, verifique se existem habilidades (skills) úteis no diretório `~/.gemini/antigravity/skills` que possam ajudar a resolver a tarefa de forma mais eficiente.