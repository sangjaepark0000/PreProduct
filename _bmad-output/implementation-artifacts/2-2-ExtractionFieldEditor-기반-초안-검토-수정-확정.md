# Story 2.2: ExtractionFieldEditor 기반 초안 검토/수정/확정

Status: atdd-done

## Story

As a 판매 사용자,
I want AI가 제시한 제목/카테고리/핵심 스펙을 수정 후 확정하고 싶다,
so that 최종 정보에 대한 통제권을 유지할 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Feature
**FR Trace:** FR9, FR10, FR13, FR16, FR23

## Acceptance Criteria

1. **Given** AI 초안이 생성되어 편집 화면에 표시되었을 때
   **When** `ExtractionFieldEditor`가 제목/카테고리/핵심 스펙 초안을 렌더링하면
   **Then** 사용자는 각 필드를 검토하고 수정할 수 있다
   **And** AI 신뢰도/확신도 라벨이 색상 단독이 아닌 텍스트와 함께 표시된다.
2. **Given** 사용자가 AI 초안 필드를 수정했을 때
   **When** 확정 CTA를 선택하면
   **Then** 수정값이 최종 등록 폼 데이터(`title`, `category`, `keySpecificationsText`)에 반영된다
   **And** 기존 수동 입력값은 사용자 명시 확정 전까지 AI 응답으로 덮어쓰지 않는다.
3. **Given** 확정 대상 필드가 필수 조건을 만족하지 못할 때
   **When** 사용자가 확정을 시도하면
   **Then** 제목, 카테고리, 핵심 스펙 1개 이상 오류가 필드별로 표시된다
   **And** 저장/가격 단계로 넘어가는 최종 데이터 반영은 차단된다.
4. **Given** 사용자가 초안을 확정했을 때
   **When** 시스템이 리뷰 완료 상태를 기록하면
   **Then** `ai.extraction.reviewed.v1` 계약에 맞는 이벤트 페이로드를 생성할 수 있다
   **And** 동일 초안/동일 확정 재시도에서 단일 `eventId`를 유지한다.
5. **Given** 사용자가 fallback 또는 직접 입력 경로를 사용 중일 때
   **When** 지연된 AI 응답이나 새 AI 초안이 도착하면
   **Then** `requestVersion`/`clientRequestId`가 현재 편집 세션과 맞는 경우에만 리뷰 editor에 표시된다
   **And** 이미 사용자가 확정한 값이나 편집 중인 값을 자동으로 덮어쓰지 않는다.

Coverage: FR9, FR10, FR13, FR16, FR23, NFR9, NFR10, NFR11

## Tasks / Subtasks

- [ ] `ExtractionFieldEditor` UI를 등록 플로우에 추가한다. (AC: 1, 2, 5)
  - [ ] `src/feature/listing/components/extraction-field-editor.client.tsx`를 생성하고 제목, 카테고리, 핵심 스펙 편집 상태와 확정 CTA를 제공한다.
  - [ ] `src/feature/listing/components/listing-form.client.tsx`에서 `PhotoUploader`의 `onDraftReady`가 곧바로 최종 입력을 채우는 현재 동작을 변경해, 초안을 먼저 `ExtractionFieldEditor`로 전달한다.
  - [ ] 사용자가 `ExtractionFieldEditor`에서 확정한 값만 기존 `TextField`들의 최종 form state에 반영한다.
  - [ ] 이미 수동 입력된 최종 필드는 새 AI 응답으로 자동 덮어쓰지 않는다. 단, 사용자가 editor에서 확정하면 확정값을 반영한다.
  - [ ] 모바일 320-767px에서 필드, 확정 CTA, 재편집/닫기 CTA는 44x44 이상 터치 타깃과 키보드 포커스를 유지한다.

