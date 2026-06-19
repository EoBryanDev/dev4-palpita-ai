## ADDED Requirements

### Requirement: Multi-stage Dockerfile
The system SHALL provide a multi-stage Dockerfile that builds and runs the scraper.

#### Scenario: Docker build produces small image
- **WHEN** `docker build` is run on the Dockerfile
- **THEN** the final image SHALL contain only production dependencies and compiled JS

#### Scenario: Docker container runs scraper
- **WHEN** docker container starts with `run` argument
- **THEN** it SHALL execute the sync service once and exit

#### Scenario: Docker container runs in watch mode
- **WHEN** docker container starts with `watch` argument
- **THEN** it SHALL run the sync service on a cron schedule

### Requirement: GitHub Actions builds and pushes to DockerHub
The system SHALL provide a GitHub Actions workflow that builds and publishes the Docker image.

#### Scenario: Push to main triggers build
- **WHEN** code is pushed to `main` branch
- **THEN** GitHub Actions SHALL build the scraper image and push to DockerHub

#### Scenario: Tag trigger
- **WHEN** a semver tag (e.g., `v1.0.0`) is pushed
- **THEN** GitHub Actions SHALL build and push with both `latest` and version tag

### Requirement: Environment configuration
The system SHALL read DATABASE_URL and other config from environment variables.

#### Scenario: DATABASE_URL required
- **WHEN** scraper starts without DATABASE_URL
- **THEN** it SHALL exit with a clear error message

#### Scenario: Optional env vars
- **WHEN** SCRAPER_INTERVAL_MINUTES is not set
- **THEN** the default interval of 5 minutes SHALL be used
