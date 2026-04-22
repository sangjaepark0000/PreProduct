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
  - "_bmad/tea/config.yaml"
  - "_bmad-output/implementation-artifacts/2-4-ai-실패-저신뢰-1탭-수동-fallback-완주.md"
  - "_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/atdd-checklist-2-4-ai-fallback-manual-completion.md"
  - "playwright.config.ts"
  - "tests/README.md"
  - "tests/e2e/photo-uploader-flow.spec.ts"
  - "src/feature/listing/actions/create-listing.action.test.ts"
  - "tests/support/helpers/ai-extraction.ts"
---

# Test Review: Story 2.4 AI 실패/저신뢰 1탭 수동 fallback 완주

**Date:** 2026-04-22
**Scope:** Story 2.4 focused test review
**Stack:** Next.js App Router, React, Jest unit/contract tests, Playwright E2E
**Recommendation:** Approve
**Coverage note:** `test-review`는 coverage를 점수화하지 않는다. 요구사항 추적과 coverage gate는 `trace` 워크플로우에서 다룬다.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 98 | A | Story 2.4 active E2E에서 불필요한 `Date.now()` title suffix 제거, hard wait 없음 |
| Isolation | 96 | A | AI route mock은 test-local, persistence E2E는 Playwright web server env로 DB URL 고정 |
| Maintainability | 94 | A | AI response helper 재사용, fallback completion helper로 반복 입력 축소 |
| Performance | 95 | A | focused Playwright 9 tests 11.5초, 불필요한 serial 제약 없음 |
| **Overall** | **96** | **A** | Review findings applied and verified |

## Findings Applied

### HIGH: Playwright web server did not receive `DATABASE_URL`

- **Evidence:** Developer isolated rerun was 7/9 passed. The two Story 2.4 submit/detail completion tests failed because the launched Next runtime rejected listing saves with `DATABASE_URL is required to use the Prisma listing repository.`
- **Risk:** AC1/AC2 require fallback path completion through the existing `createListing` and Prisma-backed listing flow. Without a DB URL in the web-server runtime, E2E could only prove fallback UI state, not saved listing completion.
- **Fix:** `playwright.config.ts` now sets `process.env.DATABASE_URL` when missing and passes the same value through `webServer.env`, using the local `.env.example` Postgres default. `tests/README.md` documents the DB requirement and fallback.
- **Verification:** Focused Playwright rerun with shell `DATABASE_URL` explicitly cleared passed 9/9 on isolated port `3104`.

### MEDIUM: Story 2.4 E2E titles used `Date.now()` unnecessarily

- **Evidence:** New fallback completion tests used time-derived titles only for uniqueness, but listing title uniqueness is not required.
- **Risk:** Current time dependencies are minor here, but they reduce determinism and make trace comparisons noisier.
- **Fix:** Replaced the Story 2.4 dynamic title suffixes with stable scenario-specific strings in `tests/e2e/photo-uploader-flow.spec.ts`.

## Test Inventory Reviewed

| File | Lines | Framework | Tests | Review Notes |
| --- | ---: | --- | ---: | --- |
| `tests/e2e/photo-uploader-flow.spec.ts` | 423 | Playwright | 9 | Timeout fallback completion, low-confidence fallback choice, late success/error preservation, retry/file-error regressions |
| `src/feature/listing/actions/create-listing.action.test.ts` | 213 | Jest | 7 | Existing createListing input shape, validation preservation, retryable persistence failure |
| `tests/support/helpers/ai-extraction.ts` | 98 | Playwright helper | N/A | Deterministic AI success/timeout/low-confidence response builders |
| `playwright.config.ts` | 63 | Playwright config | N/A | Artifact config, isolated baseURL support, web-server DB env propagation |

## Quality Criteria Assessment

| Criterion | Status | Notes |
| --- | --- | --- |
| Network-first pattern | PASS | All AI routes are installed before `page.goto()` or upload trigger |
| Hard waits | PASS | No `waitForTimeout` in reviewed Story 2.4 active tests |
| Determinism | PASS | New Story 2.4 current-time title suffixes removed |
| Isolation | PASS | Route mocks are per-test; Playwright web server receives deterministic DB env |
| Fixture/helper use | PASS | Shared AI helpers and `fillManualListingFields` reduce copy/paste |
| Explicit assertions | PASS | Save/detail tests assert URL, title, category, price, status, and specs |
| Performance | PASS | 9 focused E2E tests completed in 11.5s on chromium |

## Best Practices Found

- Fallback completion assertions include the actual detail page, not just editable form state.
- Low-confidence AI draft test proves the draft is not applied as confirmed form data.
- Late success and late error tests protect manual title/category/spec/price/status values after fallback.
- Unit coverage verifies manual fallback submission still uses existing `title`, `category`, `keySpecificationsText`, `priceKrw`, and `status` form keys with no fallback-only save API.

## Validation

- `pnpm lint` passed. Node engine warning remains: current `v22.18.0`, package requires `>=24.14.1 <25`.
- `pnpm typecheck` passed with the same Node engine warning.
- `pnpm unit` passed: 12 suites, 41 tests.
- `pnpm contract` passed: 2 suites, 10 tests.
- Focused Playwright passed with shell `DATABASE_URL` cleared: `BASE_URL=http://127.0.0.1:3104`, `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm exec next dev --hostname 127.0.0.1 --port 3104"`, `pnpm test:e2e -- tests/e2e/photo-uploader-flow.spec.ts --project=chromium`: 9 passed.
- Playwright/Next emitted `NO_COLOR` ignored warnings due to `FORCE_COLOR`; not test-failing.

## Residual Risk

- Full suite E2E was not rerun in this review. The focused Story 2.4 file now covers the previously blocked persistence path.
- The local machine still uses Node `v22.18.0`; release/CI should use Node `24.14.1` per `.nvmrc` and `package.json` engines.
- The Playwright DB fallback assumes a reachable local Postgres instance at the documented `.env.example` URL. CI should set an explicit `DATABASE_URL`.

## Decision

**Approve.** The blocking Story 2.4 test-environment gap was fixed, the active Story 2.4 E2E tests are deterministic enough for focused regression, and lint/typecheck/unit/contract/focused E2E all passed.
