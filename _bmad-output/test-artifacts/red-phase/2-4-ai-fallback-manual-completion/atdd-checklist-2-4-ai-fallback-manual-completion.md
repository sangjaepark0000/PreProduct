---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: "2026-04-22"
workflowType: testarch-atdd
storyId: "2.4"
storyKey: "2-4-ai-fallback-manual-completion"
storyTitle: "AI 실패/저신뢰 1탭 수동 fallback 완주"
storyFile: "_bmad-output/implementation-artifacts/2-4-ai-실패-저신뢰-1탭-수동-fallback-완주.md"
inputDocuments:
  - "_bmad/config.yaml"
  - "_bmad/tea/config.yaml"
  - "package.json"
  - "playwright.config.ts"
  - "_bmad-output/implementation-artifacts/2-4-ai-실패-저신뢰-1탭-수동-fallback-완주.md"
  - "_bmad-output/test-artifacts/test-design-epic-2.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/create-listing-manual-fallback.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/manual-fallback-completion.red.spec.ts"
---

# Story 2.4 ATDD Checklist

## Scope

- AI timeout/unavailable 상태에서 "수동 입력으로 계속" CTA 1회 클릭만으로 같은 등록 폼에서 수동 입력을 계속한다.
- 저신뢰 AI 초안 또는 `fallbackRecommended=true` 성공 응답은 자동 확정값처럼 폼에 반영하지 않고 수동 fallback 선택지를 제공한다.
- fallback 이후 늦은 AI success/error는 사용자가 입력한 제목, 카테고리, 핵심 스펙, 가격, 상태를 덮어쓰거나 fallback 상태를 해제하지 않는다.
- fallback 수동 입력은 기존 `createListing` 서버 액션과 listing 저장 도메인 흐름을 그대로 사용하고, 저장 후 상세 페이지로 이동한다.
- fallback 경로의 필수 필드 검증과 저장 실패는 기존 Story 1.3/2.1 오류 표시, 입력 유지, 재시도 가능 패턴을 유지한다.

## Strategy

| AC | Level | Priority | Red-phase coverage |
| --- | --- | --- | --- |
| AC1 AI 실패/저신뢰 후 1탭 수동 전환 및 수동 완주 | E2E | P0 | `manual-fallback-completion.red.spec.ts` |
| AC2 fallback 수동 입력이 기존 createListing 흐름으로 저장되고 상세로 이동 | E2E + action contract | P0 | `manual-fallback-completion.red.spec.ts`, `create-listing-manual-fallback.red.test.ts` |
| AC3 late AI success/error가 fallback 입력과 상태를 덮지 않음 | E2E | P0 | `manual-fallback-completion.red.spec.ts` |
| AC4 저신뢰/fallbackRecommended 응답이 1탭 수동 CTA로 연결되고 자동 확정처럼 보이지 않음 | E2E | P0 | `manual-fallback-completion.red.spec.ts` |
| AC5 fallback 검증/저장 실패 시 입력 유지와 같은 화면 재시도 | E2E + action contract | P1 | `manual-fallback-completion.red.spec.ts`, `create-listing-manual-fallback.red.test.ts` |

## Red-Phase Scaffolds

1. Action/contract red tests
- fallback completion `FormData`가 기존 `title`, `category`, `keySpecificationsText`, `priceKrw`, `status` key로 `handleCreateListingSubmission`에 전달된다.
- 서버 액션 의존성 `createListing` 호출은 새 fallback 저장 API 없이 `initialStatus`/`currentStatus`를 포함한 기존 listing input shape을 사용한다.
- validation 실패와 retryable persistence 실패는 fallback 입력값을 보존한다.

2. Browser acceptance red tests
- AI timeout -> fallback CTA 1회 클릭 -> 제목/카테고리/핵심 스펙/가격/상태 수동 입력 -> 등록 -> 상세 페이지 확인
- low-confidence/fallbackRecommended success -> fallback CTA 표시 -> AI 초안 자동 확정 금지 -> 수동 completion
- fallback 후 late success가 제목/카테고리/핵심 스펙/가격/상태를 덮어쓰지 않음
- fallback 후 late error가 오류 상태로 되돌리지 않고 입력과 fallback state를 유지함
- fallback 필수 필드 누락 -> 기존 오류 요약/필드 오류 -> 입력 유지 -> 같은 화면 재시도 성공

## Generated Files

- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/create-listing-manual-fallback.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/manual-fallback-completion.red.spec.ts`
- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/atdd-checklist-2-4-ai-fallback-manual-completion.md`

## Required Implementation Hooks

- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/shared/contracts/ai-extraction.ts`
- `src/feature/listing/actions/create-listing.action.ts`
- `src/domain/listing/listing.service.ts`

## Required Selectors And Labels

- Label: `상품 사진 업로드`
- Fallback CTA: button name `수동 입력으로 계속`
- Submit CTA: button name `등록하고 상세 보기`
- Input labels: `제목`, `카테고리`, `핵심 스펙`, `가격 (원)`, `판매중`
- Detail test ids: `listing-detail-title`, `listing-detail-category`, `listing-detail-price`, `listing-detail-status`, `listing-detail-specification`
- Existing request state test id: `photo-uploader-request-state` with `fallback`

## Validation

- Detected stack: fullstack (`package.json`, `playwright.config.ts`, Next app routes).
- Test framework: Playwright + Jest are configured.
- Generation mode: AI generation. The target flows and selectors are already established by Story 1.3 and Story 2.1 tests, so browser recording was not required.
- Execution mode: sequential fallback. This runtime did not expose BMad subagent launch primitives.
- TDD red phase: all generated tests use `test.skip(...)` and assert expected behavior rather than placeholder assertions.
- CLI browser recording: not used; selector requirements are based on existing passing test patterns.
- Temp artifacts: no `/tmp` worker outputs retained; final artifacts are stored under `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/`.

## Running Tests

```bash
pnpm test:e2e -- _bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/manual-fallback-completion.red.spec.ts --project=chromium
pnpm jest --config jest.config.mjs --runTestsByPath _bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/create-listing-manual-fallback.red.test.ts
```

## Next Steps

1. Implement Story 2.4 from the current form/uploader boundary inward.
2. Remove `test.skip(...)` one scenario at a time during green phase.
3. Run focused checks:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm unit`
   - `pnpm contract`
   - `pnpm test:e2e -- tests/e2e/photo-uploader-flow.spec.ts --project=chromium`
   - Story 2.4 focused E2E after moving the red spec into the active test suite or unskipping it

## Notes

- The tests intentionally remain skipped for ATDD red phase so current CI does not fail before implementation.
- The story file now carries `atdd-done` state for the BAD pipeline handoff.