- [ ] AI 초안 상태와 리뷰 세션 계약을 명확히 한다. (AC: 1, 2, 4, 5)
  - [ ] `src/shared/contracts/ai-extraction.ts`에 필요 최소 타입을 추가한다: `AiExtractionReviewInput`, `AiExtractionReviewedEvent`, `confidenceLabel` 또는 동등한 enum/derived helper.
  - [ ] 기존 `AiExtractionDraft`의 `confidence`는 0-1 숫자 그대로 유지하고, UI 라벨은 별도 helper에서 파생한다.
  - [ ] `clientRequestId`, `idempotencyKey`, `requestVersion`을 editor state에 보존해 stale response와 reviewed event dedupe에 사용한다.
  - [ ] 외부 AI 벤더, DB 영속화, 운영 대시보드, 고급 이벤트 수집 파이프라인은 구현하지 않는다. 이 스토리는 프론트 리뷰 확정과 계약/fixture 수준 producer 준비가 범위다.

- [ ] 확정 검증과 최종 form 반영 규칙을 구현한다. (AC: 2, 3)
  - [ ] 제목과 카테고리는 trim 후 1자 이상이어야 한다.
  - [ ] 핵심 스펙은 줄 단위로 trim/filter 처리해 1개 이상이어야 한다.
  - [ ] 검증 실패 시 MUI `TextField` error/helperText 또는 `FormControl` error 패턴을 사용하고, `role="alert"` 또는 `aria-live`로 오류를 전달한다.
  - [ ] 최종 저장 검증은 기존 `src/domain/listing/listing.ts`의 `createListingInputSchema`와 중복되지 않도록 동일 의미의 클라이언트 검증만 둔다.
  - [ ] 확정 후 기존 `ListingSubmitBar`와 `create-listing.action.ts` 저장 경로를 그대로 사용한다.

- [ ] `ai.extraction.reviewed.v1` 계약과 최소 producer helper를 추가한다. (AC: 4)
  - [ ] `src/shared/contracts/events/ai-extraction-reviewed.v1.ts`를 생성한다.
  - [ ] 공통 이벤트 필드는 아키텍처 규칙을 따른다: `eventId`, `occurredAt`, `traceId`, `schemaVersion`.
  - [ ] 페이로드에는 최소 `clientRequestId`, `idempotencyKey`, `requestVersion`, `acceptedFields`, `editedFields`, `confidence`, `fallbackRecommended`를 포함한다.
  - [ ] 동일 `idempotencyKey` + `requestVersion` + 확정 필드 해시 또는 동등한 deterministic key에서 같은 `eventId`가 나오도록 helper를 설계한다.
  - [ ] Epic 4 소유 범위인 수집/경보/대시보드 route는 추가하지 않는다.

