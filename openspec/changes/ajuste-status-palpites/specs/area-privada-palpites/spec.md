## ADDED Requirements

### Requirement: Listagem de Palpites em Andamento no Meu Espaço
No painel do competidor, o sistema MUST continuar listando e permitindo visualizar os palpites das partidas que já iniciaram (em andamento) mas que ainda não foram finalizadas pelo administrador. Essas partidas devem ser ordenadas por último nas buscas paginadas e na listagem das rodadas.

#### Scenario: Visualização de palpites salvos contendo jogos em andamento
- **WHEN** o usuário acessa o "Meu Espaço" e existem jogos em andamento (já iniciados, mas não finalizados)
- **THEN** o sistema os exibe no final da lista de palpites da rodada e ao final da paginação de palpites salvos.
