# Story 2.3: PriceSuggestionCard 기반 추천가 수용/수정 확정

Status: done

## Story

As a 판매 사용자,
I want 추천가를 수용하거나 수동으로 수정해 확정하고 싶다,
so that 가격 결정을 빠르게 마무리할 수 있다.

**Scope Tag:** Active MVP  
**Story Type:** Feature / brownfield listing-flow enhancement  
**FR Trace:** FR11, FR12, FR16, FR17, FR23

## Acceptance Criteria

1. **Given** 추천가가 제시된 상태에서  
   **When** 사용자가 추천가 수용 또는 수동 가격 입력 중 하나를 선택하면  
   **Then** 선택한 값이 최종 가격으로 확정된다  
   **And** 확정 방식(`accepted`/`edited`)이 이벤트로 기록 가능 상태가 된다.

2. **Given** 사용자가 수동 가격을 입력했을 때  
   **When** 최소/최대/단위 검증을 통과하지 못하면  
   **Then** 저장이 차단된다  
   **And** 필드 오류 메시지와 복구 가이드가 표시된다.

3. **Given** 권한 오류 또는 세션 만료가 발생했을 때  
   **When** 사용자가 가격 확정을 시도하면  
   **Then** 재인증 또는 복구 경로가 제공된다  
   **And** 잘못된 가격 확정 이벤트는 기록되지 않는다.

4. **Given** 가격 확정이 성공했을 때  
   **When** 시스템이 이벤트를 생성하면  
   **Then** 동일 추천/동일 확정 재시도에서 단일 `eventId`가 보장된다  
   **And** 이벤트 중복률 가드레일(`< 1%`) 검증에 연결할 수 있다.

5. **Given** 추천가 산출 이후 상품 핵심 정보가 수정되었을 때  
   **When** 사용자가 기존 추천가 수용을 시도하면  
   **Then** 시스템은 revision 불일치를 감지한다  
   **And** 추천가 재산출 또는 현재 정보 기준 재확인을 요구한다.

## Tasks / Subtasks

- [x] `PriceSuggestionCard`를 등록 플로우에 추가한다. (AC: 1, 2, 5)
  - [x] `src/feature/listing/components/price-suggestion-card.client.tsx`를 생성한다.
  - [x] 추천가, 근거/범위, 추천 산출 기준 revision, 수용 CTA, 수동 가격 입력, 확정 CTA를 한 카드 안에서 제공한다.
  - [x] 기존 `TextField name="priceKrw"`를 카드 내부의 최종 가격 state로 대체하되, 제출되는 `FormData` key는 반드시 `priceKrw`로 유지한다.
  - [x] `ListingDraftFields`에서 확정된 제목/카테고리/핵심 스펙 revision을 `PriceSuggestionCard`에 전달한다. 추천가가 해당 revision보다 오래됐으면 수용 확정을 막는다.
  - [x] AI 실패/fallback 경로에서도 카드 없이 등록이 막히지 않도록 수동 가격 확정 경로를 제공한다.

- [x] 추천가 계약과 최소 산출 helper를 추가한다. (AC: 1, 4, 5)
  - [x] `src/shared/contracts/pricing-suggestion.ts`를 생성하고 `PricingSuggestion`, `PricingSuggestionBasis`, `PricingConfirmationMode`, `PricingConfirmationInput` 타입/Zod schema를 정의한다.
  - [x] `src/domain/pricing/pricing-suggestion.ts`를 생성해 MVP용 deterministic suggestion helper를 둔다. 외부 가격 API, 크롤러, ML provider는 추가하지 않는다.
  - [x] 추천가는 현재 확정된 상품 정보의 revision hash 또는 deterministic `basisRevision`과 함께 생성한다.
  - [x] 추천가 산출 실패 또는 낮은 근거 품질에서는 수동 가격 입력을 우선 노출한다.

- [x] 가격 검증과 최종 form 반영 규칙을 구현한다. (AC: 1, 2)
  - [x] 수동 입력과 추천가 수용 모두 최종 `priceKrw` controlled state를 갱신한다.
  - [x] MVP 가격 정책을 한 곳에 고정한다: 정수 KRW, 최소 `1`, 권장 step `1000`, 최대값은 도메인 상수로 명시한다.
  - [x] 검증 실패 시 MUI `TextField` `error/helperText`, 카드 상단 `Alert`, `aria-live`를 사용해 원인과 복구 행동을 전달한다.
  - [x] 최종 저장 검증은 기존 `createListingInputSchema.priceKrw`와 의미가 어긋나지 않아야 한다. 클라이언트 검증은 UX 편의를 위한 선검증이다.

