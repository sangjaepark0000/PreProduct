# Story 2.1: PhotoUploader 기반 이미지 업로드와 AI 초안 요청

Status: review

## Story

As a 판매 사용자,
I want 사진 업로드로 AI 초안 생성을 요청하고 싶다,
so that 입력 시간을 줄일 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Feature
**FR Trace:** FR8, FR9

## Acceptance Criteria

1. **Given** 사용자가 등록 플로우에서 사진 업로드 단계를 열었을 때  
   **When** 유효한 상품 사진을 업로드하면  
   **Then** AI 초안 생성 요청이 실행된다  
   **And** 업로드/요청 상태가 사용자에게 명확히 표시된다.
2. **Given** 사용자가 형식 오류/용량 초과/손상 이미지를 업로드했을 때  
   **When** 시스템이 파일 유효성 검사를 수행하면  
   **Then** 오류 유형이 구분되어 표시된다  
   **And** 사용자는 즉시 재시도 CTA를 사용할 수 있다.
3. **Given** AI 요청이 실패하거나 타임아웃이 발생했을 때  
   **When** 사용자가 fallback CTA를 선택하면  
   **Then** 1탭 내 수동 입력 경로로 전환된다  
   **And** 핵심 등록 플로우는 비차단으로 유지된다.
4. **Given** 사용자가 fallback 경로로 전환한 이후 지연된 AI 응답이 도착했을 때  
   **When** 시스템이 응답의 요청 버전/취소 토큰을 검증하면  
   **Then** 이전 요청 응답은 폐기된다  
   **And** 수동 입력 상태는 덮어쓰지 않는다.
5. **Given** 동일 요청이 중복 전송되었을 때  
   **When** 시스템이 idempotency 키를 확인하면  
   **Then** 서버 처리는 1회만 수행된다  
   **And** 사용자에게는 단일 결과 상태만 노출된다.

Coverage: FR8, FR9, FR14, FR15, NFR9, NFR10, NFR11, NFR15

## Tasks / Subtasks

- [x] PhotoUploader UI와 등록 플로우 연결을 구현한다. (AC: 1, 2, 3)
  - [x] `src/feature/listing/components/photo-uploader.client.tsx`를 생성하고 파일 선택, 업로드 상태(`idle | validating | requesting | success | error | fallback`)와 AI 요청 트리거를 제공한다.
  - [x] 기존 등록 시작점은 `src/app/listings/new/page.tsx`와 `src/feature/listing/components/listing-form.client.tsx`이므로, 이 플로우 안에 PhotoUploader를 연결한다.
  - [x] MUI 컴포넌트와 `sx` 패턴을 우선 사용한다. 별도 CSS module은 기존 listing 컴포넌트 패턴과 충돌하므로 필요할 때만 추가한다.
  - [x] 상태 전달은 색상 단독 전달을 금지하고 텍스트, 아이콘, `role="status"` 또는 `aria-live`를 병행한다.
  - [x] 모바일 320-767px에서 업로드 CTA, 재시도 CTA, fallback CTA는 44x44 이상 터치 타깃을 유지한다.

- [x] 이미지 검증과 AI 초안 요청 계약을 고정한다. (AC: 1, 2, 5)
  - [x] `src/shared/contracts/ai-extraction.ts`를 생성해 요청/응답/오류/상태 타입, `idempotencyKey`, `requestVersion`, `clientRequestId`를 정의한다.
  - [x] `src/app/api/ai/extractions/route.ts`를 생성해 `POST /api/ai/extractions`를 구현한다. Next.js Route Handler에서 `request.formData()`로 파일과 메타데이터를 읽는다.
  - [x] 응답 형식은 아키텍처 규약을 따른다: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`.
  - [x] MVP에서는 외부 파트너 API 연동을 추가하지 않는다. AI 결과는 provider boundary 뒤의 deterministic fixture/mock으로 시작해 실패, 타임아웃, 지연 응답을 재현 가능하게 만든다.
  - [x] idempotency 키 중복 요청은 동일한 terminal result 또는 동일한 in-flight 상태를 반환해야 하며, concurrent duplicate도 계약 테스트로 고정한다.

- [x] 파일 유효성 검사와 오류 분류를 도메인 경계에 둔다. (AC: 2)
  - [x] `src/domain/ai-extraction/ai-extraction-validator.ts`를 생성해 파일 형식, 용량, 손상 이미지 검증을 route와 분리한다.
  - [x] 오류 코드는 최소 `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `CORRUPTED_IMAGE`, `AI_TIMEOUT`, `AI_UNAVAILABLE`, `DUPLICATE_REQUEST`를 표준화한다.
  - [x] `src/infra/ai-extraction/ai-extraction.repository.ts` 또는 동등한 infra 어댑터를 만들 경우, route가 Prisma 또는 저장소 구현을 직접 호출하지 않도록 domain service를 경유한다.
  - [x] casing 변환이나 외부 계약 매핑이 필요하면 `src/infra/mapper/ai-extraction-mapper.ts`에만 둔다.
  - [x] 사용자 안내 텍스트는 오류 유형별 복구 가이드와 재시도 CTA를 제공한다.

