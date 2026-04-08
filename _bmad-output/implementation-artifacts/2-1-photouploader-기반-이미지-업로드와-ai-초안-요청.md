# Story 2.1: PhotoUploader 기반 이미지 업로드와 AI 초안 요청

Status: ready-for-dev

## Story

As a 판매 사용자,
I want 사진 업로드로 AI 초안 생성을 요청하고 싶다,
so that 입력 시간을 줄일 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Feature
**FR Trace:** FR8, FR9, FR14, FR15

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

Coverage: FR8, FR9, FR14, FR15, NFR1, NFR9, NFR10, NFR11, NFR15

## Tasks / Subtasks

- [ ] 1) PhotoUploader UI 및 단계 상태 연계를 구현한다 (AC: 1)
- [ ] `preproduct/src/feature/listing/components/photo-uploader.tsx`를 생성해 파일 선택, 업로드 진행 상태(`idle | uploading | requesting | success | error`) 및 AI 요청 트리거를 제공한다.
- [ ] `preproduct/src/feature/listing/components/photo-uploader.module.css`를 생성해 모바일 320-767 기준 레이아웃과 44x44 터치 타깃을 보장한다.
- [ ] `preproduct/src/app/(app)/page.tsx` 또는 Story 1.4에서 분리된 스텝 컨테이너에 PhotoUploader를 연결해 업로드 단계 가시성을 확보한다.
- [ ] 상태 전달은 색상 단독 전달을 금지하고 텍스트/아이콘/`role="status"`를 병행한다.

- [ ] 2) 이미지 업로드/AI 초안 요청 API 계약을 추가한다 (AC: 1, 5)
- [ ] `preproduct/src/shared/contracts/ai-extraction.ts`를 생성해 요청/응답/오류/상태 enum과 idempotency 키 필드를 정의한다.
- [ ] `preproduct/src/app/api/ai/extractions/route.ts`를 생성해 `POST /api/ai/extractions` 계약을 구현한다.
- [ ] 응답 형식은 기존 표준을 유지한다: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`.
- [ ] idempotency 키 중복 요청 시 동일 처리 결과를 반환하도록 도메인 계층에서 보장한다.

- [ ] 3) 파일 유효성 검사 및 오류 분류를 도입한다 (AC: 2)
- [ ] `preproduct/src/domain/ai-extraction/ai-extraction-validator.ts`를 생성해 파일 형식, 용량, 손상(메타데이터/파싱 실패) 검증을 분리한다.
- [ ] 오류 코드를 최소 `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `CORRUPTED_IMAGE`, `AI_TIMEOUT`, `AI_UNAVAILABLE`로 표준화한다.
- [ ] `preproduct/src/infra/mapper/ai-extraction-mapper.ts`를 생성해 외부 계약(camelCase)과 내부 모델 매핑을 일원화한다.
- [ ] 사용자 안내 텍스트는 오류 유형별 복구 가이드와 재시도 CTA를 제공한다.

- [ ] 4) fallback/late-response 무시 및 취소 토큰 규칙을 구현한다 (AC: 3, 4)
- [ ] `preproduct/src/domain/ai-extraction/ai-extraction-service.ts`를 생성해 요청 버전, 취소 토큰, fallback 전환 상태를 관리한다.
- [ ] 클라이언트는 `AbortController`/timeout 기반으로 요청 취소를 처리하고, fallback 전환 후 도착한 이전 응답은 반영하지 않는다.
- [ ] 수동 입력 전환 CTA는 1회 탭으로 동작해야 하며, 전환 후 폼 상태(제목/카테고리/핵심스펙)는 사용자 입력 우선으로 유지한다.
- [ ] fallback 경로 실패가 등록 핵심 플로우를 차단하지 않도록 비차단 복구를 유지한다.

