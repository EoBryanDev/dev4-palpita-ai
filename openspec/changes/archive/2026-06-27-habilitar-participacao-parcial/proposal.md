## Why

Usuários que entram no bolão depois que a Copa já começou (status ATIVO) não conseguem palpitar em nada porque o deadline global (30 min antes da 1ª partida) já passou. Precisamos permitir que o admin libere esses usuários tardios para palpitar apenas nas partidas que ainda não aconteceram, com uma janela de 30 minutos.

## What Changes

- Adicionar campo `dataLiberacao` na tabela `usuarios` para rastrear quando o usuário foi liberado
- Criar action `liberarUsuarioAtrasado` específica para late-joiners
- Modificar `salvarPalpite` para aceitar janela de 30 min para usuários com `dataLiberacao`
- Modificar `meu-espaco/page.tsx` para calcular deadline individual vs global
- Adicionar UI no admin para liberar acesso tardio com indicador visual
- Usuário com `dataLiberacao` só vê partidas que ainda não começaram

## Capabilities

### New Capabilities
- `participacao-parcial`: Permitir que usuários que entraram após o início da competição sejam liberados pelo admin para palpitar em partidas futuras, com janela de 30 minutos

### Modified Capabilities
- `area-privada-palpites`: Deadline de palpites agora considera `dataLiberacao` do usuário (deadline individual de 30 min) quando aplicável, ao invés do deadline global fixo
- `area-admin-usuarios`: Adicionar ação "Liberar Acesso Tardio" para usuários ATIVOS após início da copa
- `persistencia-db`: Adicionar coluna `data_liberacao` na tabela `usuarios`
- `dominio-core`: Adicionar campo `dataLiberacao` na entidade `Usuario`

## Impact

- Schema: nova coluna `data_liberacao` na tabela `usuarios`
- Server action: nova action `liberarUsuarioAtrasado`, modificação em `salvarPalpite` e `alterarStatusUsuario`
- Dashboard: cálculo condicional de deadline (global vs individual)
- Admin UI: novo botão "Liberar Acesso Tardio" na tabela de usuários
- Domain entity: `Usuario.liberar()` agora aceita data opcional
