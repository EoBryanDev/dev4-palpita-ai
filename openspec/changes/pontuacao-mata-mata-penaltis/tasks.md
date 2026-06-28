## 1. Schema & Domain

- [x] 1.1 Add `time_vencedor_penaltis` column to partidas table in `packages/db/src/schema.ts` (`varchar('time_vencedor_penaltis', {length: 1})`, nullable, `'A' | 'B' | null`)
- [x] 1.2 Add `time_vencedor_previsto` column to palpites table in `packages/db/src/schema.ts` (`varchar('time_vencedor_previsto', {length: 1})`, nullable, `'A' | 'B' | null`)
- [x] 1.3 Add `TPenaltyWinner = 'A' | 'B'` type and `timeVencedorPenaltis` prop to `IPartidaProps` and `Partida` class in `packages/core/src/domain/partida.entity.ts`
- [x] 1.4 Add `timeVencedorPrevisto?: 'A' | 'B'` to `IPalpiteProps` and `Palpite` class in `packages/core/src/domain/palpite.entity.ts`
- [x] 1.5 Rewrite `calcularPontos()` in `palpite.entity.ts`:
  - Signature: `calcularPontos(golsA, golsB, tipoRodada, decididoEm, timeVencedorPenaltis?)`
  - Non-draw MATAMATA: `momentoPrevisto === decididoEm` → +1 (unchanged)
  - Draw MATAMATA: `timeVencedorPrevisto === timeVencedorPenaltis` → +1 (new)

## 2. Tests

- [x] 2.1 Add 9 test scenarios in `packages/core/src/domain/palpite.entity.spec.ts`:
  - Placard exato GRUPO (2 pts)
  - Resultado certo, placar errado GRUPO (1 pt)
  - Placar exato + período certo MATAMATA não-empate (3 pts)
  - Placar exato + período errado MATAMATA não-empate (2 pts)
  - Placar exato + vencedor pênaltis certo MATAMATA empate (3 pts)
  - Empate placar errado + vencedor pênaltis certo (2 pts)
  - Placar exato + vencedor pênaltis errado (2 pts)
  - Resultado errado MATAMATA (0 pts)
  - Partida sem resultado (0 pts)
- [x] 2.2 Run `pnpm --filter @palpita/core exec vitest run packages/core/src/domain/palpite.entity.spec.ts` and verify all pass

## 3. Service Layer — Mapear novos campos

- [x] 3.1 Add `timeVencedorPrevisto` to `IPalpiteServiceData` and `obterPalpitesUsuario()` in `apps/web/src/services/palpites.service.ts`
- [x] 3.2 Add `timeVencedorPrevisto` to `obterPalpitesSalvosFuturosPaginados()` select and map in `apps/web/src/services/palpites.service.ts`
- [x] 3.3 Add `timeVencedorPrevisto` to `obterTodosPalpitesUsuario()` select and map in `apps/web/src/services/palpites.service.ts`
- [x] 3.4 Add `timeVencedorPrevisto` to `IPalpiteComUsuario` and `obterPalpitesUsuariosAtivos()` in `apps/web/src/services/palpites.service.ts`
- [x] 3.5 Add `timeVencedorPenaltis` to `IPartidaCompleta` and `obterPartidas()` select in `apps/web/src/services/partidas.service.ts`

## 4. Server Actions — Salvar Palpite

- [x] 4.1 Add `timeVencedorPrevisto?: 'A' | 'B'` parameter to `salvarPalpite()` in `apps/web/src/app/actions/palpites.ts`
- [x] 4.2 Add validation: if `golsA === golsB` and match is MATAMATA, `timeVencedorPrevisto` is required
- [x] 4.3 Include `timeVencedorPrevisto` in UPSERT (insert and update) query
- [x] 4.4 Replace round-level deadline with per-match deadline — remove global deadline, keep per-match `agora >= dataInicio` check

## 5. Server Actions — Lançar Resultado

- [x] 5.1 Add `timeVencedorPenaltis?: 'A' | 'B'` parameter to `lancarResultadoOficial()` in `apps/web/src/app/actions/admin.ts`
- [x] 5.2 Add validation: if `golsA === golsB` and partida is MATAMATA, `timeVencedorPenaltis` is required
- [x] 5.3 Pass `timeVencedorPenaltis` to `Partida.finalizar()`
- [x] 5.4 Save `timeVencedorPenaltis` in the DB update

## 6. Server Page — meu-espaco

- [x] 6.1 In `apps/web/src/app/meu-espaco/page.tsx`: map `timeVencedorPrevisto` in `partidasEnriquecidas`, `historico`, and `emAndamentoEnriquecidas`
- [x] 6.2 Per-match deadline validation

## 7. Interfaces

- [x] 7.1 Add `timeVencedorPrevisto?: 'A' | 'B'` to `IPartidaDashboard` and `IHistoricoDashboard` in `apps/web/src/interface/IDashboard.ts`
- [x] 7.2 Add `tipoRodada?`, `decididoEm?`, `timeVencedorPenaltis?` to `IPartidaStats` and `momentoPrevisto?`, `timeVencedorPrevisto?` to `IPalpiteIndividual` in `apps/web/src/interface/IPalpite.ts`

## 8. Hook State

- [x] 8.1 Add `timeVencedorPrevisto?: 'A' | 'B'` to the `valoresPalpites` state type in `apps/web/src/hooks/use-dashboard-palpites.ts`
- [x] 8.2 Create `handleTimeVencedorChange(partidaId, value: 'A' | 'B')` handler
- [x] 8.3 Update `handleSalvar()` to resolve and pass `timeVencedorPrevisto` to `salvarPalpite()`

## 9. UI — Dashboard Palpites (usuário)

- [x] 9.1 In `dashboard-palpites.tsx`: conditional penalty winner selector on draw MATAMATA, momentoPrevisto select for non-draw MATAMATA (NORMAL/PRORROGACAO only)
- [x] 9.2 Same for saved palpites section
- [x] 9.3 In history section: `timeVencedorPrevisto` vs `timeVencedorPenaltis` match indicator

## 10. UI — Stats Page (/palpites)

- [x] 10.1 Update API route to include MATAMATA fields
- [x] 10.2 In `palpites-stats.tsx`: "Mata-Mata" badge on MATAMATA match cards
- [x] 10.3 In `palpites-stats.tsx`: columns for `momentoPrevisto` and `timeVencedorPrevisto`

## 11. UI — Admin

- [x] 11.1 In `admin-partidas-client.tsx`: conditional seletor for `timeVencedorPenaltis` on MATAMATA draw matches
- [x] 11.2 Show "Venceu nos pênaltis:" on finalized MATAMATA draw matches

## 12. External Services — Ranking & Eventos

- [x] 12.1 In `apps/web/src/services/ranking.service.ts`: pass `timeVencedorPrevisto` and `timeVencedorPenaltis` to `Palpite` entity and `calcularPontos()`
- [x] 12.2 In `apps/web/src/app/actions/eventos.ts`: pass `timeVencedorPrevisto` and `timeVencedorPenaltis` to `Palpite` entity and `calcularPontos()`

## 13. Build & Verify

- [x] 13.1 Run `pnpm build` — fix type errors across all packages — 223/223 tests pass ✅
- [x] 13.2 Typecheck: `pnpm --filter @palpita/web exec tsc --noEmit` — clean ✅
- [x] 13.3 Tests: 40 core + 183 web = 223 passing ✅
- [x] 13.4 Biome: lint clean across all changed files ✅
