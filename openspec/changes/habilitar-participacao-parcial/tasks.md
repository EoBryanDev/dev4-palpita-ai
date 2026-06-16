## 1. Schema & Domain

- [ ] 1.1 Add `dataLiberacao` column to `usuarios` table in Drizzle schema
- [ ] 1.2 Add `dataLiberacao` field to `IUsuarioProps` and `Usuario` entity in domain
- [ ] 1.3 Generate and run Drizzle migration

## 2. Server Actions

- [ ] 2.1 Modify `alterarStatusUsuario` to set `dataLiberacao` when status changes to LIBERADO
- [ ] 2.2 Create `liberarUsuarioAtrasado` action for late-joiners
- [ ] 2.3 Modify `salvarPalpite` to accept per-user deadline (30 min window for late-joiners)

## 3. Dashboard (Server + Client)

- [ ] 3.1 Modify `meu-espaco/page.tsx` to calculate individual deadline for users with `dataLiberacao`
- [ ] 3.2 Filter partidas in dashboard: late-joiners only see matches that haven't started
- [ ] 3.3 Add banner with countdown for late-joiners in `dashboard-palpites.tsx`

## 4. Admin UI

- [ ] 4.1 Add `dataLiberacao` field to `IUsuarioAdmin` interface
- [ ] 4.2 Add `dataLiberacao` to `obterUsuariosComToken` service query
- [ ] 4.3 Add "Liberar Acesso Tardio" button in `admin-usuarios-client.tsx` for ATIVO users after copa started
- [ ] 4.4 Add mutation for `liberarUsuarioAtrasado` in `useMutationUsuarios`

## 5. Linear

- [ ] 5.1 Update EOB-174, EOB-175 status in Linear as they are implemented
- [ ] 5.2 Update EOB-173 status when complete
- [ ] 5.3 Update EOB-172 status when complete

## 6. Verification

- [ ] 6.1 Run `pnpm build` to verify project builds
- [ ] 6.2 Run typecheck: `pnpm --filter @palpita/web exec tsc --noEmit`
- [ ] 6.3 Run lint: `pnpm biome check --write`
- [ ] 6.4 Run tests: `pnpm --filter @palpita/web exec vitest run`