- [x] `pricing.suggestion.accepted.v1` 이벤트 계약과 producer-ready helper를 추가한다. (AC: 1, 3, 4)
  - [x] `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`를 생성한다.
  - [x] 공통 필드는 아키텍처 규칙을 따른다: `eventId`, `occurredAt`, `traceId`, `schemaVersion`.
  - [x] payload에는 최소 `clientRequestId`, `idempotencyKey`, `basisRevision`, `suggestedPriceKrw`, `confirmedPriceKrw`, `mode`, `deltaKrw`, `manualReason?`를 포함한다.
  - [x] 동일 `idempotencyKey + basisRevision + confirmedPriceKrw + mode`에서 같은 `eventId`가 나오도록 deterministic helper를 만든다.
  - [x] 권한/세션 실패 또는 가격 검증 실패에서는 event helper를 호출하지 않는다.
  - [x] Epic 4 소유 범위인 이벤트 수집 파이프라인, 운영 대시보드, 경보 route는 구현하지 않는다.

- [x] 권한/세션 오류를 가격 확정 UX에 연결한다. (AC: 3)
  - [x] 현재 등록 화면이 인증을 강제하지 않는다면 실제 auth provider를 새로 붙이지 말고, 가격 확정 helper/action의 typed error와 UI 복구 문구를 테스트 가능하게 설계한다.
  - [x] `AUTH_REQUIRED` 또는 동등한 domain/contract error code를 카드 UI에서 재인증/재시도 안내로 매핑한다.
  - [x] auth 실패 상태에서도 현재 입력된 제목/카테고리/핵심 스펙/가격을 잃지 않는다.

- [x] 테스트를 확장해 가격 확정 회귀를 고정한다. (AC: 1, 2, 3, 4, 5)
  - [x] `tests/e2e/price-suggestion-card-flow.spec.ts`를 추가해 추천가 표시, 추천가 수용, 수동 수정 확정, 최종 `priceKrw` 제출 반영을 검증한다.
  - [x] revision mismatch 시 기존 추천가 수용이 차단되고 재확인/재산출 안내가 표시되는 E2E를 추가한다.
  - [x] 수동 가격 검증 실패, 권한 오류 복구 안내, 입력 유지 케이스를 추가한다.
  - [x] `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts`와 fixture를 추가해 event schema와 deterministic `eventId`를 고정한다.
  - [x] `src/domain/pricing/pricing-suggestion.test.ts` 또는 contract unit test로 price policy, basisRevision, accepted/edited mode 계산을 검증한다.
  - [x] 회귀 게이트를 통과해야 한다: `pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm contract`, 관련 Playwright E2E, `pnpm perf-budget`.

### Review Findings

- [x] [Review][Patch] 확정 가격이 상품 정보 변경 또는 실패한 수동 가격 확정 후에도 제출값으로 남을 수 있음 [`src/feature/listing/components/price-suggestion-card.client.tsx`] — 현재 basis revision과 일치하지 않는 확정가는 제출 필드에서 제외하고, 수동 가격을 다시 편집하거나 검증 실패가 발생하면 기존 확정값과 이벤트를 초기화하도록 수정했다. `tests/e2e/price-suggestion-card-flow.spec.ts`에 회귀 테스트를 추가했다.
- [x] [Review][Patch] stale 추천가 상태에서 수동 가격 확정 이벤트가 이전 basis revision으로 생성될 수 있음 [`src/feature/listing/components/price-suggestion-card.client.tsx`] — 수동 수정 확정 이벤트는 현재 상품 정보 기준 추천값과 basis revision을 사용하도록 수정했다. `tests/e2e/price-suggestion-card-flow.spec.ts`에 current-basis deterministic eventId 회귀 테스트를 추가했다.

## Dev Notes

### Epic Context

- Epic 2는 `사진 업로드 -> AI 검토/수정 -> 추천가 확정 -> 요약/등록`의 Active MVP 흐름을 완성한다.
- Story 2.1은 `PhotoUploader`, `/api/ai/extractions`, fallback 상태, stale response 방어를 완료했다.
- Story 2.2는 AI 초안이 최종 form에 자동 반영되지 않고 `ExtractionFieldEditor`에서 사용자가 명시 확정한 값만 반영되도록 변경했다.
- Story 2.4는 AI 실패/저신뢰 fallback에서도 기존 `createListing` 저장 경로로 등록을 완료하는 회귀를 닫았다.
- Story 2.3은 가격 결정을 같은 원칙으로 닫는다. AI/규칙 추천은 참고값이며, 최종 가격은 사용자의 수용 또는 수정 확정으로만 `priceKrw`에 반영된다.

