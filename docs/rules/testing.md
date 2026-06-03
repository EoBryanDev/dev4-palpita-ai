# Convenções de Testes

## Framework e Ferramentas
- **Runner (Executor)**: [Vitest](https://vitest.dev/)
- **Biblioteca**: React Testing Library para componentes de interface (UI).
- **Mocks**: Utilize `vi.mock` ou MSW (Mock Service Worker) para chamadas de API.

## O Padrão AAA (3A)
Os testes devem ser estruturados utilizando o padrão **Arrange, Act, Assert** (Preparar, Agir, Verificar):
1. **Arrange (Preparar)**: Configure os dados e o ambiente de teste.
2. **Act (Agir)**: Execute a ação que será testada.
3. **Assert (Verificar)**: Valide o resultado esperado.

## Boas Práticas
- **Testes de Comportamento**: Teste o que o código faz, não como ele faz (evite testar detalhes de implementação).
- **Isolamento**: Cada teste deve ser independente. Resete os mocks e estados no bloco `afterEach`.
- **Nomenclatura de Arquivos**: `[nome-do-arquivo].spec.{ts,tsx}` para testes unitários e `[nome-do-arquivo].test.{ts,tsx}` para testes de integração.

## Diretrizes de Cobertura
- **Prioridade**: Foque na exatidão funcional e nos casos extremos (edge cases) em vez de focar apenas em métricas brutas.
- **Meta Mínima**: **70-80%** de cobertura global.
- **Código Crítico**: A lógica de negócios (Casos de Uso / Modelos de Domínio) deve ter como meta **100% de cobertura**.