- [ ] 테스트를 확장해 리뷰/수정/확정 회귀를 고정한다. (AC: 1, 2, 3, 4, 5)
  - [ ] `tests/e2e/extraction-field-editor-flow.spec.ts`를 추가해 AI 초안 표시, 신뢰도 라벨 표시, 수정 후 확정, 최종 저장 반영을 검증한다.
  - [ ] `tests/e2e/photo-uploader-flow.spec.ts`의 기존 기대값을 갱신한다. AI 응답 직후 최종 form 자동 반영을 기대하지 말고 editor 표시 후 확정 흐름을 기대해야 한다.
  - [ ] `tests/contracts/ai-extraction-reviewed.v1.contract.test.ts`와 fixture를 추가해 event schema와 deterministic `eventId`를 고정한다.
  - [ ] `src/shared/contracts/events/ai-extraction-reviewed.v1.test.ts` 또는 domain/helper unit test로 edited/accepted field 계산을 검증한다.
  - [ ] 회귀 게이트를 통과해야 한다: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm contract`, `pnpm test:ci`, `pnpm perf-budget`.

## Dev Notes

### Epic Context

- Epic 2는 `사진 업로드 -> AI 검토/수정 -> 추천가 확정 -> 요약/등록` 흐름을 Active MVP 범위로 구현한다.
- Story 2.1은 `PhotoUploader`, `/api/ai/extractions`, AI extraction 계약, fallback/late response/idempotency 기본 규칙을 완료했다.
- Story 2.2는 AI 초안을 "즉시 최종값으로 적용"하는 경험을 "검토/수정/확정 후 최종값 반영"으로 바꾸는 스토리다.
- Story 2.3은 확정된 상품 정보 기반 추천가를 다룬다. 이 스토리에서 가격 추천 UI나 가격 이벤트를 구현하지 않는다.
- Story 2.4 작업트리/브랜치와 충돌하지 않는다. fallback 완주 고도화는 2.4 범위이며, 2.2는 지연 응답이 편집/확정 상태를 덮어쓰지 않는 방어만 포함한다.

### Current Codebase Intelligence

- 앱 코드는 repo-root `src/`에 있다. `preproduct/src`, `src/app/(app)`, `src/app/api/listings/drafts`, `src/app/api/decision-cards` 경로를 만들지 않는다.
- 현재 등록 화면은 `src/app/listings/new/page.tsx`가 서버 액션을 만들고 `src/feature/listing/components/listing-form.client.tsx`를 렌더링한다.
- 현재 `ListingDraftFields.applyAiDraft()`는 빈 최종 필드에 AI 초안을 즉시 반영한다. 이 동작이 Story 2.2의 주요 변경 지점이다.
- `PhotoUploader`는 성공 응답의 `body.data.draft`만 부모로 넘긴다. 2.2에서는 stale 방어와 reviewed event 준비를 위해 draft와 함께 `clientRequestId`, `idempotencyKey`, `requestVersion` 메타를 부모/editor에 전달해야 한다.
- `src/shared/contracts/ai-extraction.ts`는 `AiExtractionDraft`에 `title`, `category`, `keySpecifications`, `confidence`, `fallbackRecommended`를 이미 정의한다.
- 기존 E2E `tests/e2e/photo-uploader-flow.spec.ts`는 AI 성공 직후 제목/카테고리/핵심 스펙 입력값이 채워진다고 검증한다. 2.2 구현 후 이 테스트는 editor 확정 흐름으로 갱신해야 한다.

### Architecture Compliance (Must Follow)

- 레이어 경계: `feature -> domain -> infra`만 허용한다. `feature -> infra` 직접 import 금지.
- 계약 우선순위: `contracts -> adapters/helpers -> handlers -> UI`.
- API 규약: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`를 유지한다.
- 이벤트 공통 필드: `eventId`, `occurredAt(UTC)`, `traceId`, `schemaVersion`.
- MVP 이벤트 최소셋에는 `ai.extraction.reviewed.v1`가 포함된다. 단, Epic 4가 수집 관측/무결성 검증/경보를 소유하므로 2.2는 계약과 producer-ready helper까지만 만든다.
- Scope 우선순위는 `Active MVP > Deferred P1.5+ > Legacy Reference`다. DecisionCard/FitCriteriaPanel/Partner/Ops/Experiment full model은 이 스토리 구현 근거로 사용하지 않는다.
- AI 제안은 참고 정보이며 사용자 최종 확정 책임 경계를 숨기지 않는다.

### UX Requirements

- MVP 핵심 컴포넌트 중 이 스토리의 대상은 `ExtractionFieldEditor`다.
- 한 화면에서 요구하는 핵심 결정은 "초안 정보 확정" 하나로 유지한다.
- AI 제안은 항상 수정 가능 상태로 노출한다.
- 신뢰도/확신도는 예: `높음 82%`, `보통 64%`, `낮음 42%`처럼 텍스트와 숫자로 표시한다. 색상만으로 의미를 전달하지 않는다.
- 확정 전 상태와 확정 완료 상태가 스크린 리더에 전달되어야 한다. `role="status"`, `aria-live`, 필드별 helper text를 활용한다.
- UI는 기존 MUI 컴포넌트와 `sx` 패턴을 우선 사용한다. 별도 CSS module은 기존 listing 컴포넌트 패턴과 충돌하므로 필요할 때만 추가한다.

### Technical Requirements