- [x] fallback, late-response 무시, 취소 토큰 규칙을 구현한다. (AC: 3, 4)
  - [x] `src/domain/ai-extraction/ai-extraction-service.ts`를 생성해 요청 버전, 취소 토큰, fallback 전환 상태, idempotency 처리를 관리한다.
  - [x] 클라이언트는 `AbortController` 또는 `AbortSignal.timeout()` 기반으로 요청 취소/타임아웃을 구분한다.
  - [x] fallback 전환 후 도착한 이전 응답은 `requestVersion` 또는 `clientRequestId` 불일치로 폐기한다.
  - [x] 수동 입력 전환 CTA는 1회 탭으로 동작해야 하며, 전환 후 폼 상태(제목/카테고리/핵심 스펙)는 사용자 입력 우선으로 유지한다.
  - [x] fallback 경로 실패나 AI 지연은 기존 등록 저장 플로우를 차단하지 않는다.

- [x] 테스트를 확장해 업로드, 요청, 복구, 중복 전송 회귀를 고정한다. (AC: 1, 2, 3, 4, 5)
  - [x] `tests/e2e/photo-uploader-flow.spec.ts`를 추가해 정상 업로드, 오류 유형별 재시도, fallback 1탭 전환, late response 무시를 검증한다.
  - [x] `tests/contracts/ai-extraction-api.contract.test.ts`를 추가해 성공/오류 스키마, idempotency, unknown status rejection을 검증한다.
  - [x] 필요하면 route colocated test(`src/app/api/ai/extractions/route.test.ts`)로 formData 파싱과 validator 호출을 빠르게 검증한다.
  - [x] 기존 `tests/e2e/listing-registration.spec.ts`, `src/domain/listing/*.test.ts`, `src/infra/listing/listing.repository.test.ts`, `tests/contracts/listing-created.v1.contract.test.ts` 회귀를 유지한다.
  - [x] 현재 루트 스크립트 기준 게이트를 통과해야 한다: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm contract`, `pnpm test:ci`, `pnpm perf-budget`.

## Dev Notes

### Epic Context

- Epic 2는 `사진 업로드 -> AI 검토/수정 -> 추천가 확정 -> 요약/등록`의 Active MVP 흐름을 구현한다.
- Story 2.1은 이후 `ExtractionFieldEditor`(2.2), `PriceSuggestionCard`(2.3), 수동 fallback 완주(2.4)의 선행 입력 채널이다.
- 본 스토리의 핵심 품질 목표는 AI 성공 자체보다 실패, 지연, 중복 요청에서도 등록 플로우가 비차단으로 유지되는 것이다.
- PRD는 외부 파트너 API 연동을 MVP 제외/후속 범위로 둔다. 이 스토리에서 실제 외부 AI 벤더 의존성을 추가하지 않는다.

### Current Codebase Intelligence

- 앱 코드는 repo-root `src/`에 있다. `preproduct/` 하위 앱 경로는 현재 워크스페이스에 존재하지 않는다.
- 현재 등록 화면은 `src/app/listings/new/page.tsx`에서 서버 액션을 정의하고 `src/feature/listing/components/listing-form.client.tsx`를 렌더링한다.
- Listing 저장은 `src/feature/listing/actions/create-listing.action.ts` -> `src/domain/listing/listing.service.ts` -> `src/infra/listing/listing.repository.ts` 흐름을 따른다.
- 현재 Prisma schema에는 `Listing` 모델만 있다. AI extraction 저장소나 idempotency 저장소를 추가하면 schema 변경, repository test, reset helper까지 함께 설계해야 한다.
- 기존 E2E는 `tests/e2e/listing-registration.spec.ts`에서 ARIA label과 role 기반 selector를 사용한다. PhotoUploader도 role/name 우선 selector와 필요한 경우 명시적 `data-testid`를 제공한다.

### Architecture Compliance (Must Follow)

- 레이어 경계: `feature -> domain -> infra`만 허용한다. `feature -> infra` 직접 import 금지.
- 데이터 흐름: UI -> API/Server Action -> domain -> infra -> DB/fixture/event.
- 매핑 경계: casing 변환은 `src/infra/mapper/*`에서만 수행한다.
- API 규약: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`.
- Scope 우선순위: `Active MVP > Deferred P1.5+ > Legacy Reference`.
- 계약 우선순위: `contracts -> adapters -> handlers -> UI`.
- AI 제안은 참고 정보이며 사용자 최종 확정 책임 경계를 숨기지 않는다.

### Technical Requirements

- 허용 파일 형식과 최대 용량은 계약 상수로 정의하고 UI/API/domain 검증이 같은 값을 참조해야 한다.
- 파일 검증은 `type`, `size`, `corruption`을 분리해 사용자 오류 원인을 명확히 제시해야 한다.
- AI 응답 데이터는 최소 제목, 카테고리, 핵심 스펙 배열, confidence/fallback recommendation을 담을 수 있어야 하며 Story 2.2가 수정 가능한 편집 상태로 이어받을 수 있어야 한다.
- fallback CTA는 1탭 전환을 보장하고, 전환 후 늦게 도착한 AI 응답은 UI 상태나 manual form 값을 덮어쓰지 않아야 한다.
- idempotency 키는 동일 입력 재전송과 concurrent duplicate에서 단일 처리 결과를 보장해야 한다.
- 네트워크 장애, timeout, provider unavailable fixture에서도 기존 `ListingForm` 저장 플로우는 계속 사용 가능해야 한다.

### File Structure Requirements

- 주요 수정/생성 후보:
  - `src/app/listings/new/page.tsx`
  - `src/feature/listing/components/listing-form.client.tsx`
  - `src/feature/listing/components/photo-uploader.client.tsx`
  - `src/shared/contracts/ai-extraction.ts`
  - `src/app/api/ai/extractions/route.ts`
  - `src/domain/ai-extraction/ai-extraction-validator.ts`
  - `src/domain/ai-extraction/ai-extraction-service.ts`
  - `src/infra/ai-extraction/ai-extraction.repository.ts`
  - `src/infra/mapper/ai-extraction-mapper.ts`
  - `tests/e2e/photo-uploader-flow.spec.ts`
  - `tests/contracts/ai-extraction-api.contract.test.ts`
  - `src/app/api/ai/extractions/route.test.ts`
- 기존 root package 구조를 기준으로 작업한다. `preproduct/src`, `preproduct/tests`, `src/app/(app)`, `src/app/api/listings/drafts`, `src/app/api/decision-cards` 경로를 만들거나 참조하지 않는다.

### Testing Requirements

- P0 E2E:
  - 정상 업로드 -> AI 요청 시작 -> 업로드/요청 상태 표시
  - AI timeout/unavailable -> fallback 1탭 전환 -> 수동 입력 지속
  - fallback 이후 late response가 제목/카테고리/핵심 스펙 입력을 덮어쓰지 않음
- P1 계약/API:
  - invalid type, oversized file, corrupted image 오류 분기
  - idempotency 키 중복 요청 시 단일 결과 일관성
  - 오류 스키마(`error.code`, `error.message`, `error.requestId`, `details.recoveryGuide`) 고정
- 회귀:
  - 기존 listing registration E2E
  - `listing.created.v1` contract
  - listing domain/repository unit tests
- selector:
  - Playwright는 ARIA role/name을 우선 사용하고, PhotoUploader의 복잡 상태에는 안정적인 `data-testid`를 보조로 둔다.

### Previous Story Intelligence

- 직전 Epic 1 스토리 파일은 `_bmad-output/implementation-artifacts/1-4-최소-검증-관측.md`이다.
- Story 1.4는 별도 대시보드가 아니라 route/export 중심 최소 관측을 선택했다. Epic 2도 대형 운영/계측 시스템을 앞당기지 말고, 필요한 계약과 테스트 신호만 남긴다.
- Story 1.4 구현 후 관측 route가 추가되었으므로 AI extraction 중복 이벤트나 fallback 이벤트를 추가할 때는 Epic 4 소유의 이벤트 계약 범위와 충돌하지 않게 최소 식별자만 준비한다.

### Latest Technical Information (Checked: 2026-04-22)

- 현재 repo 고정 버전은 `next@16.2.4`, `react@19.2.5`, `react-dom@19.2.5`, `@mui/material@9.0.0`, `@playwright/test@1.59.1`, `prisma@7.7.0`, `typescript@6.0.3`이다 (`package.json`).
- Next.js Route Handler 공식 문서는 `request.formData()`로 FormData를 읽는 패턴을 지원한다. `POST /api/ai/extractions`는 이 패턴을 사용한다.
- React 공식 문서의 `useActionState`는 서버 응답 기반 form state에 적합하며, 현재 `ListingForm`도 이 패턴을 사용한다. PhotoUploader는 기존 form state를 깨지 않게 분리/연결한다.
- MDN 기준 `AbortSignal.timeout()`과 `AbortController`는 timeout/cancel 구분에 사용할 수 있다. fallback 후 stale response 무시는 이 취소 신호만 믿지 말고 `requestVersion`/`clientRequestId`도 검증한다.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 2 / Story 2.1
- `_bmad-output/planning-artifacts/prd.md` - FR8, FR9, FR14, FR15, NFR9, NFR10, NFR11, NFR15
- `_bmad-output/planning-artifacts/architecture.md` - 레이어/매핑/API 규약, Active MVP 우선순위
- `_bmad-output/planning-artifacts/ux-design-specification.md` - MUI 기반 UX, PhotoUploader 우선 컴포넌트, AI 제안 수정 가능성
- `_bmad-output/test-artifacts/test-design-epic-2.md` - Epic 2 위험/테스트 설계
- `_bmad-output/implementation-artifacts/1-4-최소-검증-관측.md` - 선행 스토리 컨텍스트
- `src/app/listings/new/page.tsx`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/actions/create-listing.action.ts`
- `tests/e2e/listing-registration.spec.ts`
- `package.json`
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://react.dev/reference/react/useActionState
- https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
- https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
- https://developer.mozilla.org/en-US/docs/Web/API/FormData/append

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `bmad-init` 로드: `{ user_name: 상재, communication_language: Korean, document_output_language: Korean }`
- 명시 입력 스토리: `2.1-PhotoUploader 기반 이미지 업로드와 AI 초안 요청`
- 분석 입력 문서: `epics.md`, `prd.md`, `architecture.md`, `ux-design-specification.md`, `test-design-epic-2.md`
- 선행 스토리 분석: `1-4-최소-검증-관측.md`
- 코드베이스 패턴 점검: `src/app/listings/new/page.tsx`, `listing-form.client.tsx`, `create-listing.action.ts`, `listing.repository.ts`, `tests/e2e/listing-registration.spec.ts`
- 최신 기술 검증: Next Route Handler `request.formData()`, React `useActionState`, MDN AbortSignal/AbortController/FormData

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 2.1 구현 범위를 업로드 성공 경로, 파일 오류 분류, 실패/지연/중복 요청 복구까지 포함하도록 고정했다.
- 현재 repo-root `src/`/`tests/` 구조와 실제 package scripts에 맞게 stale `preproduct/` 경로를 제거했다.
- 외부 AI 벤더 연동을 MVP 범위에서 제외하고 deterministic fixture/mock provider boundary를 명시했다.
- ATDD red-phase 산출물을 생성했다. API 계약, PhotoUploader E2E 흐름, idempotency, fallback, late response 무시를 모두 `test.skip(...)` 기반으로 고정했다.
- Story 2.1 구현 완료: PhotoUploader를 등록 폼에 연결하고, AI extraction 계약/Route Handler/domain validator/service를 추가했다.
- 파일 형식/용량/손상 이미지 오류를 분리하고, 오류별 복구 가이드와 재시도 CTA를 제공했다.
- fallback 1탭 전환, AbortController 기반 취소, `clientRequestId`/`requestVersion` 기반 late response 폐기를 구현했다.
- idempotency key 중복 요청은 in-memory deterministic domain service에서 동일 결과와 `meta.duplicate`로 반환하도록 고정했다.
- 검증 완료: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm contract`, `pnpm test:e2e -- tests/e2e/photo-uploader-flow.spec.ts --project=chromium`, `pnpm test:ci`, `pnpm perf-budget` 통과. 단, 현재 셸 Node `v22.18.0`은 package engines `>=24.14.1 <25`와 달라 모든 pnpm 실행에서 engine warning이 출력되었다.

### File List

- `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-test-data.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/ai-extraction-api.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/photo-uploader-flow.red.spec.ts`
- `_bmad-output/test-artifacts/red-phase/2-1-photouploader-ai-draft-request/atdd-checklist-2-1-photouploader-ai-draft-request.md`
- `package.json`
- `src/app/api/ai/extractions/route.ts`
- `src/domain/ai-extraction/ai-extraction-service.ts`
- `src/domain/ai-extraction/ai-extraction-validator.ts`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/shared/contracts/ai-extraction.ts`
- `tests/contracts/ai-extraction-api.contract.test.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`

### Change Log

- 2026-04-22: Story 2.1 구현 완료 - PhotoUploader UI, AI extraction 계약/API/domain service/validator, focused contract/E2E coverage 추가, 상태를 review로 전환.
