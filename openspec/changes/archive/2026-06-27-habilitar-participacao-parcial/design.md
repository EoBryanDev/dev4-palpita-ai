## Context

O bolão atualmente usa um deadline global único: 30 minutos antes da primeira partida da Copa. Após esse deadline, NENHUM usuário pode palpitar. Usuários que entram no bolão depois que a copa começou (status ATIVO) ficam impossibilitados de participar porque o deadline já passou.

Precisamos permitir que o admin libere esses usuários tardios com uma janela de 30 minutos para palpitar apenas em partidas futuras.

## Goals / Non-Goals

**Goals:**
- Adicionar campo `dataLiberacao` na tabela `usuarios` para rastrear liberações tardias
- Criar action `liberarUsuarioAtrasado` no admin
- Modificar `salvarPalpite` para aceitar janela de 30 min para late-joiners
- Modificar dashboard para calcular deadline individual vs global
- Adicionar UI no admin com botão "Liberar Acesso Tardio"
- Exibir banner informativo com contagem regressiva para late-joiners

**Non-Goals:**
- Não criar modelo `Competition` (o bolão continua sendo um torneio único)
- Não alterar o fluxo de deadline global para usuários normais
- Não alterar o fluxo de convite/ativação de usuários
- Não implementar permissão por rodada (apenas por partida individual)

## Decisions

### 1. Novo campo `dataLiberacao` ao invés de tabela separada
Usar uma coluna opcional `data_liberacao` na tabela `usuarios` ao invés de criar uma tabela de auditoria separada. Simplicidade: o campo só é preenchido uma vez e é consultado em todo salvamento de palpite.

### 2. Deadline global mantido para usuários sem `dataLiberacao`
Usuários liberados antes da copa (sem `dataLiberacao`) continuam usando a regra antiga (deadline global 30 min antes da 1ª partida). Apenas late-joiners com `dataLiberacao` usam a janela de 30 min.

### 3. Action específica vs alteração na action existente
Criar `liberarUsuarioAtrasado` separada em vez de modificar `alterarStatusUsuario` para não quebrar o fluxo normal de liberação. A action existente para `LIBERADO` permanece sem setar `dataLiberacao`.

### 4. Validação no servidor + cliente
A validação principal fica no server action (`salvarPalpite`). O dashboard apenas esconde/bloqueia inputs baseado no cálculo do servidor. Segurança primeiro, UX depois.

### 5. Filtro de partidas no servidor
Usuários com `dataLiberacao` só recebem partidas com `dataInicio > now` no dashboard. Isso evita que vejam jogos que já passaram e tentem palpitar.

## Risks / Trade-offs

- [Janela de 30 min pode ser curta] → O admin deve avisar o usuário antes de liberar. Podemos aumentar a constante futuramente.
- [Concorrência: usuário é liberado e tenta palpitar simultaneamente] → A validação no server action é atômica, a data de referência é o momento da requisição.
- [Usuário pode ficar confuso com deadline diferente] → O banner de aviso no dashboard explica claramente o prazo individual.