- `ExtractionFieldEditor`는 controlled state로 동작해야 하며, 최종 form fields와 초안 review fields를 분리한다.
- `onDraftReady`는 새 초안을 editor에 세팅하되, 사용자가 최종 form field를 이미 입력했거나 editor에서 확정한 값은 자동 덮어쓰지 않는다.
- 확정 CTA만 최종 `title`, `category`, `keySpecificationsText` state를 갱신한다.
- 핵심 스펙 문자열 변환은 기존 저장 경로와 동일하게 줄 단위 입력을 유지한다. 배열은 editor 내부/계약에서 사용하고 최종 form에는 newline text로 반영한다.
- 신뢰도 라벨 파생 기준은 helper로 고정한다. 권장 기준: `>= 0.75 높음`, `>= 0.5 보통`, `< 0.5 낮음`.
- reviewed event helper는 확정 필드와 원본 draft를 비교해 `acceptedFields`와 `editedFields`를 계산한다.
- deterministic `eventId`는 테스트 가능해야 한다. Node/browser 양쪽 호환이 필요하면 UUID v5 라이브러리를 새로 추가하지 말고, Web Crypto 기반 해시 또는 안정 문자열 helper를 repo 패턴에 맞춰 작게 구현한다.

### File Structure Requirements

- 주요 수정/생성 후보:
  - `src/feature/listing/components/extraction-field-editor.client.tsx`
  - `src/feature/listing/components/listing-form.client.tsx`
  - `src/feature/listing/components/photo-uploader.client.tsx`
  - `src/shared/contracts/ai-extraction.ts`
  - `src/shared/contracts/events/ai-extraction-reviewed.v1.ts`
  - `src/shared/contracts/events/ai-extraction-reviewed.v1.test.ts`
  - `tests/contracts/ai-extraction-reviewed.v1.contract.test.ts`
  - `tests/contracts/fixtures/ai.extraction.reviewed.v1.json`
  - `tests/e2e/extraction-field-editor-flow.spec.ts`
  - `tests/e2e/photo-uploader-flow.spec.ts`
  - `tests/support/helpers/ai-extraction.ts`
- 기존 `src/app/api/ai/extractions/route.ts`는 extraction 요청 계약이 바뀌지 않는 한 수정하지 않는다.
- DB/Prisma schema 변경은 기본적으로 필요 없다. 확정값은 기존 listing 저장 경로의 form data로 충분하다.

### Testing Requirements

- P0 E2E:
  - AI 초안 응답 -> `ExtractionFieldEditor` 표시 -> 신뢰도 라벨 표시
  - 제목/카테고리/핵심 스펙 수정 -> 확정 -> 최종 form fields 반영
  - 필수값 누락 상태에서 확정 차단 및 필드별 오류 표시
  - 수동 입력 중 late response가 최종 form 값을 덮어쓰지 않음
  - 확정 후 기존 listing 저장 성공 경로 유지
- P1 계약/API:
  - `ai.extraction.reviewed.v1` canonical fixture schema 검증
  - accepted/edited field 계산 검증
  - 동일 확정 입력의 deterministic event id 검증
- 회귀:
  - 기존 `tests/e2e/listing-registration.spec.ts`
  - 갱신된 `tests/e2e/photo-uploader-flow.spec.ts`
  - `tests/contracts/ai-extraction-api.contract.test.ts`
  - `tests/contracts/listing-created.v1.contract.test.ts`
  - listing domain/repository unit tests
- selector:
  - Playwright는 ARIA role/name을 우선 사용한다.
  - 복합 상태에는 안정적인 `data-testid`를 보조로 둔다: 예 `extraction-field-editor`, `extraction-confidence-label`, `extraction-confirm-button`.

### Previous Story Intelligence

- Story 2.1 구현 완료 파일: `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md`.
- Story 2.1에서 `PhotoUploader`는 `requestVersion`, `clientRequestId`, `AbortController`, fallback flag로 late response를 폐기했다. 2.2도 이 규칙을 유지하고 editor state에 메타를 넘겨야 한다.
- Story 2.1 review patch에서 잘못된 파일 선택 후 이전 AI 요청이 살아남는 버그를 고쳤다. 2.2에서 editor를 추가할 때 invalid/new upload가 기존 editor draft를 stale하게 확정하지 못하도록 같은 무효화 규칙을 유지한다.
- Story 2.1은 현재 셸 Node `v22.18.0`에서 package engines `>=24.14.1 <25` 경고가 출력된다고 기록했다. 테스트 실행 환경은 Node 24.14.1 이상이어야 한다.
- 최근 main에는 Story 2.1 PR merge가 포함되어 있다. 2.2는 이 기반에서 새 컴포넌트를 추가하며 Story 2.4 worktree/branch는 건드리지 않는다.

