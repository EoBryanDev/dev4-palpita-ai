# Agent Instructions

## Package Manager
Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm build`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity <noreply@google.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `pnpm --filter @palpita/web exec tsc --noEmit` |
| Lint & Format | `pnpm biome check --write path/to/file.ts` |
| Test | `pnpm --filter <pkg> exec vitest run path/to/file.spec.ts` |

## Key Conventions

### Coding, Styling & Testing Rules
- Follow code standards in [coding.md](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/docs/rules/coding.md) and formatting in [linting.md](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/docs/rules/linting.md) (Biome: 2 spaces, 80 char limit).
- Domain entities MUST go to `packages/core/src/domain/` (e.g. `Palpite`, `Usuario`).
- Use Vitest and follow the AAA pattern in [testing.md](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/docs/rules/testing.md).
- Follow Git conventions in [versioning.md](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/docs/rules/versioning.md).

### Task Workflow (OpenSpec)
- Follow tasks in `openspec/changes/<change-name>/tasks.md`.
- Mark as `"IN_PROGRESS"` at start, `"DONE"` at completion.
- Run `pnpm build` to verify the project builds successfully before concluding a task or committing code.
- Update documentation in `./docs` first/during code modifications if logic/architecture changes.

### Linear & Git Integration
- Branches: Use `tipo/ENG-XXX-descricao-curta` where `ENG-XXX` is the Linear Ticket ID.
- Commits: Use Conventional Commits and append the Linear Ticket ID (e.g., `feat(api): description ENG-XXX`).
- Resolving: Add `Fixes ENG-XXX` or `Closes ENG-XXX` to PR descriptions or final merge commits.
- Direct management: Use the `$LINEAR_API_KEY` from [.env](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/.env) to call `https://api.linear.app/graphql` when asked to manage/update Linear tickets.