### Current Codebase Intelligence

- 앱 코드는 repo root `src/`와 `tests/`에 있다. `preproduct/src`, `src/app/(app)`, `src/app/api/listings/drafts`, `src/app/api/decision-cards` 경로를 만들지 않는다.
- 현재 등록 화면은 `src/app/listings/new/page.tsx`가 서버 액션을 만들고 `src/feature/listing/components/listing-form.client.tsx`를 렌더링한다.
- 현재 가격 입력은 `ListingForm` 안의 독립 `TextField name="priceKrw"` 하나다. Story 2.3 구현 시 이를 `PriceSuggestionCard`로 이동시키되 제출 키와 기존 서버 액션 입력 shape는 유지해야 한다.
- 저장 흐름은 `src/feature/listing/actions/create-listing.action.ts` -> `src/domain/listing/listing.service.ts` -> `src/infra/listing/listing.repository.ts`다. PriceSuggestionCard가 repository/Prisma를 직접 import하면 레이어 위반이다.
- `src/domain/listing/listing.ts`의 현재 `priceKrw` 검증은 `z.coerce.number().int().positive("가격은 1원 이상 입력해 주세요.")`이다. 클라이언트 가격 정책은 이보다 약하면 안 되고, 더 엄격한 최대/단위 정책은 domain constant로 명시해야 한다.
- 가격/추천 관련 모듈은 아직 없다. 새 모듈은 `src/domain/pricing`, `src/shared/contracts/pricing-suggestion.ts`, `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`로 시작한다.

### Architecture Compliance

