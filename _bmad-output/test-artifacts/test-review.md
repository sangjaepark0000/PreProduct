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
  - "_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md"
  - "_bmad-output/test-artifacts/red-phase/story-3-2/atdd-checklist-3-2-auto-price-adjustment-execution-reason-log.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "package.json"
  - "playwright.config.ts"
  - "src/domain/pricing/auto-adjust-execution.test.ts"
  - "src/infra/pricing/auto-adjust-execution.repository.test.ts"
  - "src/app/api/pricing/auto-adjust/route.test.ts"
  - "src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts"
  - "tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts"
---

# Test Review: Story 3.2 규칙 기반 자동 가격조정 실행 및 사유 기록

**Date:** 2026-04-22
**Scope:** Story 3.2 focused test review
**Stack:** Next.js App Router, Jest unit/repository/route tests, contract tests
**Recommendation:** Approve with fixes applied
**Coverage note:** `test-review` audits test quality and concrete uncovered risks. Requirements trace and coverage gates belong to the trace workflow.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 93 | A | Deterministic clocks and run keys; no hard waits |
| Isolation | 91 | A | Repository tests use injected Prisma transaction doubles; route tests mock the runner |
| Maintainability | 90 | A | Acceptance-critical scenarios are named by behavior and kept focused |
| Performance | 95 | A | Focused Jest and contract checks run quickly |
| **Overall** | **92** | **A** | Review findings applied and focused gates passed |

## Findings Applied

### HIGH: Repository treated every scheduler request as due

- **Evidence:** The repository passed `requestedAt` as both `dueAt` and `executedAt`, so a rule updated minutes ago could apply immediately despite `periodDays`.
- **Risk:** Automatic price changes could occur before the configured execution window.
- **Fix:** Added repository due-time derivation from active rule `updatedAt + periodDays` and a focused not-due skip test.

### HIGH: Stale scheduler rule revisions were not rejected at the repository boundary

- **Evidence:** The repository fetched the active rule and used that same revision as both requested and active revision, so an old scheduler request could apply the newer active rule instead of recording `stale-rule`.
- **Risk:** Superseded work could mutate listing price instead of being recorded as skipped.
- **Fix:** Added active-vs-requested rule revision comparison and a repository stale-rule skip test.

### HIGH: Already-applied partial failures could discount an already-mutated price again

- **Evidence:** Partial-failure retry always re-evaluated against the listing's current price and called `listing.update`.
- **Risk:** If the prior partial record already had `beforePriceKrw`, `afterPriceKrw`, and `appliedAt`, retry could apply a second discount.
- **Fix:** Added recovery from durable partial applied fields and a test proving no second listing update occurs.

### HIGH: Scheduler route lacked authorization coverage

- **Evidence:** `POST /api/pricing/auto-adjust` accepted any caller before parsing and running the scheduler command.
- **Risk:** Unauthorized callers could trigger price mutation attempts.
- **Fix:** Added a required bearer token (`AUTO_ADJUST_SCHEDULER_TOKEN`), fail-closed misconfiguration behavior, and route tests for authorized, unauthorized, and unconfigured paths.

## Test Inventory Reviewed

| File | Framework | Review Notes |
| --- | --- | --- |
| `src/domain/pricing/auto-adjust-execution.test.ts` | Jest | Due apply, floor skip, stale skip, duplicate run key, partial retry, not-due skip |
| `src/infra/pricing/auto-adjust-execution.repository.test.ts` | Jest | Durable run claim, duplicate guard, due-time skip, stale skip, floor skip, partial recovery |
| `src/app/api/pricing/auto-adjust/route.test.ts` | Jest | Scheduler route result mapping, invalid request handling, bearer-token authorization |
| `src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts` | Jest | Canonical event shape, deterministic event id, invalid payload rejection |
| `tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts` | Jest | Contract fixture acceptance and required execution fields |

## Quality Criteria Assessment

| Criterion | Status | Notes |
| --- | --- | --- |
| Hard waits | PASS | No `waitForTimeout` or fixed sleep usage in active tests |
| Determinism | PASS | Stable timestamps, rule revisions, run keys, and deterministic event IDs |
| Isolation | PASS | Tests use mocks/doubles and do not require DB or browser state |
| Explicit assertions | PASS | Assertions cover status, reason codes, mutation/no-mutation, event ids, and auth outcomes |
| Fixture/helper use | PASS | Route request helper centralizes auth headers; canonical contract fixture is stable |
| Flakiness patterns | PASS | No time-dependent wall-clock assertions or conditional test flow |
| Priority markers | WARN | Active test names do not encode P0/P1 IDs; red-phase ATDD artifact retains priority mapping |

## Validation

- `pnpm exec jest --config jest.config.mjs --runTestsByPath src/domain/pricing/auto-adjust-execution.test.ts src/infra/pricing/auto-adjust-execution.repository.test.ts src/app/api/pricing/auto-adjust/route.test.ts src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts` passed: 5 suites, 24 tests.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- Local shell warning remains: package requires Node `>=24.14.1 <25`; local shell used Node `v22.18.0`.

## Residual Risk

- Full Playwright E2E was not run; Story 3.2's generated E2E artifact remains red-phase/skipped and would need real seeded data plus scheduler auth headers to become active.
- Repository tests use Prisma doubles, not a live database transaction; this is appropriate for focused test review but does not replace a later DB-backed integration check.

## Decision

**Approve with fixes applied.** The concrete Story 3.2 test-review gaps were addressed with focused tests and scoped implementation changes.