- [ ] 5) 테스트를 확장해 업로드/요청/복구/중복 전송 회귀를 고정한다 (AC: 1, 2, 3, 4, 5)
- [ ] `preproduct/tests/e2e/photo-uploader-flow.spec.ts`를 추가해 정상 업로드, 오류 유형별 재시도, fallback 1탭 전환, late response 무시를 검증한다.
- [ ] `preproduct/tests/e2e/ai-extraction-api.contract.spec.ts`를 추가해 계약/오류 스키마/idempotency 응답 일관성을 검증한다.
- [ ] `preproduct/tests/e2e/core-user-flow.spec.ts`에 PhotoUploader 단계 진입 가시성 및 비차단 fallback 회귀를 추가한다.
- [ ] 아래 게이트를 통과해야 한다: `pnpm --dir preproduct lint`, `pnpm --dir preproduct typecheck`, `pnpm --dir preproduct test:unit`, `pnpm --dir preproduct test:contracts`, `pnpm --dir preproduct test:e2e:ci`.

## Dev Notes

### Epic Context

- Epic 2의 시작 스토리로서, 이후 `ExtractionFieldEditor`(2.2), `PriceSuggestionCard`(2.3), fallback 완주(2.4)의 선행 입력 채널을 제공한다.
- 본 스토리는 "AI 성공 경로"보다 "실패/지연/중복 요청에서도 플로우 비차단"을 우선 구현해야 한다.

### Current Codebase Intelligence

- 현재 등록 플로우는 `preproduct/src/app/(app)/page.tsx`에서 `StatusDiagnosticForm` + `ListingDraftForm`으로 구성되어 있다.
- Listing API 패턴은 `preproduct/src/app/api/listings/drafts/*` + `src/domain/listing/*` + `src/infra/mapper/listing-draft-mapper.ts` 구조다.
- Decision API 패턴은 `src/app/api/decision-cards/route.ts` + `src/shared/contracts/*` + e2e 계약 테스트로 고정되어 있다.
- Story 1.4 문서에 PhotoUploader placeholder가 정의되어 있으나 실제 파일은 아직 존재하지 않는다.

### Architecture Compliance (Must Follow)

