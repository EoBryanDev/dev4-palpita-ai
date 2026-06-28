## Why

O sistema atual de pontuação mata-mata concede +1 bônus apenas por acertar o momento da decisão (`momentoPrevisto === decididoEm`), mas não recompensa o usuário que acerta **quem vence nos pênaltis** — que é a informação mais relevante em jogos decididos por empate. Além disso, o prazo de palpite é global por rodada (30 min antes do primeiro jogo), travando partidas futuras desnecessariamente.

## What Changes

### Pontuação Mata-Mata Reformulada
- **Empate no palpite = PENALTIS automático**: se usuário coloca gols iguais em MATAMATA, `momentoPrevisto` vira `PENALTIS` automaticamente — sem escolha.
- **Novo campo `timeVencedorPrevisto`**: obrigatório quando o palpite é empate em MATAMATA. Usuário escolhe qual time avança.
- **Novo campo `timeVencedorPenaltis`**: obrigatório no lançamento de resultado oficial quando partida MATAMATA termina empatada. Admin informa quem venceu.
- **Bônus de vencedor nos pênaltis (+1)**: se `timeVencedorPrevisto === timeVencedorPenaltis`, usuário ganha +1 ponto.
- **Bônus de período (+1)**: mantido para jogos não-empate (NORMAL vs PRORROGACAO).

### Deadline por Partida
- Troca do prazo global (30 min antes do primeiro jogo da rodada) para **30 min antes de cada partida individualmente**.

### Visualização nos Palpites
- Página `/palpites` (stats): adiciona colunas de `momentoPrevisto` e `timeVencedorPrevisto` nos palpites individuais de MATAMATA.

## Capabilities

### New Capabilities
- `pontuacao-penaltis-mata-mata`: Regras de pontuação para vencedor nos pênaltis em jogos mata-mata, incluindo bônus, validação de campos obrigatórios e deadline individual.

### Modified Capabilities
- `dominio-core`: Cálculo de pontuação (RN01) — adiciona bônus de vencedor nos pênaltis e remove obrigatoriedade de `momentoPrevisto` para palpites de empate.
- `area-privada-dashboard`: Exibição do seletor de vencedor nos pênaltis no formulário de palpite e no histórico.
- `area-admin-partidas`: Seletor de `timeVencedorPenaltis` ao lançar resultado de partida MATAMATA.

## Impact

- **Domain**: `palpite.entity.ts` (nova prop `timeVencedorPrevisto`, `calcularPontos()` reescrito), `partida.entity.ts` (nova prop `timeVencedorPenaltis`)
- **DB Schema**: 2 colunas novas — `partidas.time_vencedor_penaltis`, `palpites.time_vencedor_previsto`
- **Services**: `palpites.service.ts`, `ranking.service.ts`, `partidas.service.ts` — mapear novos campos
- **Server Actions**: `salvarPalpite` (+ `timeVencedorPrevisto`), `lancarResultadoOficial` (+ `timeVencedorPenaltis`, deadline por partida)
- **UI Usuário**: `dashboard-palpites.tsx` + `use-dashboard-palpites.ts` — seletor condicional de vencedor
- **UI Admin**: `admin-partidas-client.tsx` — seletor de vencedor nos pênaltis
- **UI Stats**: `palpites-stats.tsx` + `/api/palpites` — colunas MATAMATA
- **Tests**: `palpite.entity.spec.ts` — 9 cenários de pontuação
