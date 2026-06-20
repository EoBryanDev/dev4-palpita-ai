## Goal
Implement EOB-187 and EOB-188, then fulfill a new multi-part request.

## Done
- **EOB-187** — own prediction first/highlighted on palpites-stats. Merged into main.
- **EOB-188** — team name overflow fix on dashboard-palpites. Merged into main.
- **Invite banner** — hidden for logged-in users (`home/page.tsx:124`).
- **Live marquee** — new `live-marquee.tsx` component, added to `layout.tsx`.
- **Modal on vote count** — clickable stat numbers open a modal filtered by vote type (palpites-stats).
- **Pagination 6** — `visibleLimit` changed from 10 to 6, resets on search/filter change.
- **Status filter** — `PENDENTES` (default), `TODOS`, `FINALIZADOS` buttons.
- **Tests** — all 15 tests pass (updated existing + new tests for modal, filter, pagination).

## Files Changed
- `apps/web/src/app/home/page.tsx` — invite banner `!session` guard
- `apps/web/src/app/layout.tsx` — added `<LiveMarquee />`
- `apps/web/src/components/live-marquee.tsx` — new file
- `apps/web/src/components/palpites-stats.tsx` — modal, pagination 6, status filter
- `apps/web/tests/unitarios/components/palpites-stats.spec.tsx` — updated

## Remaining
- **Create branches** — 4 changes still on main, need proper feature branches
- **Atomically commit** each feature to its branch
- **Build verification**
- **Finalize Linear tickets** for the 4 new features
