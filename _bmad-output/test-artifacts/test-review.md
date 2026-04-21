---
stepsCompleted:
  - "step-01-load-context"
  - "step-02-discover-tests"
  - "step-03-quality-evaluation"
  - "step-03f-aggregate-scores"
  - "step-04-generate-report"
lastStep: "step-04-generate-report"
lastSaved: "2026-04-22"
inputDocuments:
  - "_bmad/tea/config.yaml"
  - "_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md"
  - "_bmad-output/test-artifacts/test-design-epic-2.md"
  - "tests/e2e/photo-uploader-flow.spec.ts"
  - "tests/contracts/ai-extraction-api.contract.test.ts"
  - "src/feature/listing/components/photo-uploader.client.tsx"
---

# Test Review: Story 2.1 PhotoUploader 기반 이미지 업로드와 AI 초안 요청

**Date:** 2026-04-22
**Scope:** Story 2.1 focused test review
**Stack:** Next.js App Router, React, Jest contract tests, Playwright E2E
**Coverage note:** `test-review`는 coverage를 점수화하지 않는다. 요구사항 추적과 coverage gate는 `trace` 워크플로우에서 다룬다.

## Score Summary

| Dimension | Score | Grade | Notes |
| --- | ---: | --- | --- |
| Determinism | 98 | A | hard wait 제거, controlled deferred response 사용 |
| Isolation | 96 | A | route mock은 test-local, idempotency contract는 beforeEach reset |
| Maintainability | 94 | A | 반복 AI fixture helper를 `tests/support/helpers/ai-extraction.ts`로 분리 |
| Performance | 96 | A | focused E2E 5 tests ~9초, 불필요한 timeout 대기 없음 |
| **Overall** | **96** | **A** | Critical findings resolved |

## Findings Applied

### HIGH: stale error response can overwrite newer upload state

- **Evidence:** `PhotoUploader`는 success branch에서만 `clientRequestId`/`requestVersion`/fallback 상태를 검증했다. 이전 업로드의 late 4xx/5xx response나 abort catch가 새 업로드 성공 상태를 `error`로 덮을 수 있었다.
- **Fix:** `isCurrentRequest()` guard를 공통화하고 non-OK response, catch branch, validating-to-requesting transition에도 적용했다. 새 업로드 시작 시 이전 `AbortController`도 취소한다.
- **Regression:** `keeps the newer upload result when an older request fails late` E2E 추가.

### HIGH: success E2E did not prove successful draft application

- **Evidence:** 기존 success mock은 실제 client-generated `clientRequestId`와 다른 값을 반환했다. UI는 response를 stale로 폐기했지만 테스트는 `requesting` 상태까지만 확인해 green이 가능했다.
- **Fix:** multipart form data에서 `clientRequestId`, `idempotencyKey`, `requestVersion`을 읽어 mock response에 echo한다.
- **Regression:** success 상태와 제목/카테고리/핵심 스펙 form 적용까지 검증한다.

### MEDIUM: fixed timer in route mock reduced determinism

- **Evidence:** E2E route handler가 `setTimeout(500)` hard delay에 의존했다.
- **Fix:** controlled deferred promise로 전환해 요청 중 상태를 명시적으로 확인한 뒤 response를 release한다.

### LOW: E2E fixture duplication reduced readability

- **Evidence:** AI success/timeout response shape가 spec 내부에 반복되며 파일 길이가 증가했다.
- **Fix:** `tests/support/helpers/ai-extraction.ts` helper로 fixture construction and multipart metadata parsing을 분리했다.

## Test Inventory Reviewed

| File | Lines | Framework | Tests | Review Notes |
| --- | ---: | --- | ---: | --- |
| `tests/e2e/photo-uploader-flow.spec.ts` | 245 | Playwright | 5 | P0/P1 upload, fallback, stale response, stale error coverage |
| `tests/contracts/ai-extraction-api.contract.test.ts` | 178 | Jest | 4 | success/error envelope, idempotency, schema rejection |

## Validation

- `pnpm lint` passed. Node engine warning remains: current `v22.18.0`, package requires `>=24.14.1 <25`.
- `pnpm typecheck` passed with the same Node engine warning.
- `pnpm unit` passed: 12 suites, 40 tests.
- `pnpm contract` passed: 2 suites, 8 tests.
- Focused Playwright passed with isolated server: `BASE_URL=http://127.0.0.1:3101`, `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm exec next dev --hostname 127.0.0.1 --port 3101"`, `pnpm test:e2e -- tests/e2e/photo-uploader-flow.spec.ts --project=chromium`: 5 passed.
- `pnpm perf-budget` passed. It ran `next build` and the local perf smoke within budget.
- `pnpm test:ci` without env isolation failed against a stale/broken port 3000 Next chunk. Rerun with isolated port reached the correct app but older listing persistence E2Es failed because `DATABASE_URL` is not set in this shell. Story 2.1 focused E2Es passed under the isolated server.

## Recommendation

Before release-level `test:ci`, run with a clean server port and the expected test database environment. No additional Story 2.1 test-review blockers remain.
