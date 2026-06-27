# Versionamento e Git Flow

## Estratégia de Branching (Trunk-Based Development)

Adote o **Trunk-Based Development** para manter um ritmo rápido de entrega e evitar conflitos complexos de merge.

- **Branch Principal (`main`)**: A branch `main` é a fonte da verdade pronta para produção. Ela deve estar sempre estável.
- **Branches de Vida Curta**: Crie uma nova branch para cada funcionalidade ou correção. 
    - **Padrão de Nomenclatura**: `tipo/ENG-XXX-descricao-curta` onde `ENG-XXX` é o ID do Ticket do Linear (ex.: `feat/ENG-123-login-validation`, `fix/ENG-456-header-z-index`).
    - **Convenção de Nomenclatura**: Utilize **kebab-case** para os nomes das branches.
- **Merge Rápido**: Funcionalidades devem ser integradas à `main` assim que forem concluídas e testadas.

## Mensagens de Commit

Seguimos a especificação do [Conventional Commits](https://www.conventionalcommits.org/). 

### Regras:
- **Formatação (Casing)**: Utilize letras minúsculas (lowercase) para a descrição.
- **Integração com Linear**: Anexe o ID do Ticket do Linear no final da mensagem do commit (ex.: `feat(api): description ENG-XXX`).

### Formato:
`<tipo>(escopo): descricao ENG-XXX`

- **feat**: Uma nova funcionalidade para o usuário.
- **fix**: Uma correção de bug para o usuário.
- **docs**: Alterações na documentação.
- **style**: Formatação, ponto e vírgula faltando, etc.; sem alteração no código de produção.
- **refactor**: Refatoração do código de produção, ex.: renomear uma variável.
- **test**: Adição de testes ausentes, refatoração de testes; sem alteração no código de produção.
- **chore**: Atualização de tarefas de build etc.; sem alteração no código de produção.

*Exemplo: `feat(api): adicionando autenticação JWT ENG-123`*

## Commits Atômicos

Os commits devem ser **atômicos**. Um commit atômico é uma unidade única de trabalho que não pode ser dividida em partes menores com significado próprio.

- **Foco**: Um commit deve fazer apenas uma coisa. Não misture a implementação de uma funcionalidade com uma refatoração ou correção de CSS no mesmo commit.
- **Integridade**: O projeto deve continuar compilável e os testes devem passar após cada commit.
- **Reversibilidade**: Deve ser fácil reverter um commit específico sem afetar lógicas não relacionadas.

## Pull Requests (PRs)

- **Revisão**: Todo PR exige pelo menos uma aprovação antes de ser feito o merge na `main`.
- **PRs Pequenos**: Se uma funcionalidade for muito grande, divida-a em PRs menores e incrementais, utilizando Feature Flags se necessário.
- **CI/CD**: O merge só é permitido se a esteira de CI (lint, testes, build) passar com sucesso.
- **Limpeza**: Exclua a branch da funcionalidade imediatamente após a conclusão do merge.

## Resumo do Fluxo de Trabalho

1. Sincronize sua branch `main` local: `git pull origin main`.
2. Crie uma nova branch: `git checkout -b feat/my-new-feature`.
3. Desenvolva e faça **Commits Atômicos** utilizando **Conventional Commits**.
4. Faça o push da sua branch: `git push origin feat/my-new-feature`.
5. Abra um Pull Request para a `main`.
6. Após ser aprovado e integrado (merged), exclua sua branch local e remota.