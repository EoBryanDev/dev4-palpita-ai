## ADDED Requirements

### Requirement: Cadastro de Times
O sistema SHALL permitir que o administrador cadastre novos times e seleções, especificando nome, emoji identificador e dados adicionais de confederacão/grupo.

#### Scenario: Cadastro de nova seleção
- **WHEN** o administrador insere o nome da seleção, emoji correspondente e clica em salvar
- **THEN** a seleção é cadastrada no banco de dados e torna-se elegível para vinculação em novas partidas.

### Requirement: Vínculo de Times nas Partidas
O sistema SHALL impedir a criação de partidas usando nomes textuais livres, exigindo a seleção de times previamente cadastrados.

#### Scenario: Criar partida vinculando equipes
- **WHEN** o administrador cria uma nova partida escolhendo o Time A e o Time B a partir da lista de times cadastrados
- **THEN** o sistema valida que as equipes são diferentes, associa a partida aos respectivos IDs dos times no banco de dados e salva com sucesso.
