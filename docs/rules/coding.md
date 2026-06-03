# Convenções de Código

## Nomenclatura

- **camelCase**: variáveis, funções, parâmetros, propriedades de objetos
- **PascalCase**: classes, interfaces, aliases de tipo (type aliases), enums
- **UPPER_SNAKE_CASE**: constantes e valores de enum
- **kebab-case**: nomes de arquivos, nomes de diretórios e nomes de tabelas (ex.: `create-user.usecase.ts`, `typeorm-user.repository.ts`, `product-variants`)

## Arquivos

- Utilize sufixos nos arquivos de acordo com o papel deles: `.usecase.ts`, `.repository.ts`, `.controller.ts`, `.entity.ts`

## TypeScript

- Sempre utilize tipos de retorno explícitos em funções exportadas
- Prefira `interface` em vez de `type` para a estrutura de objetos
- Prefira `unknown` em vez de `any` — nunca utilize `any`, a menos que seja estritamente necessário
- Utilize `readonly` para propriedades que não devem ser reatribuídas
- Utilize `interface` para estruturas de objetos, com o prefixo **I** (ex.: `IUserAccount`)
- Utilize `type` para conjuntos de atributos, uniões ou aliases, com o prefixo **T** (ex.: `TUserRole`)

## Convenções de Sintaxe e Estilo

- **Paradigma:** Híbrido.
- **Funcional:** Obrigatório para Componentes React, Hooks e Helpers.
- **POO (Orientação a Objetos):** Obrigatório para Objetos de Negócio Centrais, Serviços e Modelos de Domínio.
- **ESLint:** Airbnb Base + regras do React.
- **Formatação:** Ordenação alfabética de imports e ordenação de classes do Tailwind CSS (plugin do Prettier).
- **Code Smells:** Aplique sempre os princípios SOLID, DRY, Fail Fast e K.I.S.S. Evite código duplicado e funções com mais de 100 linhas.
- **Comentários:** Nunca utilize comentários para explicar o código. Utilize comentários apenas para explicar o porquê de algo estar sendo feito de determinada maneira.
- **Imports:** Sempre organize os imports em ordem alfabética, separados por categorias (padrão, terceiros, locais).
- **Exportações:** prefira exportações nomeadas em vez de exportações padrão.

## Gerenciamento de Pacotes

- Sempre utilize o pnpm para o gerenciamento de pacotes
