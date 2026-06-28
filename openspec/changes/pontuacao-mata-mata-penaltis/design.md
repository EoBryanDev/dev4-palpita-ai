## Context

Atualmente, palpites em MATAMATA usam `momentoPrevisto` (NORMAL/PRORROGACAO/PENALTIS) com bônus de +1 se acertar o momento. Para jogos empatados, `momentoPrevisto = PENALTIS` é a única opção viável, mas o bônus atual não recompensa o acerto de **quem venceu nos pênaltis** — apenas o momento em si. O deadline usa 30 min antes do primeiro jogo da rodada, travando todas as partidas mesmo quando espalhadas em dias diferentes.

## Goals / Non-Goals

**Goals:**
- Reformular a pontuação MATAMATA: bônus de período (+1) para não-empates e bônus de vencedor nos pênaltis (+1) para empates
- Novo campo `timeVencedorPrevisto` no palpite (obrigatório se golsA === golsB em MATAMATA)
- Novo campo `timeVencedorPenaltis` na partida (obrigatório no resultado se empate em MATAMATA)
- Deadline por partida (30 min antes de cada jogo, não mais por rodada)
- Exibir `timeVencedorPrevisto` no `/meu-espaco` (formulário e histórico)
- Exibir `timeVencedorPenaltis` no `/admin` e na página `/palpites`

**Non-Goals:**
- Não alterar pontuação de fase de grupos
- Não alterar deadline para usuários com liberação tardia (já funciona por partida)
- Não adicionar notificações ou emails

## Decisions

### D1: Empate no palpite → PENALTIS automático
Se `golsA === golsB` e `tipoRodada === 'MATAMATA'`, `momentoPrevisto` é forçado para `'PENALTIS'` no frontend e validado no backend. O usuário não vê o seletor de `momentoPreviso` quando os gols são iguais — vê apenas o seletor de vencedor dos pênaltis.

### D2: Bônus mutuamente exclusivos
- `golsA !== golsB`: bônus de +1 se `momentoPrevisto === decididoEm` (NORMAL ou PRORROGACAO)
- `golsA === golsB`: bônus de +1 se `timeVencedorPrevisto === timeVencedorPenaltis`
- Os dois bônus NUNCA se acumulam na mesma partida

### D3: `calcularPontos()` recebe `timeVencedorPenaltis` como parâmetro
Assinatura: `calcularPontos(golsA, golsB, tipoRodada, decididoEm, timeVencedorPenaltis?)`
Evita poluir a entidade com dados de partida que não lhe pertencem.

### D4: Deadline por partida
Trocar de `primeiraPartidaRodada.dataInicio - 30min` para `partida.dataInicio - 30min` tanto na action `salvarPalpite` quanto no server component `meu-espaco/page.tsx`. A validação de `agora >= partida.dataInicio` já existe — basta remover o bloco de deadline global.

### D5: Stats page revela `timeVencedorPrevisto`
A API `/api/palpites` passa a incluir `tipoRodada`, `decididoEm`, `timeVencedorPenaltis` no nível da partida e `momentoPrevisto`, `timeVencedorPrevisto` em cada palpite individual. O componente `palpites-stats.tsx` mostra colunas extras nas linhas de MATAMATA.

## Risks / Trade-offs

- **[Data existente]** Palpites de MATAMATA já salvos com `momentoPrevisto` podem não ter `timeVencedorPrevisto`. Mitigação: campo é opcional (nullable), UI trata como "não informado" para palpites antigos.
- **[Migração]** Colunas novas no banco (`time_vencedor_penaltis`, `time_vencedor_previsto`) precisam ser adicionadas com `ALTER TABLE`. Como não há dados em produção, sem risco de quebra.
- **[Deadline]**: Trocar deadline por rodada para deadline por partida altera comportamento existente (alguns palpites que estariam fechados podem reabrir). Desejado e esperado.
