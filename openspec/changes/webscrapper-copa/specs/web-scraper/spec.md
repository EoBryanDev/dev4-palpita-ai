## ADDED Requirements

### Requirement: Scraper Engine Interface
The system SHALL define an abstract interface `IScraperEngine` that all scraper engines implement.

#### Scenario: Interface defines scrapeMatch method
- **WHEN** a scraper engine implements the interface
- **THEN** it MUST provide a `scrapeMatch(timeA, timeB)` method that returns `IScrapeResult | null`

#### Scenario: IScrapeResult contains match data
- **WHEN** a scraper engine returns a result
- **THEN** it MUST include `golsTimeA`, `golsTimeB`, `status`, and optional `eventos` array

### Requirement: Google Engine (fetch + cheerio)
The system SHALL provide a GoogleEngine that fetches match results from Google Search using fetch + cheerio.

#### Scenario: Successful scrape returns parsed result
- **WHEN** GoogleEngine scrapes "Brasil x Marrocos copa 2026"
- **THEN** it returns `IScrapeResult` with gols, status, and eventos when available

#### Scenario: Google returns 429 (rate limited)
- **WHEN** Google responds with HTTP 429
- **THEN** the engine SHALL throw a `RateLimitError` with retryAfter info

#### Scenario: No match found
- **WHEN** Google search returns no knowledge panel for the query
- **THEN** the engine SHALL return null

### Requirement: Playwright Engine (fallback)
The system SHALL provide a PlaywrightEngine as fallback when fetch-based scraping fails.

#### Scenario: Playwright fallback activated
- **WHEN** GoogleEngine throws an error or returns null
- **THEN** SyncService MAY call PlaywrightEngine as fallback

#### Scenario: Playwright scrape returns result
- **WHEN** PlaywrightEngine navigates to Google with headless browser
- **THEN** it SHALL extract the knowledge panel and return `IScrapeResult`

### Requirement: Input sanitization for search queries
The system SHALL sanitize team names before constructing search queries.

#### Scenario: Team name with special characters
- **WHEN** a team name contains special characters
- **THEN** the query builder SHALL URL-encode and strip non-alphanumeric characters
