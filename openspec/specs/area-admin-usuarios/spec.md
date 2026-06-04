# area-admin-usuarios Specification

## Purpose
TBD - created by archiving change private-area. Update Purpose after archive.
## Requirements
### Requirement: Painel de Moderação de Solicitações de Convite
O sistema DEVE disponibilizar uma tela exclusiva de moderação em `/admin/solicitacoes` que liste todas as solicitações pendentes de convite enviadas por visitantes.

#### Scenario: Visualização e ação de convites pendentes
- **WHEN** o administrador acessa o painel de solicitações e aprova ou rejeita uma solicitação pendente
- **THEN** o sistema atualiza o status do convite correspondente no banco de dados e gera o link temporário de acesso em caso de aprovação.

### Requirement: Geração de Convites Temporários (RN04)
O sistema DEVE gerar um link de ativação temporário com validade estrita de exatamente 5 minutos a partir da sua criação sempre que o administrador aprovar uma solicitação.

#### Scenario: Geração de token de convite
- **WHEN** o administrador clica para aprovar um convite
- **THEN** o sistema gera um registro de Token de Convite com expiração definida para `DataCriacao + 5 minutos` e fornece o link correspondente `/validation-user/{uuid}` para envio.

### Requirement: Gestão de Permissões e Liberação de Usuários (RN05)
O sistema DEVE permitir que o administrador alterne o status de participação de um usuário cadastrado entre "Pendente de Liberação" e "Liberado" para gerenciar quem pode registrar palpites.

#### Scenario: Liberação manual de usuário
- **WHEN** o administrador seleciona um usuário cadastrado e altera seu status para "Liberado"
- **THEN** o sistema atualiza o status do usuário no banco de dados, habilitando imediatamente sua permissão para enviar palpites.

