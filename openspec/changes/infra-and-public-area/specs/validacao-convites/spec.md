# validacao-convites Specification

## Purpose
Garantir o fluxo íntegro e seguro para solicitação de participação no bolão e o cadastro final do usuário por meio de links de convite temporários de curta duração.

## ADDED Requirements

### Requirement: Solicitação de Interesse por Convite
O sistema DEVE permitir que visitantes informem seu e-mail na home pública para solicitar um convite de participação no bolão corporativo.

#### Scenario: Envio de solicitação de convite
- **WHEN** o visitante preenche seu e-mail no formulário da home e clica em "Solicitar Convite"
- **THEN** o sistema valida o formato do e-mail, salva a solicitação no banco de dados com status "Pendente" e exibe uma mensagem de sucesso.

### Requirement: Validação Temporal de Token de Convite (RN04)
O sistema DEVE invalidar e barrar o cadastro de usuários cujos links de convite `/validation-user/[id]` tenham sido gerados há mais de 5 minutos da data/hora atual.

#### Scenario: Acesso a link de convite no prazo
- **WHEN** o usuário acessa `/validation-user/{uuid-valido}` e o token foi gerado há menos de 5 minutos
- **THEN** a tela permite que o usuário digite e confirme sua senha secreta para concluir o cadastro.

#### Scenario: Acesso a link de convite fora do prazo
- **WHEN** o usuário acessa `/validation-user/{uuid-valido}` e o token foi gerado há mais de 5 minutos
- **THEN** o sistema exibe uma mensagem informando que o link expirou e orientando-o a solicitar um novo convite ao administrador.

### Requirement: Cadastro de Senha e Ativação do Usuário
O sistema DEVE permitir a definição de senha segura criptografada e ativar a conta do usuário quando o link de convite for validado com sucesso.

#### Scenario: Conclusão do cadastro de usuário
- **WHEN** o usuário preenche a senha com sucesso no formulário de validação e envia os dados
- **THEN** o sistema armazena a senha usando hash seguro (bcrypt), marca o token de convite como utilizado, altera o status do usuário para ativo ("Liberado" ou "Pendente de Liberação" conforme regras) e o redireciona para a tela de login.
