# Linting e Formatação

Utilizamos o [Biome](https://biomejs.dev/) tanto para linting quanto para formatação, garantindo consistência e velocidade no código.

- **Indentação**: Utilize **2 espaços** (espaços, não tabs).
- **Tamanho da Linha**: Máximo de **80 caracteres** por linha para garantir a legibilidade.
- **Ordenação de Imports**: Os imports devem ser ordenados **alfabeticamente**. A opção `organizeImports` do Biome deve estar ativada.
- **Ponto e Vírgula**: Utilize sempre ponto e vírgula.
- **Aspas**: Utilize aspas simples para strings (exceto no JSX, onde se utiliza aspas duplas).
- **Vírgulas Finais (Trailing Commas)**: Utilize vírgulas no final sempre que possível (em estruturas de múltiplas linhas).

> **Nota**: Execute `biome check --apply .` antes de realizar o commit para corrigir automaticamente os problemas de formatação e linting.