# scraper-sync-engine Specification

## Purpose
TBD - created by archiving change webscrapper-copa. Update Purpose after archive.
## Requirements
### Requirement: Sync service finds pending matches
The system SHALL query the database for matches where `dataInicio <= now()` and `status != 'FINALIZADO'`.

#### Scenario: Pending matches found
- **WHEN** sync service runs
- **THEN** it SHALL select all partidas matching the criteria, ordered by dataInicio ASC

#### Scenario: No pending matches
- **WHEN** no matches match the criteria
- **THEN** the sync service SHALL log "No pending matches" and exit gracefully

### Requirement: Sync service orchestrates scrape and upsert
The system SHALL iterate over pending matches, call the scraper engine, and upsert results.

#### Scenario: Successful scrape updates match
- **WHEN** scraper returns a result for a match
- **THEN** the sync service SHALL update `golsTimeA`, `golsTimeB`, `status` on the partida

#### Scenario: Match status changes to FINALIZADO
- **WHEN** the scraped result indicates the match is finished
- **THEN** the sync service SHALL set `status = 'FINALIZADO'`

#### Scenario: Match is ao vivo (EM_ANDAMENTO)
- **WHEN** the scraped result indicates the match is live
- **THEN** the sync service SHALL set `status = 'EM_ANDAMENTO'` (or keep existing)

#### Scenario: Scraper returns null (no data)
- **WHEN** scraper returns null for a match
- **THEN** the sync service SHALL log a warning and skip the match

### Requirement: Eventos are upserted to eventos_partida
The system SHALL insert new events into `eventos_partida` table when the scraped result includes event data.

#### Scenario: New events detected
- **WHEN** scraped result has eventos and some are not in the DB
- **THEN** the sync service SHALL insert only the new ones (dedup by minute + tipo + jogador)

#### Scenario: No events in result
- **WHEN** scraped result has no eventos array
- **THEN** the sync service SHALL skip event processing

### Requirement: Sync service respects rate limiting
The system SHALL handle Google rate limits by throwing a dedicated `RateLimitError` when a `429 Too Many Requests` status is returned by the engine.

#### Scenario: Scraper rate limited
- **WHEN** Google search returns an HTTP 429 status
- **THEN** the scraper engine throws a `RateLimitError` with the `Retry-After` header value, halting the match sync execution for that run.

### Requirement: Audit logging
The system SHALL log structured audit entries for each operation.

#### Scenario: Match updated
- **WHEN** a match is updated
- **THEN** log `{ matchId, timeA, timeB, oldScore, newScore, eventosCount }`

#### Scenario: Error during scrape
- **WHEN** an error occurs during scraping
- **THEN** log `{ matchId, error, attempt }` with stack trace

### Requirement: CLI run mode
The system SHALL provide a `run` CLI command that executes sync once and exits.

#### Scenario: pnpm scraper run
- **WHEN** user runs `pnpm scraper run`
- **THEN** the sync service executes once and exits with appropriate exit code

### Requirement: CLI watch mode
The system SHALL provide a `watch` CLI command that runs sync on a schedule.

#### Scenario: pnpm scraper watch
- **WHEN** user runs `pnpm scraper watch`
- **THEN** the sync service runs immediately, then repeats every N minutes (configurable)

#### Scenario: Watch mode configurable interval
- **WHEN** user sets `SCRAPER_INTERVAL_MINUTES` env var
- **THEN** the watch mode SHALL use that interval instead of default 5 min

