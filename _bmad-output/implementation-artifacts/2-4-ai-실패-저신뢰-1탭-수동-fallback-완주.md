# Story 2.4: AI 실패/저신뢰 1탭 수동 fallback 완주

Status: done

## Story

As a 판매 사용자,
I want AI 실패 시 즉시 수동 입력 경로로 전환하고 싶다,
so that 이탈 없이 등록을 완료할 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Brownfield enhancement / fallback completion
**FR Trace:** FR14, FR15, FR16, FR17, NFR9, NFR10, NFR11, NFR15

## Acceptance Criteria

1. **Given** AI 판독 실패 또는 저신뢰 상태가 감지되었을 때  
   **When** 사용자가 fallback CTA를 선택하면  
   **Then** 1탭 내 수동 입력 경로로 전환된다  
   **And** 수동 입력만으로도 등록 완료가 가능하다.

2. **Given** fallback 전환 후 사용자가 제목/카테고리/핵심 스펙/가격을 직접 입력했을 때  
   **When** 사용자가 등록 CTA를 선택하면  
   **Then** 기존 `createListing` 서버 액션과 listing 저장 도메인 흐름으로 저장된다  
   **And** 저장 후 `/listings/{listingId}` 상세 화면으로 이동한다.

3. **Given** fallback 전환 이후 지연된 AI 응답 또는 이전 요청 오류가 도착했을 때  
   **When** 사용자가 수동 입력을 계속하고 있으면  
   **Then** 제목/카테고리/핵심 스펙/가격/상태 값은 덮어써지지 않는다  
   **And** fallback 상태는 사용자가 재시도하거나 새 사진을 선택하기 전까지 유지된다.

4. **Given** 저신뢰 AI 초안(`confidence` 낮음 또는 `fallbackRecommended=true`)이 도착했을 때  
   **When** 시스템이 응답을 반영하면  
   **Then** 사용자가 한 번의 CTA로 수동 입력 경로를 선택할 수 있다  
   **And** AI 초안을 자동 확정된 정보처럼 표현하지 않는다.

5. **Given** fallback 경로에서 필수 필드 검증 또는 저장 실패가 발생했을 때  
   **When** 시스템이 오류를 표시하면  
   **Then** 기존 Story 1.3/2.1의 필드 오류, 입력 유지, 재시도 가능 패턴을 유지한다  
   **And** 사용자는 같은 화면에서 입력을 잃지 않고 다시 등록할 수 있다.

## Tasks / Subtasks

- [x] fallback 전환이 등록 완주 상태로 이어지도록 폼 상태를 정리한다. (AC: 1, 2, 3)
  - [x] `src/feature/listing/components/listing-form.client.tsx`의 `ListingDraftFields`에서 `PhotoUploader.onFallback`을 no-op로 방치하지 말고, 명시적인 manual mode 상태를 세팅한다.
  - [x] fallback mode에서도 기존 제목/카테고리/핵심 스펙 `TextField`와 가격/상태 입력이 즉시 편집 가능하고 submit 가능해야 한다.
  - [x] fallback mode 진입 후 `createListing` 서버 액션으로 제출되는 `FormData` key는 기존 `title`, `category`, `keySpecificationsText`, `priceKrw`, `status`를 그대로 사용한다.
  - [x] fallback 전용 저장 API나 새 listing 저장소를 만들지 않는다.

- [x] 저신뢰 AI 결과를 fallback 선택지로 연결한다. (AC: 1, 4)
  - [x] `src/shared/contracts/ai-extraction.ts`의 `draft.confidence`와 `draft.fallbackRecommended` 계약을 재사용한다.
  - [x] `PhotoUploader`가 성공 응답 중 `fallbackRecommended=true` 또는 제품 기준 이하 confidence를 받으면 명확한 상태 메시지와 "수동 입력으로 계속" CTA를 노출한다.
  - [x] 신뢰도 임계값은 계약 상수로 두거나 domain/feature 경계에서 한 곳만 정의한다. UI와 테스트가 서로 다른 숫자를 하드코딩하지 않게 한다.
  - [x] 저신뢰 초안은 사용자가 명시적으로 받아들이거나 수동 입력을 선택하기 전까지 기존 수동 입력값을 덮어쓰지 않는다.

- [x] fallback 이후 늦은 AI 응답/오류가 수동 입력을 침범하지 않도록 회귀를 강화한다. (AC: 3)
  - [x] 기존 `requestVersion`, `clientRequestId`, `fallbackActiveRef`, `AbortController` 조합을 유지한다.
  - [x] fallback mode에서는 stale success뿐 아니라 stale error도 현재 사용자 입력/상태를 바꾸지 않게 한다.
  - [x] 새 파일 선택 또는 재시도 버튼을 누를 때만 fallback mode를 해제한다.
  - [x] 가격/상태 필드까지 포함해 late response가 최종 제출 값을 바꾸지 않는지 검증한다.