### Latest Technical Information

- Repo 고정 버전은 `next@16.2.4`, `react@19.2.5`, `react-dom@19.2.5`, `@mui/material@9.0.0`, `@playwright/test@1.59.1`, `prisma@7.7.0`, `typescript@6.0.3`이다 (`package.json`).
- React controlled input과 `useState` 패턴으로 editor draft state와 final form state를 분리한다. 기존 `ListingForm`의 `useActionState` 서버 액션 흐름은 유지한다.
- MUI는 기존 listing form과 동일하게 `TextField`, `Alert`, `Chip`, `Stack`, `Button`, `Typography` 및 `sx` 기반 스타일을 사용한다.
- Zod 4 계약 스키마는 기존 `src/shared/contracts/*` 패턴을 따른다. 새 event schema도 zod schema + inferred type + fixture contract test 형태로 만든다.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 2 / Story 2.2
- `_bmad-output/planning-artifacts/prd.md` - FR9, FR10, FR13, FR16, FR23
- `_bmad-output/planning-artifacts/architecture.md` - Active MVP 우선순위, 레이어/계약/API/이벤트 규칙
- `_bmad-output/planning-artifacts/ux-design-specification.md` - MVP core components, Interaction Rules
- `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md` - 선행 Story 2.1 구현/리뷰 지식
- `package.json`
- `src/shared/contracts/ai-extraction.ts`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/domain/listing/listing.ts`
- `src/shared/contracts/events/listing-created.v1.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- `tests/support/helpers/ai-extraction.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `bmad-create-story` workflow loaded from `.agents/skills/bmad-create-story/workflow.md`
- Config loaded from `_bmad/bmm/config.yaml`: Korean communication/doc output, implementation artifacts path
- 명시 입력 스토리: `2.2-ExtractionFieldEditor 기반 초안 검토/수정/확정`
- 분석 입력 문서: `epics.md`, `prd.md`, `architecture.md`, `ux-design-specification.md`
- 선행 스토리 분석: `2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md`
- 코드베이스 패턴 점검: `ai-extraction.ts`, `photo-uploader.client.tsx`, `listing-form.client.tsx`, `listing.ts`, `photo-uploader-flow.spec.ts`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 2.2 범위를 AI 초안 자동 적용에서 명시적 검토/수정/확정 editor로 전환하는 작업으로 고정했다.
- 현재 sprint status의 Story 2.2 label이 stale한 것을 확인했으며, authoritative `epics.md`의 Story 2.2 제목을 기준으로 작성했다.
- Epic 4 소유 이벤트 수집/관측을 앞당기지 않고 `ai.extraction.reviewed.v1` 계약과 producer-ready helper까지만 포함하도록 경계를 명시했다.
- create-story checklist 기준 검증을 반복했으며 unresolved placeholder나 미완료 표식 및 추가 보완 finding이 남아 있지 않다.
- `bmad-testarch-atdd` workflow를 직접 실행해 Story 2.2 red-phase ATDD artifacts를 생성했다.
- ATDD tests는 TDD red phase 규칙에 따라 `test.skip(...)` 상태로 생성했으며, green phase에서 active test 위치로 승격하고 skip을 제거한다.

### File List

- `_bmad-output/implementation-artifacts/2-2-ExtractionFieldEditor-기반-초안-검토-수정-확정.md`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-test-data.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai-extraction-reviewed-contract.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/extraction-field-editor-flow.red.spec.ts`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/ai.extraction.reviewed.v1.json`
- `_bmad-output/test-artifacts/red-phase/2-2-extraction-field-editor-confirm/atdd-checklist-2-2-extraction-field-editor-confirm.md`
