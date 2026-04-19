# Test Framework

## Setup

1. Use Node.js `24.14.1` from [.nvmrc](/C:/Users/ok.works/Projects/PreProduct/.nvmrc).
   Local validation in this workspace also passed on Node `22.18.0`.
2. Copy `.env.example` to `.env` and set `BASE_URL`, `API_URL`, and `PLAYWRIGHT_WEB_SERVER_COMMAND`.
3. Install dependencies with `pnpm install`.
4. Install the browser binary with `pnpm exec playwright install chromium`.

## Run

- Headless: `pnpm test:e2e`
- Headed: `pnpm test:e2e:headed`
- Debug: `pnpm test:e2e:debug`
- UI mode: `pnpm test:e2e:ui`
- Epic 2 red-phase only: `pnpm test:e2e:epic-2`

## Architecture

- `playwright.config.ts`: single Playwright entry point with exact timeout and artifact defaults.
- `tests/support/helpers/`: pure helpers for API and network work.
- `tests/support/fixtures/`: Playwright fixture wrappers over the helpers.
- `tests/support/factories/`: deterministic test data factories.
- `tests/e2e/`: runnable smoke coverage for the harness itself.
- `_bmad-output/test-artifacts/red-phase/...`: generated RED tests that can now run under the same config once app routes exist.

## Practices

- Install routes before the browser action that triggers them.
- Prefer `data-testid` selectors for product-critical flows.
- Keep helpers pure, and inject Playwright context only at the fixture boundary.
- Put cleanup or teardown logic in fixtures, not in individual tests.
- Keep API assertions at the lowest useful level and reserve E2E for user journeys.

## CI Notes

- `playwright.config.ts` already enables HTML + JUnit reporters and failure artifacts in `test-results/` and `playwright-report/`.
- Set `CI=true` in CI so retries, `forbidOnly`, and worker tuning apply automatically.
- Root baseline gates now live in `lint`, `typecheck`, `unit`, `contract`, and `perf-budget`.
- Provide `PLAYWRIGHT_WEB_SERVER_COMMAND` when E2E should boot the Next.js app deterministically.

## References

- TEA knowledge fragments applied: `fixture-architecture.md`, `playwright-config.md`, `test-levels-framework.md`, `overview.md`
- Official docs used for cross-checking:
  - Playwright installation: <https://playwright.dev/docs/intro>
  - Cypress installation comparison: <https://docs.cypress.io/app/get-started/install-cypress>
  - Node release status: <https://nodejs.org/en/blog/release>

## Current Limits

- Existing Epic 2 RED tests remain `test.skip()` until routes, fixtures, and assets are implemented.
- `@seontechnologies/playwright-utils` is recommended by TEA config but not installed in this baseline. The current fixture structure keeps that upgrade path open.