- 레이어 경계: `feature -> domain -> infra`만 허용 (`feature -> infra` 직접 import 금지).
- 매핑 경계: casing 변환은 `src/infra/mapper/*`에서만 수행한다.
- API 규약: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }`.
- Scope 우선순위: `Active MVP > Deferred P1.5+ > Legacy Reference`.
- 이벤트/추적 공통 필드(`eventId`, `occurredAt`, `traceId`, `schemaVersion`) 규약을 유지한다.

### Technical Requirements

- 업로드 단계는 모바일(320-767)에서 초기 가시영역 내 진입/상태 확인이 가능해야 한다.
- 파일 검증은 `type/size/corruption`을 분리해 사용자 오류 원인을 명확히 제시해야 한다.
- fallback CTA는 1탭 전환을 보장하고, 전환 후 늦게 도착한 AI 응답은 무시해야 한다.
- idempotency 키는 동일 입력 재전송에서 단일 처리 결과를 보장해야 한다.
- 타임아웃/취소 처리 시 네트워크 장애가 발생해도 등록 핵심 플로우는 비차단이어야 한다.

### File Structure Requirements

- 주요 수정/생성 대상:
  - `preproduct/src/app/(app)/page.tsx`
  - `preproduct/src/feature/listing/components/photo-uploader.tsx`
  - `preproduct/src/feature/listing/components/photo-uploader.module.css`
  - `preproduct/src/shared/contracts/ai-extraction.ts`
  - `preproduct/src/app/api/ai/extractions/route.ts`
  - `preproduct/src/domain/ai-extraction/ai-extraction-validator.ts`
  - `preproduct/src/domain/ai-extraction/ai-extraction-service.ts`
  - `preproduct/src/infra/mapper/ai-extraction-mapper.ts`
  - `preproduct/tests/e2e/photo-uploader-flow.spec.ts`
  - `preproduct/tests/e2e/ai-extraction-api.contract.spec.ts`
  - `preproduct/tests/e2e/core-user-flow.spec.ts`

### Testing Requirements

- E2E:
  - 정상 업로드 -> AI 요청 시작 -> 상태 표시
  - 형식/용량/손상 이미지 오류 분기 + 즉시 재시도 CTA
  - AI 실패/타임아웃 -> fallback 1탭 전환 -> 수동 입력 지속
  - fallback 이후 late response 무시
- 계약 테스트:
  - idempotency 키 중복 요청 시 단일 결과 일관성
  - 오류 스키마(`error.code/message/requestId/details.recoveryGuide`) 고정
- 회귀:
  - 기존 `listing-draft`, `intent-record`, `decision-card` 계약 테스트 무손상

### Latest Tech Information (Checked: 2026-04-08)

- 현재 저장소 고정 버전: `next@16.2.2`, `react@19.2.4`, `react-dom@19.2.4`, `@playwright/test@1.59.1` (`preproduct/package.json`).
- Next.js 최신 릴리즈 라인은 16.2 (2026-03-18 게시)이며, 본 스토리는 프레임워크 업그레이드가 아닌 업로드/상태 복구 정합성 구현에 집중한다.
- Prisma는 v7 라인 가이드가 공식화되어 있으므로 신규 DB 연동을 추가할 경우 v7 기준 설정을 따르고 MongoDB 미지원 제한을 고려한다.
- PostgreSQL 최신 지원 릴리즈 공지 기준으로 18.x 최신 마이너를 우선 사용한다(보안/회귀 픽스 반영).
- Redis Open Source는 8.4.1(2026-02)에서 보안 수정이 포함되어 있어, 캐시/큐 적용 시 8.4 계열 최신 패치 사용을 우선한다.
- 브라우저 타임아웃 제어는 `AbortSignal.timeout()`/`AbortController` 기반으로 구성해 취소 사유를 명시적으로 구분한다.

### Project Structure Notes

- 워크스페이스 루트: `PreProduct`
- 앱 코드 루트: `preproduct/`
- 스토리 산출물 루트: `_bmad-output/implementation-artifacts`
- `project-context.md`는 현재 워크스페이스에서 확인되지 않았다.

### References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2 / Story 2.1)
- `_bmad-output/planning-artifacts/prd.md` (FR8, FR9, FR14, FR15, NFR9, NFR10, NFR11, NFR15)
- `_bmad-output/planning-artifacts/architecture.md` (레이어/매핑/API 규약, Active MVP 우선순위)
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-round2-doc-aligned.md` (MVP Flow, PhotoUploader 우선 컴포넌트)
- `_bmad-output/implementation-artifacts/1-4-1분-등록-플로우-기본-ux-및-접근성-적용.md` (선행 스토리 컨텍스트)
- `preproduct/src/app/(app)/page.tsx`
- `preproduct/src/feature/listing/components/listing-draft-form.tsx`
- `preproduct/src/app/api/decision-cards/route.ts`
- `preproduct/src/app/api/listings/drafts/route.ts`
- https://nextjs.org/blog/next-16-2
- https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
- https://www.postgresql.org/support/versioning/
- https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/release-notes/redisce/redisos-8.4-release-notes/
- https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
- https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
- https://developer.mozilla.org/en-US/docs/Web/API/FormData/append

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `bmad-init` 로드: `{ user_name: 상재, communication_language: Korean, document_output_language: Korean }`
- sprint-status 자동 탐색 결과: 첫 backlog 스토리 `2-1-photouploader-기반-이미지-업로드와-ai-초안-요청`
- 분석 입력 문서: `epics.md`, `prd.md`, `architecture.md`, `architecture-2026-04-07-round2-doc-aligned.md`, `ux-design-specification.md`, `ux-design-specification-2026-04-07-round2-doc-aligned.md`
- 코드베이스 패턴 점검: `page.tsx`, `listing-draft-form.tsx`, `decision-cards route`, `listings drafts routes`, `core-user-flow.spec.ts`
- 최신 기술 검증(웹): Next.js 16.2, Prisma v7 가이드, PostgreSQL 18.x current minor, Redis OSS 8.4.1, MDN abort/upload APIs

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Story 2.1 구현 범위를 업로드 성공경로 + 실패/지연/중복 요청 복구까지 포함하도록 고정했다.
- Story 2.2/2.3 연계를 위한 PhotoUploader 입력 채널/계약 경계를 명시했다.
- sprint-status에서 `epic-2`를 `in-progress`, 대상 스토리를 `ready-for-dev`로 동기화했다.

### File List

- _bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
