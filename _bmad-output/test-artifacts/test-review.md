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
  - "_bmad-output/implementation-artifacts/2-3-PriceSuggestionCard-기반-추천가-수용-수정-확정.md"
  - "_bmad-output/test-artifacts/atdd-checklist-2.3.md"
  - "playwright.config.ts"
  - "package.json"
  - "tests/e2e/price-suggestion-card-flow.spec.ts"
  - "tests/e2e/listing-registration.spec.ts"
  - "tests/e2e/photo-uploader-flow.spec.ts"
  - "tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts"
  - "src/domain/pricing/pricing-suggestion.test.ts"
---

# Test Review: Story 2.3 PriceSuggestionCard 기반 추천가 수용/수정 확정

**Date:** 2026-04-22
**Scope:** Story 2.3 focused test review
**Stack:** Next.js App Router, React, Jest unit/contract tests, Playwright E2E
**Recommendation:** Approve
**Coverage note:** `test-review`는 coverage를 점수화하지 않는다. 요구사항 추적과 coverage gate는 `trace` 워크플로우에서 다룬다.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 96 | A | No hard waits, no random data, fixed event timestamp in contract test |
| Isolation | 94 | A | UI tests use per-test page state; auth fixture is localStorage-scoped through `addInitScript` |
| Maintainability | 93 | A | Shared listing-basis helper now accepts the title used by submit assertions |
| Performance | 95 | A | Focused Playwright run completed in 12.1s; no serial constraints or expensive repeated setup beyond DB-gated submit test |
| **Overall** | **95** | **A** | Review finding applied and all focused gates passed |

## Findings Applied

### HIGH: Story E2E did not prove accepted suggested price submission

- **Evidence:** `tests/e2e/price-suggestion-card-flow.spec.ts` asserted that accepting the suggestion updated the read-only `priceKrw` field, but it did not submit the form and verify the persisted listing detail price. The story testing requirement explicitly calls for final `priceKrw` submission reflection.
- **Risk:** A regression could keep the UI confirmation state green while breaking the actual `FormData` submit path used by `createListing`.
- **Fix:** Added a DB-gated focused E2E at `tests/e2e/price-suggestion-card-flow.spec.ts:19` that accepts the suggested price, submits the listing, and verifies the detail page price is `1,240,000원`.
- **Follow-up found during fix:** The first draft of the new test changed the title after suggestion generation, correctly triggering stale revision protection. The helper now accepts the final title up front so the submission assertion exercises the valid accept path.

## Test Inventory Reviewed

| File | Lines | Framework | Tests | Review Notes |
| --- | ---: | --- | ---: | --- |
| `tests/e2e/price-suggestion-card-flow.spec.ts` | 150 | Playwright | 6 | Accept, submit/detail persistence, manual edit, validation, auth recovery, stale revision |
| `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts` | 45 | Jest | 3 | Canonical fixture, deterministic event id, required revision/idempotency fields |
| `src/domain/pricing/pricing-suggestion.test.ts` | 46 | Jest | 2 | Deterministic basis revision, suggestion amount, client price policy guard |
| `tests/e2e/listing-registration.spec.ts` | 123 | Playwright | 2 | Existing DB-backed submit/detail path remains aligned with price card manual confirmation |
| `tests/e2e/photo-uploader-flow.spec.ts` | 429 | Playwright | 9 | Existing fallback completion tests updated by dev to confirm manual price before submit |

## Quality Criteria Assessment

| Criterion | Status | Notes |
| --- | --- | --- |
| Network-first pattern | PASS | AI route mocks in adjacent regression tests are installed before upload/navigation triggers |
| Hard waits | PASS | No `waitForTimeout` or fixed sleeps in Story 2.3 active tests |
| Determinism | PASS | Stable test data; event deterministic checks use fixed inputs |
| Isolation | PASS | No test order dependency; DB-backed submit test is skipped when `DATABASE_URL` is absent |
| Fixture/helper use | PASS | Shared `fillConfirmedListingBasis` reduces repeated form setup |
| Explicit assertions | PASS | Price card tests assert field values, event id absence/presence, stale/auth alerts, and detail price |
| Performance | PASS | Focused Playwright run is short; no unnecessary serial mode |
| Priority markers | WARN | Active file names do not encode P0/P1 markers, but the ATDD red-phase artifacts retain priority labels |

## Best Practices Found

- The stale suggestion test mutates core listing fields after suggestion generation and verifies no event id is produced.
- The auth recovery test uses a typed fixture branch and asserts seller input is retained without creating an event.
- Contract tests assert both canonical schema acceptance and deterministic producer helper behavior.
- Client/domain price policy tests compare against the listing creation schema so the UI guard does not drift looser than server validation.

## Validation

- `pnpm typecheck` passed. Node engine warning remains: current `v22.18.0`, package requires `>=24.14.1 <25`.
- `pnpm lint` passed with the same Node engine warning.
- `pnpm unit` passed: 14 suites, 45 tests.
- `pnpm contract` passed: 4 suites, 15 tests.
- `pnpm perf-budget` passed, including `next build` and budget probe. Same Node engine warning.
- Focused Playwright passed: `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm dev" pnpm exec playwright test tests/e2e/price-suggestion-card-flow.spec.ts --project=chromium` -> 6 passed, 5 ATDD red-phase tests skipped.
- Playwright/Next emitted `NO_COLOR` ignored warnings due to `FORCE_COLOR`; not test-failing.

## Residual Risk

- Full Playwright suite was not rerun in this review; focused Story 2.3 E2E plus related unit/contract/perf gates passed.
- Local shell Node remains below the package engine range. CI/release should use Node `>=24.14.1 <25`.
- The DB-backed submit assertion requires a reachable `DATABASE_URL`; without it, the test is intentionally skipped like existing listing registration E2E.

## Decision

**Approve.** The main review gap was a missing persisted submission assertion for accepted suggested price. That test is now present, verified, and scoped to the existing DB-backed E2E pattern. No blocking test quality issues remain.
