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
storyId: "2.1"
storyKey: "2-1-photouploader-ai-draft-request"
storyTitle: "PhotoUploader 기반 이미지 업로드와 AI 초안 요청"
storyFile: "_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md"
inputDocuments:
  - "_bmad/config.yaml"
  - "_bmad/tea/config.yaml"
  - "package.json"
  - "playwright.config.ts"
  - "_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md"
  - "_bmad-output/test-artifacts/test-design-epic-2.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-api.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/photo-uploader-flow.red.spec.ts"
  - "_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-test-data.ts"
---

# Story 2.1 ATDD Checklist

## Scope

- 등록 플로우에서 유효한 상품 사진 업로드 시 AI 초안 생성 요청 상태를 명확히 표시한다.
- 형식 오류, 용량 초과, 손상 이미지 오류를 구분하고 즉시 재시도 CTA를 제공한다.
- AI 실패 또는 타임아웃 시 1탭 fallback으로 수동 입력 경로를 열고 등록 플로우를 차단하지 않는다.
- fallback 이후 늦게 도착한 AI 응답은 `requestVersion` 또는 `clientRequestId` 검증으로 폐기한다.
- 동일 `idempotencyKey` 중복 요청은 서버 처리 1회와 단일 사용자 결과 상태를 보장한다.

## Strategy

| AC | Level | Priority | Red-phase coverage |
| --- | --- | --- | --- |
| AC1 정상 이미지 업로드와 AI 요청 상태 | E2E + API | P0 | `photo-uploader-flow.red.spec.ts`, `ai-extraction-api.red.test.ts` |
| AC2 파일 오류 분류와 재시도 | E2E + API | P1 | `photo-uploader-flow.red.spec.ts`, `ai-extraction-api.red.test.ts` |
| AC3 AI 실패/타임아웃 fallback | E2E | P0 | `photo-uploader-flow.red.spec.ts` |
| AC4 fallback 이후 late response 무시 | E2E | P0 | `photo-uploader-flow.red.spec.ts` |
| AC5 idempotency 중복 요청 | API | P0 | `ai-extraction-api.red.test.ts` |

## Red-Phase Scaffolds

1. API contract red tests
- `POST /api/ai/extractions` 성공 envelope: `{ data, meta }`
- 오류 envelope: `{ error: { code, message, details?, requestId } }`
- `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `CORRUPTED_IMAGE` 분기
- 동일 idempotency key concurrent duplicate의 단일 terminal/in-flight 상태

2. Browser acceptance red tests
- `/listings/new`에서 PhotoUploader 파일 입력과 요청 상태 표시
- 오류 유형별 `role="alert"` 안내와 "다른 사진으로 재시도" CTA
- AI timeout/unavailable 후 "수동 입력으로 계속" 1탭 fallback
- fallback 이후 늦은 AI 응답이 제목/카테고리/핵심 스펙 수동 입력을 덮어쓰지 않음

3. Fixture infrastructure
- `ai-extraction-test-data.ts`는 red-phase API 계약에서 FormData, File, idempotency/request metadata를 생성한다.

## Generated Files

- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-test-data.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-api.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/photo-uploader-flow.red.spec.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/atdd-checklist-2-1-photouploader-ai-draft-request.md`

## Required Implementation Hooks

- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/shared/contracts/ai-extraction.ts`
- `src/app/api/ai/extractions/route.ts`
- `src/domain/ai-extraction/ai-extraction-validator.ts`
- `src/domain/ai-extraction/ai-extraction-service.ts`
- Optional infra adapter for idempotency persistence if in-memory deterministic fixture is insufficient for concurrent duplicate tests.

## Required Selectors And Labels

- Label: `상품 사진 업로드`
- Status region: `role="status"`
- Error region: `role="alert"`
- Retry CTA: button name `다른 사진으로 재시도`
- Fallback CTA: button name `수동 입력으로 계속`
- `data-testid="photo-uploader-request-state"` with values `validating`, `requesting`, `error`, `fallback`, `success`

## Validation

- Detected stack: fullstack (`package.json`, `playwright.config.ts`, Next app routes).
- Test framework: Playwright + Jest are configured.
- Generation mode: AI generation, because acceptance criteria and existing selector patterns are clear.
- Execution mode: sequential fallback, because this Codex runtime did not expose BMad subagent launch primitives.
- TDD red phase: all generated tests use `test.skip(...)` and assert expected behavior rather than placeholder assertions.
- CLI browser recording: not used; target component and selectors do not exist yet, so selector verification is documented as implementation requirements.
- Temp artifacts: no `/tmp` worker outputs retained; final artifacts are stored under `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/`.

## Next Steps

1. Implement the feature from contracts inward: shared contract -> validator/service -> route -> PhotoUploader UI.
2. Remove `test.skip(...)` one scenario at a time during green phase.
3. Run focused checks:
   - `pnpm unit`
   - `pnpm test:e2e -- _bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/photo-uploader-flow.red.spec.ts --project=chromium`
   - Jest focused run for `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-api.red.test.ts` if red-phase ignore rules are relaxed for green phase.

## Notes

- The tests intentionally remain skipped for ATDD red phase so current CI does not fail before implementation.
- The story file now carries `atdd-done` state for the BAD pipeline handoff.
