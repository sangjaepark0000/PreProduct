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
  - "_bmad-output/implementation-artifacts/3-3-price-change-history-minimal-signal.md"
  - "_bmad-output/test-artifacts/red-phase/story-3-3/atdd-checklist-3-3-price-change-history-minimal-signal.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "package.json"
  - "playwright.config.ts"
  - "src/domain/pricing/price-change-history.test.ts"
  - "src/infra/pricing/price-change-history.repository.test.ts"
  - "src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts"
  - "tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.test.ts"
  - "tests/e2e/price-change-history-flow.spec.ts"
---

# Test Review: Story 3.3 가격 변경 이력 조회 및 최소 신호 수집

**Date:** 2026-04-22
**Scope:** Story 3.3 focused test review
**Stack:** Next.js App Router, Jest domain/repository/contract tests, Playwright E2E
**Recommendation:** Approve with fixes applied
**Coverage note:** `test-review` audits test quality and concrete uncovered risks. Requirements trace and coverage gates belong to the trace workflow.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 92 | A | Fixed timestamps and deterministic ordering; E2E no longer shares a static listing ID |
| Isolation | 90 | A | Jest tests use doubles; E2E seeds and cleans a unique listing per test |
| Maintainability | 89 | B+ | Tests stay focused on Story 3.3 acceptance behavior and contract boundaries |
| Performance | 92 | A | Focused Jest, contract, and two active browser checks remain small |
| **Overall** | **91** | **A** | Review findings applied and focused gates passed |

## Findings Applied

### HIGH: History ordering had no deterministic tie-breaker

- **Evidence:** The repository sorted only by `appliedAt desc`; rows with equal timestamps could render in database-dependent order.
- **Risk:** Seller-facing history and downstream signal review could appear unstable across repeated executions or DB plans.
- **Fix:** Added deterministic repository ordering by `appliedAt desc`, `createdAt desc`, and `id desc`, and updated the repository test to assert the ordered query and newest-first projection.

### MEDIUM: E2E used a shared static listing fixture

- **Evidence:** The browser test seeded the same UUID and run key every time.
- **Risk:** Parallel runs, interrupted cleanup, or another worktree using the same DB could collide and make the flow flaky.
- **Fix:** Switched the Story 3.3 E2E to generate a unique listing ID per test and clean only that listing's executions.

### MEDIUM: Empty history state was not actively covered

- **Evidence:** The page had an empty state, but the active E2E only covered a populated history.
- **Risk:** A listing with no applied adjustments could regress to a blank table or missing recovery text without test failure.
- **Fix:** Added a focused Playwright test for a listing with no applied price changes.

### MEDIUM: Minimal signal boundary did not lock the exact field set

- **Evidence:** Tests rejected mutable price fields but did not explicitly assert the canonical minimal signal keys or reject `appliedAt` leaking from history rows.
- **Risk:** The FR32 signal could drift toward the full history row contract.
- **Fix:** Added domain, schema, and contract assertions for the exact `listingId`, `updatedAt`, and `reasonCode` key set, plus rejection of history-row-only fields.

## Test Inventory Reviewed

| File | Framework | Review Notes |
| --- | --- | --- |
| `src/domain/pricing/price-change-history.test.ts` | Jest | History projection, same-source signal derivation, invalid reason rejection, exact signal keys |
| `src/infra/pricing/price-change-history.repository.test.ts` | Jest | Applied-record projection, deterministic query ordering, minimal signal derivation, incomplete record filtering |
| `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts` | Jest | Signal schema acceptance, exact field set, mutable/history field rejection |
| `tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.test.ts` | Jest | Canonical fixture acceptance, exact key set, extra field rejection |
| `tests/e2e/price-change-history-flow.spec.ts` | Playwright | Newest-first populated history, reason-code display, empty state, unique DB fixture per test |

## Quality Criteria Assessment

| Criterion | Status | Notes |
| --- | --- | --- |
| Hard waits | PASS | No `waitForTimeout` or fixed sleeps |
| Determinism | PASS | Fixed applied timestamps, unique E2E listing IDs, explicit repository tie-breakers |
| Isolation | PASS | Active browser tests seed and clean their own listing data |
| Explicit assertions | PASS | Assertions cover before/after prices, timestamps, reason codes, empty state, and strict signal fields |
| Fixture/helper use | PASS | E2E setup helpers keep seeding and cleanup localized |
| Flakiness patterns | PASS | No conditional assertion flow; DB-backed tests skip only when `DATABASE_URL` is absent |
| Priority markers | WARN | Active test names do not encode P0/P1 IDs; red-phase ATDD artifact retains priority mapping |

## Validation

- `pnpm exec jest --config jest.config.mjs --runTestsByPath src/domain/pricing/price-change-history.test.ts src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts src/infra/pricing/price-change-history.repository.test.ts tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.test.ts` passed: 4 suites, 12 tests.
- `pnpm contract` passed: 6 suites, 21 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `$env:PLAYWRIGHT_WEB_SERVER_COMMAND='pnpm dev'; pnpm exec playwright test tests/e2e/price-change-history-flow.spec.ts --project=chromium` passed: 2 active tests passed, 1 red-phase artifact skipped.
- Local shell warning remains: package requires Node `>=24.14.1 <25`; local shell used Node `v22.18.0`.

## Residual Risk

- Authorization and seller ownership checks for history routes remain outside this Story 3.3 test-review ownership unless the product surface introduces real authenticated sellers.
- The red-phase ATDD file under `_bmad-output/test-artifacts/red-phase/story-3-3/` remains intentionally skipped as a historical red-phase artifact; active coverage lives under `tests/e2e` and `tests/contracts`.

## Decision

**Approve with fixes applied.** The concrete Story 3.3 test-review gaps were addressed with focused tests and one scoped repository ordering adjustment.