- 레이어 경계: `feature -> domain -> infra`만 허용한다. `feature -> infra` 직접 import 금지.
- 변경 순서: `contracts -> domain/helpers -> handlers/actions -> UI -> tests`.
- API/이벤트 응답 규약: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }` 패턴을 유지한다. 기존 listing server action의 form state 패턴은 별도 API로 우회하지 않는다.
- 이벤트 공통 필드: `eventId`, `occurredAt(UTC)`, `traceId`, `schemaVersion`.
- Active MVP 이벤트 최소셋에는 `pricing.suggestion.accepted.v1`가 포함된다. Story 2.3은 계약과 producer-ready helper까지 만들고, 수집/관측/무결성 검증/대시보드는 Epic 4에 남긴다.
- Active MVP 우선순위가 `Deferred P1.5+`와 `Legacy Reference`보다 높다. DecisionCard/FitCriteriaPanel/Partner/Ops/Experiment full model은 이 스토리 구현 근거로 사용하지 않는다.

### UX Requirements

- MVP 핵심 컴포넌트 중 이 스토리의 대상은 `PriceSuggestionCard`다.
- 추천가는 `수용`과 `수동 수정`이 동등한 선택지로 보여야 한다. 추천가가 자동 확정처럼 보이면 안 된다.
- 추천 근거는 짧은 텍스트와 숫자로 표시한다. 가격/상태 의미를 색상만으로 전달하지 않는다.
- 오류/경고는 원인과 복구 행동을 함께 보여준다. 예: "상품 정보가 수정되어 추천가가 오래되었습니다. 현재 정보 기준으로 다시 확인해 주세요."
- 모바일 320-767px에서 가격 입력, 수용 CTA, 수정 확정 CTA, 재확인 CTA는 44x44 이상 터치 타깃과 키보드 포커스를 유지한다.
- 상태 변경은 `role="status"`/`aria-live`, 필드별 helper text, Alert를 활용해 스크린 리더에 전달한다.
- UI는 기존 listing 컴포넌트처럼 MUI `Card`/`Paper`, `TextField`, `Button`, `Chip`, `Alert`, `Stack`, `Typography`, `sx` 패턴을 우선 사용한다.

### Technical Requirements

- `PriceSuggestionCard`는 controlled state로 동작해야 한다. 추천가 state, 수동 입력 state, 최종 확정 price state를 명확히 분리한다.
- 추천가는 `title`, `category`, `keySpecifications`가 확정된 revision에 묶인다. 확정 필드가 바뀌면 기존 recommendation은 stale로 표시하고 수용 확정을 막는다.
- 최종 `priceKrw`는 사용자가 `추천가 수용` 또는 `수동 가격 확정`을 선택했을 때만 갱신한다.
- 수동 가격은 trim 후 숫자만 허용한다. 쉼표 표시를 허용하더라도 `FormData`에는 숫자 문자열만 들어가야 한다.
- deterministic `eventId` helper는 Node/browser 양쪽 테스트가 가능해야 한다. Story 2.2의 `ai-extraction-reviewed.v1.ts` 패턴처럼 안정 문자열 + 작은 deterministic hash helper를 재사용하거나 유사하게 구현한다. 새 UUID 라이브러리는 추가하지 않는다.
- 추천가 산출은 MVP deterministic helper로 충분하다. 외부 시세 API, 검색 크롤링, ML provider, queue, scheduler는 범위 밖이다.
- 자동 가격조정 규칙(`FR18-FR21`)은 Epic 3 범위다. Story 2.3에서 구현하지 않는다.
- 권한 오류 AC는 실제 인증 제품화를 의미하지 않는다. 현재 auth 경계가 없으면 typed error와 UI recovery branch, 테스트 fixture로 개발자가 후속 auth 연결 지점을 안전하게 남긴다.

### File Structure Requirements

- 주요 생성/수정 후보:
  - `src/feature/listing/components/price-suggestion-card.client.tsx`
  - `src/feature/listing/components/listing-form.client.tsx`
  - `src/shared/contracts/pricing-suggestion.ts`
  - `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`
  - `src/shared/contracts/events/pricing-suggestion-accepted.v1.test.ts`
  - `src/domain/pricing/pricing-suggestion.ts`
  - `src/domain/pricing/pricing-suggestion.test.ts`
  - `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts`
  - `tests/contracts/fixtures/pricing.suggestion.accepted.v1.json`
  - `tests/e2e/price-suggestion-card-flow.spec.ts`
  - `tests/e2e/listing-registration.spec.ts`
- 기존 수정 가능 후보:
  - `src/domain/listing/listing.ts` 가격 정책 상수 export가 필요할 때만 수정한다.
  - `src/feature/listing/actions/create-listing.action.ts`는 추가 hidden field를 읽어야 할 때만 수정한다. 기본 저장 입력 shape는 유지한다.
  - `tests/e2e/photo-uploader-flow.spec.ts`는 가격 카드가 기존 가격 field selector를 바꿀 때만 갱신한다.
- 만들지 말아야 할 것:
  - 외부 pricing vendor SDK
  - pricing 전용 DB table/migration
  - 자동 가격조정 scheduler
  - 운영 대시보드/metric ingestion route
  - fallback 전용 listing 저장 API

### Testing Requirements

- P0 E2E:
  - AI 초안 확정 또는 수동 입력 후 `PriceSuggestionCard`가 추천가와 근거를 표시한다.
  - 사용자가 추천가를 수용하면 최종 `priceKrw`가 추천가로 제출되고 등록 상세의 가격이 일치한다.
  - 사용자가 수동 가격으로 수정/확정하면 최종 `priceKrw`가 수정값으로 제출되고 이벤트 mode가 `edited`가 된다.
  - 잘못된 가격(빈 값, 문자, 0 이하, 최대 초과, step 위반)은 확정/저장을 차단하고 필드 오류와 복구 가이드를 표시한다.
  - 상품 핵심 정보 revision이 바뀐 뒤 기존 추천가 수용을 시도하면 stale 경고와 재확인/재산출 CTA가 보인다.
  - auth/권한 오류 fixture에서는 이벤트 생성 없이 재인증/복구 안내가 표시되고 입력값이 유지된다.
- P1 계약/단위:
  - `pricing.suggestion.accepted.v1` canonical fixture schema 검증.
  - 동일 입력의 deterministic `eventId` 검증.
  - `accepted`/`edited` mode, `deltaKrw`, `basisRevision` 계산 검증.
  - price policy helper가 `createListingInputSchema.priceKrw`보다 느슨하지 않음을 검증.
- 회귀:
  - `tests/e2e/extraction-field-editor-flow.spec.ts`
  - `tests/e2e/photo-uploader-flow.spec.ts`
  - `tests/e2e/listing-registration.spec.ts`
  - `tests/contracts/ai-extraction-reviewed.v1.contract.test.ts`
  - `tests/contracts/listing-created.v1.contract.test.ts`
  - listing domain/action/repository unit tests
- Selector:
  - Playwright는 ARIA role/name과 label을 우선 사용한다.
  - 복합 상태에는 안정적인 `data-testid`를 보조로 둔다: `price-suggestion-card`, `price-suggestion-amount`, `price-suggestion-accept-button`, `price-confirmed-event-id`, `price-suggestion-stale-alert`.

### Previous Story Intelligence

- Story 2.2의 핵심 학습: AI 제안은 최종 form에 자동 반영하지 않는다. 사용자의 명시 확정만 최종 state를 갱신한다. PriceSuggestionCard도 같은 패턴을 따라야 한다.
- Story 2.2는 `clientRequestId`, `idempotencyKey`, `requestVersion`을 editor state에 보존하고 deterministic event helper에 사용했다. 가격 이벤트도 같은 idempotency 계열을 유지한다.
- Story 2.2 review patch는 dirty editor가 열린 상태에서 새 AI draft가 기존 편집값을 덮는 버그를 막았다. 가격 카드도 사용자가 수동 가격을 편집 중이면 새 추천가가 입력값을 덮지 않아야 한다.
- Story 2.4의 핵심 학습: fallback mode와 late response/error는 사용자 입력을 침범하면 안 된다. 가격 추천 실패/저신뢰 상태도 수동 가격 경로를 막지 않는다.
- Story 2.4 검증에서 DB 저장 E2E는 `DATABASE_URL`이 없으면 실패했다. 가격 카드 E2E도 실제 상세 저장 확인을 실행할 때 Playwright web server에 유효한 `DATABASE_URL`이 필요하다.
- 최근 main에는 Story 2.2와 2.4 merge가 포함되어 있다. 현재 sprint status의 Story 2.3 label은 stale하지만, authoritative `epics.md`의 Story 2.3은 PriceSuggestionCard다.

### Latest Technical Information

- Repo 고정 버전은 `package.json` 기준 `next@16.2.4`, `react@19.2.5`, `react-dom@19.2.5`, `@mui/material@9.0.0`, `@playwright/test@1.59.1`, `prisma@7.7.0`, `typescript@6.0.3`, `zod@4.3.6`, `pnpm@10.28.2`다.
- Node engine은 `>=24.14.1 <25`다. 로컬 Node가 낮으면 pnpm warning이 발생할 수 있으나, 게이트 결과와 구분해서 기록한다.
- React `useActionState`는 현재 listing form의 서버 액션 결과와 pending state를 관리하는 기준이다. 가격 확정을 별도 client-only submit 흐름으로 우회하지 않는다.
- Playwright 공식 권장처럼 E2E selector는 `getByRole`, `getByLabel` 등 사용자 지각 기준 locator를 우선하고, 복합 상태만 `data-testid`를 보조로 둔다.
- MUI TextField/Alert 기반 오류 UX는 기존 listing form 패턴을 유지한다.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 2 / Story 2.3, FR11, FR12
- `_bmad-output/planning-artifacts/prd.md` - FR11, FR12, FR16, FR17, FR23
- `_bmad-output/planning-artifacts/architecture.md` - Active MVP boundaries, layer/API/event rules, `pricing.suggestion.accepted.v1`
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md` - `PriceSuggestionCard`, recommendation accept/edit UX, accessibility requirements
- `_bmad-output/implementation-artifacts/2-2-ExtractionFieldEditor-기반-초안-검토-수정-확정.md` - confirm-only AI review pattern and deterministic event helper
- `_bmad-output/implementation-artifacts/2-4-ai-실패-저신뢰-1탭-수동-fallback-완주.md` - fallback/manual completion and stale response preservation
- `package.json`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/extraction-field-editor.client.tsx`
- `src/feature/listing/actions/create-listing.action.ts`
- `src/domain/listing/listing.ts`
- `src/shared/contracts/events/ai-extraction-reviewed.v1.ts`
- `tests/e2e/extraction-field-editor-flow.spec.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- React `useActionState` docs: https://react.dev/reference/react/useActionState
- MUI TextField docs: https://mui.com/material-ui/react-text-field/
- Playwright locator docs: https://playwright.dev/docs/locators

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `bmad-create-story` workflow loaded from `.agents/skills/bmad-create-story/workflow.md`
- Config loaded from `_bmad/bmm/config.yaml`: Korean communication/doc output, implementation artifacts path
- 명시 입력 스토리: `2.3-PriceSuggestionCard 기반 추천가 수용/수정 확정`
- 분석 입력 문서: `epics.md`, `prd.md`, `architecture.md`, `ux-design-specification-2026-04-07-revision.md`
- 선행/인접 스토리 분석: Story 2.2, Story 2.4, Story 2.1
- 코드베이스 패턴 점검: `listing-form.client.tsx`, `extraction-field-editor.client.tsx`, `create-listing.action.ts`, `listing.ts`, `ai-extraction-reviewed.v1.ts`, `photo-uploader-flow.spec.ts`
- 최신 기술 확인: repo-pinned package versions plus official React/MUI/Playwright docs
- 2026-04-22: `pnpm install --frozen-lockfile --offline` 실행. Node engine warning 확인: wanted `>=24.14.1 <25`, current `node v22.18.0`, `pnpm 10.28.2`.
- 2026-04-22: `pnpm exec prisma generate` 최초 실행은 `DATABASE_URL` 미설정으로 실패했고, dummy `DATABASE_URL=postgresql://user:pass@localhost:5432/preproduct` 설정 후 Prisma Client 생성을 완료했다.
- 2026-04-22: focused checks 실행: `pnpm typecheck`, `pnpm lint`, `pnpm unit`, `pnpm contract`, `pnpm perf-budget`, `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm dev" pnpm exec playwright test tests/e2e/price-suggestion-card-flow.spec.ts --project=chromium`.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 2.3 범위를 `PriceSuggestionCard` 기반 추천가 수용/수정 확정으로 고정했다.
- 현재 sprint status의 Story 2.3 label이 stale한 것을 확인했으며, authoritative `epics.md`의 Story 2.3 제목을 기준으로 작성했다.
- 기존 listing 저장 경로와 `priceKrw` FormData key를 유지하도록 개발 가드를 명시했다.
- Epic 3 자동 가격조정과 Epic 4 이벤트 수집/대시보드를 앞당기지 않도록 범위를 분리했다.
- create-story checklist 기준 검증을 반복했으며 템플릿 잔여값이나 추가 보완 finding이 남아 있지 않다.
- 2026-04-22: ATDD red-phase workflow completed. PriceSuggestionCard E2E, pricing event contract, canonical fixture, factory, and ATDD checklist were generated under `_bmad-output/test-artifacts`.
- 2026-04-22: `PriceSuggestionCard`를 등록 플로우에 추가하고 추천가 수용/수동 수정 확정만 최종 `priceKrw`로 반영되도록 변경했다.
- 2026-04-22: 가격 추천 계약, deterministic `basisRevision`, MVP 가격 정책, 검증 helper, `pricing.suggestion.accepted.v1` event schema/helper를 추가했다.
- 2026-04-22: revision mismatch, invalid price, `AUTH_REQUIRED` recovery branch에서 이벤트 생성이 차단되고 입력이 유지되는 UX를 구현했다.
- 2026-04-22: 가격 카드 도입에 맞춰 listing registration/photo uploader E2E의 가격 입력 경로를 명시적 수동 가격 확정으로 갱신했다.
- 2026-04-22: focused validation gates passed. Playwright story run result: 5 passed, 5 ATDD red-phase skipped.

