---
stepsCompleted:
  - "step-01-detect-mode"
  - "step-02-load-context"
  - "step-03-risk-and-testability"
  - "step-04-coverage-plan"
  - "step-05-generate-output"
lastStep: "step-05-generate-output"
lastSaved: "2026-04-22"
inputDocuments:
  - "_bmad/tea/config.yaml"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/risk-governance.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/probability-impact.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-levels-framework.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-priorities-matrix.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/playwright-cli.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/overview.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/api-request.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/selector-resilience.md"
---

# Test Design Progress: Epic 2 - AI 보조 등록 및 실패 복구

## Step 1 - Detect Mode & Prerequisites

- Mode: Epic-level.
- Reason: User explicitly requested `/bmad-testarch-test-design` equivalent for `Epic 2: AI 보조 등록 및 실패 복구`.
- Required inputs found:
  - Epic and story requirements with acceptance criteria in `_bmad-output/planning-artifacts/epics.md`.
  - Story seed for Story 2.1 in `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md`.
  - PRD and architecture context in `_bmad-output/planning-artifacts`.
- Note: `_bmad-output/implementation-artifacts/sprint-status.yaml` appears stale for Epic 2 naming and was not modified.

## Step 2 - Load Context & Knowledge Base

- Config source: `_bmad/tea/config.yaml`.
- Config values:
  - `test_artifacts`: `{project-root}/_bmad-output/test-artifacts`
  - `tea_use_playwright_utils`: `true`
  - `tea_use_pactjs_utils`: `false`
  - `tea_pact_mcp`: `none`
  - `tea_browser_automation`: `auto`
  - `test_stack_type`: `auto`
- Detected stack: fullstack, based on `package.json`, `playwright.config.ts`, Next.js/React dependencies, `src/app`, API routes, Jest tests, and Playwright E2E tests.
- Existing coverage found:
  - E2E: `tests/e2e/listing-registration.spec.ts`
  - Unit/domain/infra: `src/domain/**.test.ts`, `src/infra/**.test.ts`
  - Contract: `tests/contracts/listing-created.v1.contract.test.ts`, `src/shared/contracts/events/listing-created.v1.test.ts`
  - Prior red-phase artifacts: `_bmad-output/test-artifacts/red-phase/1-2-prelisting-status-and-edit`
- Browser exploration: skipped because no target URL or running dev server was provided. No Playwright CLI session was opened.
- Knowledge loaded:
  - Core epic-level fragments: risk governance, probability-impact, test-levels, test-priorities.
  - Browser/Playwright guidance: Playwright CLI, Playwright Utils overview, api-request, selector-resilience.

## Step 3 - Risk & Testability Assessment

- High risks identified:
  - R-001 fallback path fails and blocks registration, score 9.
  - R-002 late AI response overwrites manual fallback input, score 9.
  - R-003 duplicate AI request creates duplicate state/event, score 6.
  - R-004 unsafe or invalid upload crosses processing boundary, score 6.
  - R-005 stale pricing suggestion accepted after item revision changes, score 6.
- Medium risks identified:
  - R-006 contract drift between AI/pricing APIs and UI.
  - R-007 inaccessible upload/request/error/fallback states.
  - R-008 timeout or large file creates infinite spinner/performance regression.
  - R-009 stale nested app path references cause tests to be generated in the wrong location.
- Key mitigation priority:
  - P0 RED tests should start with fallback, late-response overwrite prevention, idempotency, and stale price rejection.

## Step 4 - Coverage Plan & Execution Strategy

- Coverage matrix generated in `_bmad-output/test-artifacts/test-design-epic-2.md`.
- Priority distribution:
  - P0: 9 tests, ~16-28 hours.
  - P1: 23 tests, ~18-34 hours.
  - P2: 13 tests, ~8-18 hours.
  - P3: 2 activities, ~2-4 hours.
  - Total: ~44-84 hours, 약 1.5-3 weeks.
- Execution strategy:
  - PR: unit, component, API contract, and P0/P1 E2E if under ~15 minutes.
  - Nightly: full E2E, mobile viewport, delayed response/timeout, perf smoke.
  - Weekly: exploratory mobile, burn-in for fallback/idempotency races, large file boundaries.
- Quality gates:
  - P0 100%.
  - P1 >= 95%.
  - fallback E2E 100%.
  - high-risk mitigations complete or approved waiver.

## Step 5 - Generate Output & Validate

- Final output written:
  - `_bmad-output/test-artifacts/test-design-epic-2.md`
- Progress file written:
  - `_bmad-output/test-artifacts/test-design-progress.md`
- Validation summary:
  - Epic-level template structure populated.
  - Risk assessment matrix includes unique IDs, categories, probability, impact, score, mitigation, owner, and timeline/action.
  - Coverage matrix maps `FR8-FR15` behaviors to P0-P3 scenarios and avoids duplicating the same behavior across levels.
  - Execution strategy uses PR/Nightly/Weekly model.
  - Resource estimates are ranges, not exact calculations.
  - No browser sessions opened, so no cleanup required.
  - Artifacts stored under `_bmad-output/test-artifacts`.
