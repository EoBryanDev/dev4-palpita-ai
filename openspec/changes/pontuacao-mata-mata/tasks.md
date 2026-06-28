## 1. Schema & Domain

- [x] 1.1 Add `tipo` to `rodadas`, `decididoEm` to `partidas` and `momentoPrevisto` to `palpites` in Drizzle schema
- [x] 1.2 Update core entities (`Palpite`, `Partida`, `Usuario`) to support these fields
- [x] 1.3 Update `Palpite.calcularPontos()` with mata-mata bonus point logic
- [x] 1.4 Generate and run Drizzle migrations

## 2. Server Actions & Services

- [x] 2.1 Update `salvarPalpite` action to use the round-based 30 minutes deadline instead of tournament-wide deadline
- [x] 2.2 Update `salvarPalpite` action to write the selected `momentoPrevisto`
- [x] 2.3 Update admin results submission action to record `decididoEm` for knockout matches

## 3. UI (Dashboard & Rules)

- [x] 3.1 Modify guess form in `meu-espaco` to allow selecting the moment of victory (tempo normal, prorrogação, pênaltis) if the round is `MATAMATA`
- [x] 3.2 Add explanation of the knockout bonus rule to the public rules section in `/home`
- [x] 3.3 Ensure the countdown banner in the private area displays the correct remaining time until the round starts
- [x] 3.4 Add MATAMATA toggle to admin round creation form and inline toggle in round listing

## 4. Verification

- [x] 4.1 Create unit tests for `Palpite.calcularPontos` under knockout scenarios
- [x] 4.2 Run `pnpm build` to verify project builds
- [x] 4.3 Run typecheck: `pnpm --filter @palpita/web exec tsc --noEmit`
- [x] 4.4 Run lint: `pnpm biome check --write`
- [x] 4.5 Run tests: `pnpm --filter @palpita/web exec vitest run`
