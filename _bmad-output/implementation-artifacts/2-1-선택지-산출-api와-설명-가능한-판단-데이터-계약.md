# Story 2.1: 선택지 산출 API와 설명 가능한 판단 데이터 계약

Status: done

## Story

As a 탐색 사용자,  
I want 내 입력 기반 행동 선택지와 근거/확신도를 API로 받으며,  
so that 왜 이 선택지가 추천되는지 이해할 수 있다.

## Acceptance Criteria

1. **Given** 유효한 의향/상태 입력이 존재할 때  
   **When** 판단 카드 생성 API를 호출하면  
   **Then** 구매/판매/보류/대안 선택지와 근거 요약, 확신도, 리스크 레벨이 반환되어야 한다.
2. **And** 응답은 외부 JSON `camelCase`를 사용하며 의향 신선도/신뢰도와 자산 상태 전이 맥락을 아래 필드로 포함해야 한다:
   - `intentContext.trustFreshnessHours: number`
   - `intentContext.trustConfidence: "low" | "medium" | "high"`
   - `assetTransition.currentState: "owned" | "held" | "selling" | "leased"`
   - `assetTransition.lastTransitionAt: ISO-8601 UTC string`
   - `assetTransition.version: number`
3. **And** 입력 유효성 위반 시 400 규약 오류를 반환해야 하며, 형식은 기존 공통 계약과 동일하게 `error.code`, `error.message`, `error.requestId`, `error.details.recoveryGuide`를 포함해야 한다.
4. **And** 의향 데이터 `trustFreshnessHours > 168`(기본 임계값, 설정으로 override 가능)인 경우 fallback 판단을 생성하고 `decision_card_error` 이벤트를 기록해야 한다.
5. **And** 이벤트 envelope은 `eventId`, `occurredAt`, `traceId`, `schemaVersion` 필드를 포함해야 한다.

Coverage: FR7, FR8, FR9, FR15, FR16

## API Contract Snapshot

### Success Response (200)

```json
{
  "data": {
    "decisionCard": {
      "options": [
        {
          "action": "buy",
          "rationaleSummary": "수요 대비 가격 하락 구간 진입",
          "confidenceScore": 0.74,
          "riskLevel": "medium"
        },
        {
          "action": "sell",
          "rationaleSummary": "보유 비용 상승 리스크",
          "confidenceScore": 0.58,
          "riskLevel": "high"
        },
        {
          "action": "hold",
          "rationaleSummary": "정보 신뢰도 보강 필요",
          "confidenceScore": 0.66,
          "riskLevel": "low"
        },
        {
          "action": "alternative",
          "rationaleSummary": "조건 충족 시 알림 기반 재진입 권장",
          "confidenceScore": 0.61,
          "riskLevel": "low"
        }
      ],
      "intentContext": {
        "trustFreshnessHours": 72,
        "trustConfidence": "medium"
      },
      "assetTransition": {
        "currentState": "owned",
        "lastTransitionAt": "2026-04-06T00:00:00.000Z",
        "version": 3
      },
      "fallbackApplied": false
    }
  },
  "meta": {
    "requestId": "req_xxx",
    "traceId": "trc_xxx"
  }
}
```

