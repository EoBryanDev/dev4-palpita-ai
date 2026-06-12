## 1. Setup & Dependencies

- [x] 1.1 Add `jspdf` and `jspdf-autotable` dependencies to `apps/web/package.json`
- [x] 1.2 Run package installation to sync node_modules

## 2. Service & Actions

- [x] 2.1 Implement `obterTodosPalpitesUsuario` in `palpites.service.ts` to fetch all user guesses without limit filters
- [/] 2.2 Create `obterTodosPalpitesAction` in `actions/palpites.ts` to safely retrieve all guesses for the logged-in session

## 3. PDF Generator Utility

- [ ] 3.1 Create client utility `helpers/pdf-generator.ts` to format the guesses into a structured, branded PDF layout matching the app's visual identity (dark theme accents, emerald details, clean borders)

## 4. UI Implementation

- [ ] 4.1 Update `DashboardPalpites` props and render an "Exportar PDF" button with loading/disabled states
- [ ] 4.2 Connect the export button to dynamic imports of `jspdf` / `jspdf-autotable` and generate the document

## 5. Verification & Tests

- [ ] 5.1 Create unit tests in `dashboard-palpites.spec.tsx` to verify the export button triggers the data fetch and PDF download
- [ ] 5.2 Validate with Biome linter, Vitest tests, and Next.js build
