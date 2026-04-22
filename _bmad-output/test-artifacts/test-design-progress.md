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
  - "_bmad-output/implementation-artifacts/2-3-PriceSuggestionCard-기반-추천가-수용-수정-확정.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/risk-governance.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/probability-impact.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-levels-framework.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-priorities-matrix.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/playwright-cli.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/overview.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/api-request.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/selector-resilience.md"
---

# Test Design Progress: Epic 3 - 자동 가격조정 및 업데이트 신호

## Step 1 - Detect Mode & Prerequisites

- Mode: Epic-level.
- Reason: User explicitly requested `/bmad-testarch-test-design` equivalent for `Epic 3: 자동 가격조정 및 업데이트 신호`.
- Required inputs found:
  - Epic and story requirements with acceptance criteria in `_bmad-output/planning-artifacts/epics.md`.
  - Pricing contract and implementation baseline in `src/domain/pricing` and `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`.
  - PRD and architecture context in `_bmad-output/planning-artifacts`.
- Note: No dedicated Epic 3 story seed file was present in `_bmad-output/implementation-artifacts`; planning and current pricing artifacts were used instead.

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
  - E2E: `tests/e2e/price-suggestion-card-flow.spec.ts`
  - Unit/domain: `src/domain/pricing/pricing-suggestion.test.ts`
  - Contract: `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts`
  - Red-phase pricing artifacts: `_bmad-output/test-artifacts/red-phase/story-2-3`
- Browser exploration: skipped because no target URL or running dev server was provided. No Playwright CLI session was opened.
- Knowledge loaded:
  - Core epic-level fragments: risk governance, probability-impact, test-levels, test-priorities.
  - Browser/Playwright guidance: Playwright CLI, Playwright Utils overview, api-request, selector-resilience.

## Step 3 - Risk & Testability Assessment

- High risks identified:
  - R-001 duplicate or overlapping schedule execution applies the same price change more than once, score 9.
  - R-002 invalid rule configuration or boundary validation allows unsafe price adjustments, score 9.
  - R-003 floor-violation or stale rule handling still mutates price when it should skip, score 8.
  - R-004 applied adjustment event is emitted with missing or duplicate identifiers, score 6.
  - R-005 history and minimal signal records diverge from the actual applied change, score 6.
- Medium risks identified:
  - R-006 contract drift between pricing APIs/UI and the auto-adjust event schema.
  - R-007 access control or ownership rules expose another seller's rules/history.
  - R-008 scheduler timing, timezone, or clock skew causes wrong due-time evaluation.
  - R-009 accessibility or recoverability gaps in the rule form and history views.
- Key mitigation priority:
  - P0 tests should prove rule validation, single-apply idempotency, floor skipping, event emission integrity, and history/signal consistency.

## Step 4 - Coverage Plan & Execution Strategy

- Coverage matrix generated in `_bmad-output/test-artifacts/test-design-epic-3.md`.
- Priority distribution:
  - P0: 7 tests, ~12-22 hours.
  - P1: 10 tests, ~10-18 hours.
  - P2: 6 tests, ~6-12 hours.
  - P3: 2 activities, ~2-4 hours.
  - Total: ~30-56 hours, 약 1-2 weeks.
- Execution strategy:
  - PR: unit, component, API contract, and P0 E2E if the full set stays under ~15 minutes with Playwright parallelization.
  - Nightly: full scheduler/idempotency matrix, clock-skew variants, multi-listing batches, and perf smoke.
  - Weekly: exploratory mobile review, accessibility pass, and longer burn-in for retry and duplicate-run cases.
- Quality gates:
  - P0 100%.
  - P1 >= 95%.
  - auto-adjust single-apply rate 100%.
  - high-risk mitigations complete or approved waiver.

## Step 5 - Generate Output & Validate

- Final output written:
  - `_bmad-output/test-artifacts/test-design-epic-3.md`
- Progress file written:
  - `_bmad-output/test-artifacts/test-design-progress.md`
- Validation summary:
  - Epic-level template structure populated.
  - Risk assessment matrix includes unique IDs, categories, probability, impact, score, mitigation, owner, and timeline/action.
  - Coverage matrix maps `FR18-FR21` and `FR32` behaviors to P0-P3 scenarios.
  - Execution strategy uses PR/Nightly/Weekly model.
  - Resource estimates are ranges, not exact calculations.
  - No browser sessions opened, so no cleanup required.
  - Artifacts stored under `_bmad-output/test-artifacts`.
