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
storyId: "2.2"
storyKey: "2-2-extraction-field-editor-confirm"
storyTitle: "ExtractionFieldEditor 기반 초안 검토/수정/확정"
storyFile: "_bmad-output/implementation-artifacts/2-2-ExtractionFieldEditor-기반-초안-검토-수정-확정.md"
inputDocuments:
  - "_bmad/tea/config.yaml"
  - "package.json"
  - "playwright.config.ts"
  - "_bmad-output/implementation-artifacts/2-2-ExtractionFieldEditor-기반-초안-검토-수정-확정.md"
  - "src/shared/contracts/ai-extraction.ts"
  - "src/feature/listing/components/photo-uploader.client.tsx"
  - "src/feature/listing/components/listing-form.client.tsx"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-test-data.ts"
  - "_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai-extraction-reviewed-contract.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-flow.red.spec.ts"
  - "_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai.extraction.reviewed.v1.json"
---

# Story 2.2 ATDD Checklist

## Scope

- AI 초안을 최종 등록 폼에 즉시 반영하지 않고 `ExtractionFieldEditor`에서 먼저 검토한다.
- 제목, 카테고리, 핵심 스펙은 editor에서 수정 가능해야 하며 신뢰도는 색상 단독이 아닌 텍스트와 수치로 표시한다.
- 사용자가 확정 CTA를 선택한 경우에만 최종 `title`, `category`, `keySpecificationsText` 값에 반영한다.
- 필수 리뷰 필드가 비어 있으면 필드별 오류를 표시하고 최종 데이터 반영을 차단한다.
- `clientRequestId`, `idempotencyKey`, `requestVersion`이 맞는 초안만 editor에 반영하고 stale response가 수동 입력 또는 확정값을 덮어쓰지 못하게 한다.
- 확정 시 `ai.extraction.reviewed.v1` producer-ready 이벤트 payload와 deterministic `eventId`를 생성할 수 있어야 한다.

## Strategy

| AC | Level | Priority | Red-phase coverage |
| --- | --- | --- | --- |
| AC1 editor 렌더링, 수정 가능 필드, 텍스트 신뢰도 라벨 | E2E | P0 | `extraction-field-editor-flow.red.spec.ts` |
| AC2 확정 CTA 후 최종 form 반영, 확정 전 자동 덮어쓰기 금지 | E2E | P0 | `extraction-field-editor-flow.red.spec.ts` |
| AC3 필수 조건 미충족 시 필드별 오류와 반영 차단 | E2E | P0 | `extraction-field-editor-flow.red.spec.ts` |
| AC4 reviewed 이벤트 계약과 deterministic eventId | Contract/Unit | P0 | `ai-extraction-reviewed-contract.red.test.ts`, `ai.extraction.reviewed.v1.json` |
| AC5 requestVersion/clientRequestId stale 방어 | E2E | P0 | `extraction-field-editor-flow.red.spec.ts` |

## Red-Phase Scaffolds

1. Browser acceptance red tests
- AI 성공 응답 후 `ExtractionFieldEditor` 표시와 `높음 82%` 신뢰도 라벨 확인
- AI 초안 수신 직후 최종 등록 폼이 비어 있음을 확인
- editor 수정 후 확정 CTA로 최종 `제목`, `카테고리`, `핵심 스펙` 반영 확인
- 필수 field empty 상태에서 `role="alert"` 필드별 오류와 최종 반영 차단 확인
- stale response 또는 늦은 초안이 수동 입력/현재 editor 상태를 덮어쓰지 않음

2. Contract/unit red tests
- `ai.extraction.reviewed.v1` canonical fixture schema 검증
- draft와 confirmed fields 비교로 `acceptedFields`, `editedFields` 계산 검증
- 동일 `idempotencyKey` + `requestVersion` + 확정 field set에서 deterministic `eventId` 유지 검증

3. Fixture infrastructure
- `extraction-field-editor-test-data.ts`는 red-phase 이벤트 fixture, request metadata, AI draft, confirmed fields를 제공한다.
- `ai.extraction.reviewed.v1.json`은 green phase에서 `tests/contracts/fixtures/`로 승격할 canonical event fixture다.

## Generated Files

- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-test-data.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai-extraction-reviewed-contract.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-flow.red.spec.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai.extraction.reviewed.v1.json`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/atdd-checklist-2-2-extraction-field-editor-confirm.md`

## Required Implementation Hooks

- `src/feature/listing/components/extraction-field-editor.client.tsx`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/shared/contracts/ai-extraction.ts`
- `src/shared/contracts/events/ai-extraction-reviewed.v1.ts`
- `tests/e2e/extraction-field-editor-flow.spec.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- `tests/contracts/ai-extraction-reviewed.v1.contract.test.ts`
- `tests/contracts/fixtures/ai.extraction.reviewed.v1.json`

## Required Selectors And Labels

- Editor container: `data-testid="extraction-field-editor"`
- Confidence label: `data-testid="extraction-confidence-label"` with text such as `높음 82%`
- Confirm CTA: `data-testid="extraction-confirm-button"`
- Final form labels: `제목`, `카테고리`, `핵심 스펙`
- Error region: `role="alert"` scoped to editor
- Confirmation status: `role="status"` announcing review completion

## Validation

- Detected stack: fullstack (`package.json`, `playwright.config.ts`, Next app routes).
- Test framework: Playwright + Jest are configured.
- Generation mode: AI generation, because acceptance criteria and existing selector patterns are clear.
- Execution mode: sequential fallback, because this Codex runtime did not expose BMad subagent launch primitives.
- TDD red phase: all generated `.red.test.ts` and `.red.spec.ts` tests use `test.skip(...)` and assert expected behavior rather than placeholder assertions.
- CLI browser recording: not used; target component does not exist yet, so selector verification is documented as implementation requirements.
- Temp artifacts: no `/tmp` worker outputs retained; final artifacts are stored under `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/`.

## Next Steps

1. Implement from contracts inward: reviewed event schema/helper, AI extraction review types, editor component, listing form integration.
2. Promote skipped red tests into active locations one scenario at a time during green phase.
3. Remove `test.skip(...)` from one scenario at a time and run focused checks:
   - `pnpm unit`
   - Jest focused run for the promoted reviewed event contract/helper test
   - `pnpm test:e2e -- tests/e2e/extraction-field-editor-flow.spec.ts --project=chromium`
4. Update the active `tests/e2e/photo-uploader-flow.spec.ts` expectations so AI success displays the editor before final form reflection.

## Notes

- The tests intentionally remain skipped for ATDD red phase so current CI does not fail before implementation.
- The `@ts-expect-error` annotations in the red contract tests document missing Story 2.2 exports and should be removed when the green-phase contract module exists.
- Story 2.4 worktree and fallback-completion branch were not touched.
