---
stepsCompleted:
  - "step-01-load-context"
  - "step-02-discover-tests"
  - "step-03-quality-evaluation"
  - "step-03f-aggregate-scores"
  - "step-04-generate-report"
lastStep: "step-04-generate-report"
lastSaved: "2026-04-22"
workflowType: "testarch-test-review"
inputDocuments:
  - "_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "_bmad-output/test-artifacts/red-phase/story-3-1/atdd-checklist-3-1-auto-price-adjustment-rule-setup.md"
  - "playwright.config.ts"
  - "package.json"
  - "src/domain/pricing/auto-adjust-rule.test.ts"
  - "src/feature/listing/actions/save-auto-adjust-rule.action.test.ts"
  - "src/infra/pricing/auto-adjust-rule.repository.test.ts"
  - "tests/e2e/auto-adjust-rule-flow.spec.ts"
---

# Test Review: Story 3.1 자동 가격조정 규칙 설정

**Date:** 2026-04-22
**Scope:** Story 3.1 focused test review
**Stack:** Next.js App Router, React, Jest unit/action/repository tests, Playwright E2E
**Recommendation:** Approve
**Coverage note:** `test-review` does not score requirements coverage. Requirements trace and coverage gates belong to the trace workflow.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 95 | A | No hard waits; E2E uses stable labels/test ids and scoped role locators |
| Isolation | 93 | A | Unit tests inject action/repository dependencies; DB-backed E2E creates its own listing |
| Maintainability | 94 | A | Rule flow helpers keep form setup centralized and assertions are acceptance-facing |
| Performance | 94 | A | Focused unit and E2E checks run quickly; no serial Playwright dependency added |
| **Overall** | **94** | **A** | Review findings applied and focused gates passed |

## Findings Applied

### MEDIUM: E2E did not assert field-level recovery guidance

- **Evidence:** `tests/e2e/auto-adjust-rule-flow.spec.ts` asserted the validation alert and preserved values after invalid input, but did not prove field-specific errors or the recovery guide were rendered.
- **Risk:** The server action could keep rejecting invalid input while the user-facing field guidance regressed.
- **Fix:** Added E2E assertions for the validation alert recovery guide and the period, discount, and floor helper texts.

### MEDIUM: Repository read path lacked unit coverage for reopen/prefill behavior

- **Evidence:** `src/infra/pricing/auto-adjust-rule.repository.test.ts` covered upsert and write failures, but not `findActiveByListingId`, which is the persistence path used by the rule setup page on revisit.
- **Risk:** Prefill behavior could break independently of save behavior.
- **Fix:** Added repository tests for active rule mapping and disabled-rule exclusion.

### LOW: No-active-rule invalid recovery branch was implicit only

- **Evidence:** Action tests covered preserving the last valid rule on invalid input, but not the first-save invalid case where there is no last valid rule to restore.
- **Risk:** A first-time user could lose attempted values needed to correct the form.
- **Fix:** Added an action test proving attempted invalid values remain available when no active rule exists yet.

## Test Inventory Reviewed

| File | Framework | Review Notes |
| --- | --- | --- |
| `src/domain/pricing/auto-adjust-rule.test.ts` | Jest | Valid normalization, invalid boundaries, unsafe floor/current-price combination, display helpers |
| `src/feature/listing/actions/save-auto-adjust-rule.action.test.ts` | Jest | Save success, invalid recovery, retryable persistence failure, first-save invalid recovery |
| `src/infra/pricing/auto-adjust-rule.repository.test.ts` | Jest | One active rule upsert, active read/prefill mapping, disabled rule exclusion, FK and retryable failures |
| `tests/e2e/auto-adjust-rule-flow.spec.ts` | Playwright | Save, invalid recovery, field guidance, detail summary, revisit prefill, keyboard focus order |

## Quality Criteria Assessment

| Criterion | Status | Notes |
| --- | --- | --- |
| Hard waits | PASS | No `waitForTimeout` or fixed sleep usage |
| Determinism | PASS | Stable listing data, scoped role locators, no randomness |
| Isolation | PASS | Unit tests inject dependencies; E2E creates a fresh listing |
| Network-first pattern | N/A | Story 3.1 flow is DB/server-action based and does not mock network routes |
| Fixture/helper use | PASS | E2E uses local helpers for listing creation and form filling |
| Explicit assertions | PASS | Tests assert persisted active state, field errors, recovery guide, prefill, and focus order |
| Performance | PASS | Focused checks are short and parallel-safe |
| Priority markers | WARN | Active tests do not encode P0/P1 IDs in names; red-phase ATDD artifacts retain priority mapping |

## Validation

- `pnpm unit --runTestsByPath src/domain/pricing/auto-adjust-rule.test.ts src/feature/listing/actions/save-auto-adjust-rule.action.test.ts src/infra/pricing/auto-adjust-rule.repository.test.ts` passed: 3 suites, 14 tests.
- `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm dev" pnpm test:e2e tests/e2e/auto-adjust-rule-flow.spec.ts --project=chromium` passed: 1 active test passed, 3 red-phase tests skipped.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Local shell warning remains: package requires Node `>=24.14.1 <25`; local shell used Node `v22.18.0`.
- Playwright/Next emitted `NO_COLOR` ignored warnings due to `FORCE_COLOR`; not test-failing.

## Residual Risk

- Full unit and Playwright suites were not rerun; this review ran focused Story 3.1 checks plus static gates.
- DB-backed E2E uses the configured/default `DATABASE_URL`; environments without a reachable database must keep the same intentional skip behavior or provide a test database.
- Scheduler, automatic price mutation, history, and `pricing.auto_adjust.applied.v1` coverage remain out of scope for Story 3.1 and belong to later Epic 3 stories.

## Decision

**Approve.** The concrete test-review gaps were addressed with focused test additions. No blocking Story 3.1 test quality issue remains.
