## ADDED Requirements

### Requirement: Guesses PDF Export
The system SHALL provide a button to export all of a competitor's guesses, scores, and ranking position into a flat PDF document.

#### Scenario: Competitor downloads guesses report
- **WHEN** the competitor clicks the "Exportar PDF" button in the dashboard
- **THEN** the system SHALL fetch all active and historical guesses for the logged-in user, compile them into a styled PDF document matching the app's visual identity, and trigger a file download in the browser.
