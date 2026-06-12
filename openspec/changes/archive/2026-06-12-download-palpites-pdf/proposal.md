## Why

Users want to download a consolidated flat PDF copy of all their submitted guesses and current score data directly from the "Meu Espaço" dashboard. This allows them to print, archive, or share their guesses easily.

## What Changes

- Add a "Download PDF" button to the "Meus Palpites Salvos" and "Histórico de Palpites" header area inside the "Meu Espaço" dashboard.
- Implement client-side PDF generation using a library such as `jspdf` and `jspdf-autotable`.
- Load the PDF generation library dynamically (lazy loading) to minimize initial bundle size impact.
- Fetch all active guesses and match results (including historical ones) for the logged-in user to compile the complete list.

## Capabilities

### New Capabilities
- `download-palpites-pdf`: Allows competitors to export and download a structured, branded PDF report containing all their saved guesses, historical scores, and current position in the ranking.

### Modified Capabilities
<!-- None -->

## Impact

- **Frontend Component**: [dashboard-palpites.tsx](file:///home/bryan-galaxy-zos/Programming/dev4-palpita-ai/apps/web/src/components/dashboard-palpites.tsx) (UI updates to add button and implement trigger logic).
- **Dependencies**: Add `jspdf` and `jspdf-autotable` to the project dependencies in `apps/web/package.json`.