- [x] fallback 완주 E2E와 계약/단위 테스트를 추가한다. (AC: 1, 2, 3, 4, 5)
  - [x] `tests/e2e/photo-uploader-flow.spec.ts` 또는 별도 `tests/e2e/manual-fallback-completion.spec.ts`에 "AI 실패 -> fallback 1탭 -> 수동 필수 필드/가격 입력 -> 등록 완료 -> 상세 이동" 케이스를 추가한다.
  - [x] 저신뢰 성공 응답(`fallbackRecommended=true`, 낮은 confidence)에서 fallback CTA가 보이고 수동 완주가 가능한 케이스를 추가한다.
  - [x] late AI success/error가 fallback 후 수동 제목/카테고리/핵심 스펙/가격/상태를 덮지 않는 회귀를 확장한다.
  - [x] fallback 경로에서 필수 필드 누락 시 기존 listing validation 오류와 입력 유지가 동작하는 케이스를 추가한다.
  - [x] 현재 루트 스크립트 기준 최소 게이트를 통과시킨다: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm contract`, 관련 Playwright E2E.

## Dev Notes

### Epic Context

- Epic 2의 목표는 사진 기반 AI 초안/추천가를 활용하되 실패 시 즉시 수동 경로로 완료하는 것이다. Story 2.4는 AI 성공률 개선이 아니라 "AI가 실패해도 등록은 끝난다"를 닫는 스토리다.
- Story 2.1은 `PhotoUploader`, `/api/ai/extractions`, `src/shared/contracts/ai-extraction.ts`, `src/domain/ai-extraction/*`, fallback 상태, late response 무시를 이미 구현했다. Story 2.4는 이를 재사용해 수동 completion까지 검증한다.
- Story 2.2/2.3은 현재 별도 story file이 없고 sprint status도 backlog다. 이 스토리에서 `ExtractionFieldEditor`나 `PriceSuggestionCard`를 새로 만들지 말고, 현재 등록 폼의 필드/가격 저장 흐름으로 fallback 완주를 구현한다.

### Current Codebase Intelligence

- 앱 코드는 repo root `src/`와 `tests/`에 있다. `preproduct/src`, `src/app/(app)`, `src/app/api/listings/drafts`, `src/app/api/decision-cards` 경로를 만들거나 참조하지 않는다.
- 현재 등록 화면은 `src/app/listings/new/page.tsx`가 서버 액션을 만들고 `src/feature/listing/components/listing-form.client.tsx`를 렌더링한다.
- `ListingForm`은 `useActionState`와 `createListing` 서버 액션을 사용한다. 저장 흐름은 `src/feature/listing/actions/create-listing.action.ts` -> `src/domain/listing/listing.service.ts` -> `src/infra/listing/listing.repository.ts`다.
- `ListingDraftFields`는 `PhotoUploader`의 `onDraftReady`로 빈 제목/카테고리/핵심 스펙만 채운다. 기존 사용자 입력이 있으면 AI 결과로 덮어쓰지 않는다.
- 현재 `PhotoUploader`의 `onFallback={() => undefined}`는 수동 mode를 상위 폼에 기록하지 않는다. 구현 시 이 지점이 Story 2.4의 핵심 연결점이다.
- 가격은 별도 AI draft 대상이 아니며 `priceKrw` 필드는 `ListingDraftFields` 밖에 있다. fallback completion 테스트는 가격 입력까지 반드시 포함해야 실제 등록 완료를 검증한다.

### Architecture Compliance

- 레이어 경계는 `feature -> domain -> infra`만 허용한다. UI 컴포넌트가 Prisma/repository를 직접 import하지 않는다.
- API/서버 액션 응답 규약은 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`를 유지한다. 단, 기존 listing server action의 form state 패턴은 그대로 유지한다.
- Error handling은 typed domain errors와 사용자 안전 메시지를 분리한다. 저장 실패는 기존 `RetryableCreateListingError` -> form state 변환 패턴을 재사용한다.
- Loading/fallback은 무한 spinner 금지다. AI 요청은 timeout/fallback 경로가 있어야 하며, 수동 등록 CTA가 비차단으로 유지되어야 한다.
- Active MVP 우선순위에 따라 외부 AI vendor, 신규 pricing engine, 운영 대시보드, 이벤트 가드레일 UI는 이 스토리 범위가 아니다.

### Technical Requirements

- 1탭 fallback은 "오류 상태 확인 -> 같은 화면의 단일 CTA 클릭 -> 필수 필드 편집 가능"으로 해석한다. 별도 페이지 이동, modal wizard, 여러 확인 단계는 금지한다.
- fallback mode는 사용자 입력 우선권을 갖는다. 늦은 AI 응답, low-confidence draft, stale error는 현재 수동 입력과 submit 가능 상태를 변경하면 안 된다.
- low-confidence 기준은 중복 정의하지 않는다. `confidence` 숫자와 `fallbackRecommended` boolean 중 하나를 source of truth로 삼아 contract/test에 고정한다.
- fallback completion은 기존 listing 저장 성공과 동일하게 상세 페이지 이동까지 확인되어야 한다. 단순히 입력 필드가 editable인 것만으로는 Story 2.4 완료가 아니다.
- 접근성: fallback CTA/재시도/등록 CTA는 44px 이상 터치 타깃을 유지하고, 상태 변경은 `role="status"`/`aria-live` 또는 동등한 보조기술 인지 경로로 전달한다.
- 오류 표시는 색상 단독 전달을 금지하고, 원인과 다음 행동을 함께 보여준다.

### File Structure Requirements

- 주요 수정 후보:
  - `src/feature/listing/components/listing-form.client.tsx`
  - `src/feature/listing/components/photo-uploader.client.tsx`
  - `src/shared/contracts/ai-extraction.ts`
  - `tests/e2e/photo-uploader-flow.spec.ts`
  - `tests/e2e/listing-registration.spec.ts`
  - `tests/contracts/ai-extraction-api.contract.test.ts`
- 필요 시 빠른 단위 테스트 후보:
  - `src/feature/listing/actions/create-listing.action.test.ts`
  - `src/domain/ai-extraction/ai-extraction-service.ts`
- 만들지 말아야 할 것:
  - fallback 전용 listing 저장 API
  - fallback 전용 DB table/schema migration
  - 외부 AI provider SDK
  - Story 2.2/2.3 전용 편집/가격 컴포넌트 선구현

### Testing Requirements

- P0 E2E:
  - AI timeout/unavailable -> "수동 입력으로 계속" 1회 클릭 -> 제목/카테고리/핵심 스펙/가격 입력 -> 등록 -> 상세 페이지 확인
  - low-confidence/fallbackRecommended success -> fallback CTA 표시 -> 수동 completion 가능
  - fallback 후 late success/error가 수동 제목/카테고리/핵심 스펙/가격/상태를 덮지 않음
- P1 validation:
  - fallback mode에서 제목/핵심 스펙/가격 누락 시 기존 오류 요약과 필드 오류 표시
  - 저장 실패 시 같은 화면에서 값 유지 및 재시도 가능
- Selector:
  - Playwright는 ARIA role/name 우선 사용
  - 복잡한 상태 검증은 기존 `data-testid="photo-uploader-request-state"` 보조 사용 가능
- Gate:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm unit`
  - `pnpm contract`
  - 관련 E2E: `pnpm test:e2e -- tests/e2e/photo-uploader-flow.spec.ts --project=chromium`

### Previous Story Intelligence

- Story 2.1 구현 결과:
  - `PhotoUploader`가 `idle | validating | requesting | success | error | fallback` 상태를 갖는다.
  - `requestVersion`/`clientRequestId`/`AbortController`/`fallbackActiveRef`로 stale response를 방어한다.
  - AI timeout/unavailable에서 fallback CTA를 제공하고, late response가 제목/카테고리/핵심 스펙을 덮지 않는 E2E가 이미 있다.
  - 파일 오류 분류와 재시도 CTA가 구현되어 있다.
  - `onDraftReady`는 빈 필드만 채워 기존 수동 입력을 보존한다.
- Story 2.1 review에서 "invalid file selection did not invalidate active AI request"와 "WebP validation accepted generic RIFF bytes"가 패치됐다. Story 2.4에서 새 request/fallback 상태를 건드릴 때 이 회귀를 되살리지 않는다.
- Story 1.3/1.1 저장 실패 패턴은 검증/저장 실패 후 입력 유지와 동일 화면 재시도다. fallback completion도 이 패턴을 그대로 사용한다.

### Latest Technical Information

- 현재 repo 고정 버전은 `package.json` 기준 `next@16.2.4`, `react@19.2.5`, `react-dom@19.2.5`, `@mui/material@9.0.0`, `@playwright/test@1.59.1`, `prisma@7.7.0`, `typescript@6.0.3`, `zod@4.3.6`, `pnpm@10.28.2`다.
- `package.json` engines는 Node `>=24.14.1 <25`다. 로컬 Node가 다르면 pnpm gate에서 engine warning이 나올 수 있으나 테스트 실패와 구분해서 기록한다.
- React `useActionState` 기반 form state는 현재 listing 저장 UX의 기준이다. fallback completion에서 별도 client-only 저장 흐름으로 우회하지 않는다.
- Playwright E2E는 현재 fixture 기반 `tests/support/fixtures/index.js`와 ARIA selector 패턴을 사용한다.

### Regression Risks

- fallback CTA만 보여주고 실제 등록 완료를 검증하지 않으면 Story 2.4 AC를 충족하지 못한다.
- low-confidence AI 결과를 자동으로 폼에 채우면 "AI가 실패해도 사용자가 통제한다"는 UX 요구와 충돌한다.
- fallback 후 stale response를 막는 조건을 success path에만 두면 늦은 error가 현재 fallback 상태를 error로 되돌릴 수 있다.
- 가격 필드를 테스트하지 않으면 필수 필드 완성률과 실제 listing 저장 AC가 비어 있게 된다.
- Story 2.2/2.3을 앞당겨 구현하면 다른 병렬 작업과 충돌할 수 있다. 현재 Story 2.4는 기존 폼 완주에 집중한다.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 2 / Story 2.4, FR14, FR15
- `_bmad-output/planning-artifacts/prd.md` - Journey 2, FR14-FR17, NFR15, fallback E2E 100% Hold rule
- `_bmad-output/planning-artifacts/architecture.md` - layer/API/error/fallback patterns, Active MVP priority
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md` - Journey 2 fallback flow, 1탭 fallback, E2E-POL-03/04
- `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md` - previous story implementation intelligence
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/feature/listing/actions/create-listing.action.ts`
- `src/domain/listing/listing.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- `tests/e2e/listing-registration.spec.ts`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-22: `pnpm install --frozen-lockfile --offline` completed with engine warning: Node `v22.18.0` does not satisfy `>=24.14.1 <25`; pnpm also ignored Prisma/sharp/unrs build scripts.
- 2026-04-22: `pnpm exec prisma generate` initially failed because `DATABASE_URL` was unset; direct generation succeeded after setting a dummy local `DATABASE_URL`.
- 2026-04-22: Initial Playwright run on default `127.0.0.1:3000` failed before rendering due to stale/invalid Next chunk from an existing server.
- 2026-04-22: Isolated Playwright rerun on `127.0.0.1:3104` rendered after Prisma generation; 7/9 tests passed. The two submit-and-detail fallback completion cases were blocked by missing runtime `DATABASE_URL` in the Playwright web server, causing the existing Prisma repository to reject saving.
- 2026-04-22: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, and `pnpm contract` passed under Node `v22.18.0` with engine warnings.

### Implementation Plan

- Reuse Story 2.1's uploader state machine and stale-response guards.
- Add one shared confidence threshold contract constant and route low-confidence/fallbackRecommended successes into a manual fallback choice without applying the draft.
- Record manual mode in `ListingDraftFields` so delayed `onDraftReady` callbacks cannot overwrite fallback user input; clear manual mode only on retry or new valid photo request.
- Keep save flow on the existing `createListing` server action and listing domain/repository path.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 2.4는 기존 Story 2.1 fallback primitives를 재사용하고, 새 저장 API/DB 없이 현재 listing form completion을 닫는 범위로 고정했다.
- Sprint status에는 Story 2.4 key가 없어 repo root status update 시 Epic 2 아래에 Story 2.4 항목을 추가해야 한다.
- ATDD red-phase artifacts generated for Story 2.4 under `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/`.
- Red-phase coverage includes timeout fallback completion, low-confidence fallback choice, late AI success/error input preservation, validation retry, and existing `createListing` action contract preservation.
- Implemented explicit manual fallback mode in the listing form and wired `PhotoUploader.onFallback` to it.
- Added low-confidence/fallbackRecommended handling that exposes "수동 입력으로 계속" without applying the AI draft as confirmed data.
- Preserved stale success/error protections and extended E2E coverage to include price/status preservation after fallback.
- Added active unit coverage proving manual fallback submissions still use the existing `createListing` input shape and FormData keys.
- Verification passed for lint, typecheck, unit, and contract. Focused E2E passed 7/9; the two save-and-detail cases require a valid `DATABASE_URL` for the existing Prisma repository.

### File List

- `_bmad-output/implementation-artifacts/2-4-ai-실패-저신뢰-1탭-수동-fallback-완주.md`
- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/atdd-checklist-2-4-ai-fallback-manual-completion.md`
- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/create-listing-manual-fallback.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/2-4-ai-fallback-manual-completion/manual-fallback-completion.red.spec.ts`
- `src/feature/listing/actions/create-listing.action.test.ts`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/photo-uploader.client.tsx`
- `src/shared/contracts/ai-extraction.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- `tests/support/helpers/ai-extraction.ts`

### Change Log

- 2026-04-22: Implemented Story 2.4 manual fallback completion path and low-confidence fallback handling; added active unit/E2E regression coverage and moved story status to review.