### File List

- `_bmad-output/implementation-artifacts/2-3-PriceSuggestionCard-기반-추천가-수용-수정-확정.md`
- `_bmad-output/test-artifacts/atdd-checklist-2.3.md`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/pricing-suggestion-accepted-v1.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/fixtures/pricing.suggestion.accepted.v1.json`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/support/factories/pricing-confirmation.factory.ts`
- `package.json`
- `src/domain/listing/listing.ts`
- `src/domain/pricing/pricing-suggestion.ts`
- `src/domain/pricing/pricing-suggestion.test.ts`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/feature/listing/components/price-suggestion-card.client.tsx`
- `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`
- `src/shared/contracts/pricing-suggestion.ts`
- `tests/contracts/fixtures/pricing.suggestion.accepted.v1.json`
- `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts`
- `tests/e2e/listing-registration.spec.ts`
- `tests/e2e/photo-uploader-flow.spec.ts`
- `tests/e2e/price-suggestion-card-flow.spec.ts`

### Change Log

- 2026-04-22: Story 2.3 developer-ready context file created.
- 2026-04-22: ATDD red-phase tests and checklist generated; story status set to `atdd-done`.
- 2026-04-22: Implemented PriceSuggestionCard recommendation accept/edit confirmation flow; story status set to `review`.
- 2026-04-22: Code review fixed stale confirmed price submission after basis changes or failed manual confirmation; story status set to `done`.