### Error Response (400)

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "필수 필드가 누락되었거나 범위를 벗어났습니다.",
    "details": {
      "recoveryGuide": "assetId, timePressure, liquidityNeed를 확인 후 다시 시도하세요."
    },
    "requestId": "req_xxx"
  }
}
```

## Tasks / Subtasks

- [x] 1) 판단 카드 계약 타입 정의 (AC: 1, 2, 3, 5)
- [x] `src/shared/contracts/decision-card.ts`에 request/response DTO, 오류 타입, event alias/canonical 매핑 정의
- [x] `camelCase` 외부 계약 고정: `trustFreshnessHours`, `trustConfidence`, `assetTransition.*`
- [x] 오류 규약은 공통 스키마 유지: `error.code/message/requestId/details.recoveryGuide`

- [x] 2) 라우트 구현 및 에러 변환 (AC: 1, 2, 3, 5)
- [x] `src/app/api/decision-cards/route.ts` 생성: `POST /api/decision-cards` 구현
- [x] 기존 API 응답 규약(`data/meta` 또는 `error`) 준수, `requestId`/`traceId` 메타 포함
- [x] typed domain error -> 표준 API 오류 변환 적용

- [x] 3) 도메인 판단 산출/유효성/이벤트 기록 (AC: 1, 2, 4, 5)
- [x] `src/domain/decision/decision-card-validator.ts` 생성: 입력 검증 및 임계치 검증
- [x] `src/domain/decision/decision-card-service.ts` 생성: 선택지/근거/확신도/리스크 레벨 산출
- [x] `src/domain/decision/decision-event-log.ts` 생성: `decision_card_error` 포함 이벤트 기록
- [x] 기존 intent 저장 상태(`src/domain/intent/intent-shared-state.ts`)를 읽어 신선도/신뢰도/상태전이 맥락 구성
- [x] 기본 임계값 `TRUST_FRESHNESS_STALE_HOURS = 168` 적용, 환경변수 override 가능하게 설계

- [x] 4) Mapper/경계 규칙 준수 (AC: 1, 2, 3)
- [x] `src/infra/mapper/decision-card-mapper.ts` 생성: 외부 camelCase <-> 내부 모델 변환
- [x] 라우트/핸들러 내 ad-hoc casing 변환 금지(변환은 mapper 전용)
- [x] `feature -> domain -> infra` import 경계 위반 없는지 점검

- [x] 5) 테스트 및 회귀 보호 (AC: 1, 2, 3, 4, 5)
- [x] `tests/e2e/decision-card-api.contract.spec.ts` 추가: 정상/유효성/fallback/event 케이스 검증
- [x] `tests/e2e/core-user-flow.spec.ts`에 `/decision` API 연계 최소 회귀 1건 추가
- [x] 필요 시 `tests/unit`에 판단 점수/리스크 산출 규칙 단위 테스트 추가
- [x] 기존 `/api/intents`, `/api/intents/records` 계약 회귀가 없는지 확인

### Review Findings

- [x] [Review][Patch] `trustFreshnessHours` 외부 입력 정책 확정(결정: 운영 차단 + 테스트/내부 모드만 허용) [`preproduct/src/domain/decision/decision-card-validator.ts:53`]
- [x] [Review][Patch] 멀티 인스턴스 환경에서 idempotency key 경합이 여전히 발생 가능 [`preproduct/src/domain/intent/idempotency-key-lock.ts:1`]
- [x] [Review][Patch] `trustFreshnessHours`에 `null`/빈 문자열이 들어와도 숫자 변환으로 통과되는 계약 드리프트 [`preproduct/src/domain/decision/decision-card-validator.ts:53`]
- [x] [Review][Patch] `TRUST_FRESHNESS_STALE_HOURS=0.5` 설정 시 `Math.floor`로 0이 되어 fallback 기준이 비정상화될 수 있음 [`preproduct/src/domain/decision/decision-card-validator.ts:35`]
- [x] [Review][Patch] 공유 상태 락 타임아웃 예외가 `/api/decision-cards`에서 표준 오류 계약 없이 500으로 노출될 수 있음 [`preproduct/src/app/api/decision-cards/route.ts:67`]

## Dev Notes

### Epic Context

- Epic 2의 첫 스토리로서 이후 UI 스토리(2.2, 2.3)가 의존하는 판단 데이터 계약의 기준선을 만든다.
- Story 2.2(DecisionCard/FitCriteriaPanel UI)는 2.1의 응답 스키마가 안정적이어야 구현 가능하다.
- Story 2.3(ActionDecisionBar)는 2.1에서 제공하는 근거/가역성/리스크 정보를 전제로 동작한다.

### Current Codebase Intelligence

- 현재 구현된 API는 `/api/intents`, `/api/intents/records`이며 둘 다 `ApiSuccess/ApiError` 계약을 사용한다.
- 기존 패턴:
  - 라우트: `src/app/api/.../route.ts`
  - 도메인 서비스/검증: `src/domain/intent/*`
  - 매퍼: `src/infra/mapper/*`
  - 계약 타입: `src/shared/contracts/*`
- `/decision` 화면은 존재하지만 `DecisionCard`는 스켈레톤 상태이며 실제 API 연계가 아직 없다.

### Architecture Compliance (Must Follow)

- 응답 형식: 성공 `{ data, meta }`, 실패 `{ error: { code, message, details?, requestId } }` 유지
- 이벤트 명명: `domain.entity.action.vN` 유지, envelope 공통 필드(`eventId`,`occurredAt`,`traceId`,`schemaVersion`) 포함
- 매핑 경계: DTO/Domain/DB 변환은 `src/infra/mapper` 전용
- 레이어 경계: `feature -> domain -> infra` 순서 강제, `feature -> infra` 직접 import 금지
- 오류 처리: typed domain error -> 표준 API 오류 변환, 사용자 메시지와 진단정보 분리
- 외부 계약 casing: JSON은 `camelCase`, 내부 저장/도메인은 필요 시 mapper를 통해 변환

### Technical Requirements

- 선택지 최소 4종(구매/판매/보류/대안)과 각 선택지별 근거 요약/확신도/리스크 레벨 반환
- 응답에 의향 신선도(`trustFreshnessHours`)와 신뢰도 문맥(`trustConfidence`) 포함
- 자산 상태 전이 문맥(현재 상태, 최근 전이 시점/버전)을 포함
- 입력 위반 시 400 + `error.code/message/requestId/details.recoveryGuide` 강제
- 신선도 임계값: `TRUST_FRESHNESS_STALE_HOURS = 168` (default), 초과 시 fallback 판단 생성 + `decision_card_error` 이벤트 기록
- 확신도 범위: `0.0 <= confidenceScore <= 1.0`
- 리스크 레벨 enum: `low | medium | high`

### File Structure Requirements

- 신규 생성 우선 후보:
- `preproduct/src/shared/contracts/decision-card.ts`
- `preproduct/src/app/api/decision-cards/route.ts`
- `preproduct/src/domain/decision/decision-card-service.ts`
- `preproduct/src/domain/decision/decision-card-validator.ts`
- `preproduct/src/domain/decision/decision-event-log.ts`
- `preproduct/src/infra/mapper/decision-card-mapper.ts`
- `preproduct/tests/e2e/decision-card-api.contract.spec.ts`

- 수정 가능 후보:
- `preproduct/src/app/(app)/decision/page.tsx`
- `preproduct/src/feature/decision/components/decision-card.tsx`
- `preproduct/tests/e2e/core-user-flow.spec.ts`

### Testing Requirements

- 계약 테스트:
  - 정상 입력에서 4개 선택지 + `confidenceScore` 범위 + `riskLevel` enum + `intentContext`/`assetTransition` 필드 검증
  - 입력 누락/범위 위반 시 400 오류 스키마(`error.code/message/requestId/details.recoveryGuide`) 검증
  - `trustFreshnessHours = 169` 케이스에서 `fallbackApplied = true` + `decision_card_error` 이벤트 검증
- 회귀 테스트:
  - `/api/intents`, `/api/intents/records` 기존 계약 유지
  - `/decision` 경로 렌더 및 최소 상호작용 회귀 유지
- 품질 게이트:
  - `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:contracts`, `pnpm test:e2e:ci`

### Git Intelligence Summary

- `preproduct` 최근 커밋 2건:
  - `a936819` feat(ci): baseline quality gates and perf budget guardrails
  - `20fab5f` Initial commit from Create Next App
- 현재는 초기 구현 단계로, Story 2.1에서 계약/도메인 경계를 명확히 고정하는 것이 중요하다.

### Latest Tech Information (Checked: 2026-04-06)

- 현재 저장소 기준:
  - `next@16.2.2`, `react@19.2.4` 사용 중 (`preproduct/package.json`)
- 적용 원칙:
  - Story 2.1은 신규 인프라 도입보다 API 계약 안정화가 목적이므로, 현재 고정된 런타임/의존성 범위 내에서 구현한다.
  - 의존성 업그레이드는 별도 스토리로 분리한다.

### Project Structure Notes

- `PreProduct` 워크스페이스 아래 실제 앱 저장소는 `preproduct/` 하위에 위치한다.
- 문서 출력 경로는 `_bmad-output/implementation-artifacts`를 유지한다.
- `project-context.md` 파일은 현재 워크스페이스에서 발견되지 않았다.

### References

- `_bmad-output/planning-artifacts/epics.md` (Epic 2 / Story 2.1)
- `_bmad-output/planning-artifacts/prd.md` (FR7, FR8, FR9, FR15, FR16, NFR18)
- `_bmad-output/planning-artifacts/architecture.md` (API 패턴, 경계 규칙, 이벤트 계약)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (DecisionCard/FitCriteriaPanel/ActionDecisionBar 맥락)
- `preproduct/src/shared/contracts/api-response.ts`
- `preproduct/src/shared/contracts/event-envelope.ts`
- `preproduct/src/app/api/intents/route.ts`
- `preproduct/src/app/api/intents/records/route.ts`
- `preproduct/src/domain/intent/intent-record-service.ts`
- `preproduct/tests/e2e/intent-record-api.contract.spec.ts`

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- sprint-status에서 첫 backlog 스토리 자동 선택: `2-1-선택지-산출-api와-설명-가능한-판단-데이터-계약`
- planning artifacts 전체 분석: `epics.md`, `prd.md`, `architecture.md`, `ux-design-specification.md`
- 코드베이스 패턴 분석: `preproduct/src/app/api/intents*`, `src/domain/intent*`, `src/shared/contracts*`
- RED 단계 확인: `pnpm playwright test tests/e2e/decision-card-api.contract.spec.ts --project=chromium` 실행 시 `/api/decision-cards` 404로 3개 실패 확인
- 구현 후 검증:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test:unit`
- `pnpm test:contracts`
- `pnpm test:e2e:ci`
- 결과: 전부 통과
- 계약 테스트 스크립트 보정: `package.json`의 `test:contracts`를 계약 스펙 정규식 패턴으로 수정하여 decision-card 계약 테스트가 기본 실행에 포함되도록 반영

### Completion Notes List

- Epic 2 Story 2.1 컨텍스트 문서를 생성했다.
- 기존 구현 패턴(응답 규약, 이벤트/idem, 경계 규칙)을 재사용하도록 파일 단위 가드레일을 명시했다.
- 후속 Story 2.2/2.3 구현에 필요한 API 계약 선행조건을 태스크로 정리했다.
- `/api/decision-cards` POST 라우트를 구현하고 표준 API 오류 스키마(`error.code/message/requestId/details.recoveryGuide`)를 적용했다.
- 계약/도메인/매퍼 경계를 분리해 camelCase 외부 계약과 내부 snake_case 도메인 모델 변환을 mapper로 일원화했다.
- `trustFreshnessHours > 168` (환경변수 `TRUST_FRESHNESS_STALE_HOURS` override 가능) 시 fallback 판단 + `decision_card_error` 이벤트 기록을 구현했다.
- e2e 계약 테스트(정상/유효성/fallback/event) 및 핵심 사용자 흐름(`/decision` API 회귀)을 추가했고 전체 품질 게이트를 통과했다.
- `pnpm test:contracts`가 decision-card 계약 스펙까지 기본 포함하도록 스크립트를 업데이트했다.
- Story 상태를 `review`로 변경했다.

### File List

- preproduct/src/shared/contracts/decision-card.ts
- preproduct/src/app/api/decision-cards/route.ts
- preproduct/src/domain/decision/decision-card-validator.ts
- preproduct/src/domain/decision/decision-card-service.ts
- preproduct/src/domain/decision/decision-event-log.ts
- preproduct/src/infra/mapper/decision-card-mapper.ts
- preproduct/tests/e2e/decision-card-api.contract.spec.ts
- preproduct/tests/e2e/core-user-flow.spec.ts
- preproduct/package.json
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/2-1-선택지-산출-api와-설명-가능한-판단-데이터-계약.md

## Change Log

- 2026-04-07: Story 2.1 구현 완료 - decision-cards API/계약/도메인/매퍼/이벤트 로깅 및 e2e 회귀 테스트 추가, 상태를 review로 전환
