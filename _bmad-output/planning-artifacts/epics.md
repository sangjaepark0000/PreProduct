---
stepsCompleted:
  - "step-01-validate-prerequisites"
  - "step-02-design-epics"
  - "step-03-create-stories"
  - "step-04-final-validation"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md"
  - "_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md"
---

# PreProduct - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for PreProduct, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: 판매 사용자는 상품을 등록할 수 있다.
FR2: 판매 사용자는 등록된 상품 정보를 수정할 수 있다.
FR3: 판매 사용자는 등록된 상품을 조회할 수 있다.
FR4: 판매 사용자는 판매 확정 전 프리리스팅 상태로 상품을 저장할 수 있다.
FR5: 판매 사용자는 프리리스팅 상태를 업데이트할 수 있다.
FR6: 시스템은 프리리스팅의 생성/수정 시점을 기록할 수 있다.
FR7: 판매 사용자는 프리리스팅을 언제든 업데이트할 수 있다.
FR8: 판매 사용자는 상품 사진을 업로드해 정보 초안 생성을 요청할 수 있다.
FR9: 시스템은 사진 기반 상품 정보 초안(제목/카테고리/핵심 스펙)을 제시할 수 있다.
FR10: 판매 사용자는 AI가 제시한 정보 초안을 수정/확정할 수 있다.
FR11: 시스템은 추천가를 제시할 수 있다.
FR12: 판매 사용자는 추천가를 수용하거나 수동 가격으로 확정할 수 있다.
FR13: 시스템은 AI 결과의 신뢰도/확신도 라벨을 표시할 수 있다.
FR14: 시스템은 AI 판독 실패 시 수동 입력 경로를 제공할 수 있다.
FR15: 판매 사용자는 AI 실패 상황에서도 등록 플로우를 완료할 수 있다.
FR16: 시스템은 필수 필드(제목, 카테고리, 핵심 스펙 1개 이상, 가격) 충족 여부를 검증할 수 있다.
FR17: 시스템은 저장 실패/검증 실패 시 재시도 가능한 상태를 제공할 수 있다.
FR18: 판매 사용자는 자동 가격조정 규칙을 설정할 수 있다.
FR19: 시스템은 설정된 규칙에 따라 가격조정을 적용할 수 있다.
FR20: 시스템은 가격 변경 사유를 기록할 수 있다.
FR21: 판매 사용자는 가격 변경 이력을 확인할 수 있다.
FR22: 시스템은 `listing.created.v1` 이벤트를 기록할 수 있다.
FR23: 시스템은 `ai.extraction.reviewed.v1` 이벤트를 기록할 수 있다.
FR24: 시스템은 `pricing.suggestion.accepted.v1` 이벤트를 기록할 수 있다.
FR25: 시스템은 `pricing.auto_adjust.applied.v1` 이벤트를 기록할 수 있다.
FR26: 운영자는 핵심 지표(완료율, 7일 업데이트율, 필수 필드 완성률)를 확인할 수 있다.
FR27: 운영자는 계측 가드레일(중복/누락/fallback 상태)을 확인할 수 있다.
FR28: 운영자는 Go/Hold/Stop&Reframe 판정 상태를 기록/관리할 수 있다.
FR29: 사용자는 정책/신뢰 관련 안내 페이지에 접근할 수 있다.
FR30: 시스템은 정책/안내 표시 실패가 핵심 등록/수정 플로우를 차단하지 않도록 동작할 수 있다.
FR31: 운영자는 비핵심 기능을 feature flag로 비활성화할 수 있다.
FR32: 시스템은 후속 유동성 인사이트 확장을 위한 최소 신호(업데이트 시점, 가격변경 사유)를 수집할 수 있다.
FR33: 구매자는 프리리스팅 상품을 탐색할 수 있다. (Deferred-P2)
FR34: 구매자는 관심 신호(찜/관심등록)를 남길 수 있다. (Deferred-P2)
FR35: 시스템은 관심 신호를 판매자 업데이트 우선순위에 반영할 수 있다. (Deferred-P2)

### NonFunctional Requirements

NFR1: 핵심 사용자 액션(등록 시작, 저장, 수정)은 p95 2초 이내 응답해야 한다.
NFR2: 핵심 여정(진입 -> 프리리스팅 저장) 성공률은 주간 기준 95% 이상을 유지해야 한다.
NFR3: 유동성 인사이트 계산 실패가 핵심 등록/수정 플로우 지연 또는 차단을 유발하면 안 된다.
NFR4: 사용자/거래 데이터 보호 통제는 전송 및 저장 구간 모두 적용되어야 하며 월 1회 점검 리포트로 검증 가능해야 한다.
NFR5: 운영자 기능은 권한 기반 접근 제어가 적용되어야 하며 권한 외 요청은 차단되어야 한다.
NFR6: 주요 운영 행위(판정 변경, 기능 플래그 변경) 감사로그 적재율은 99.9% 이상이어야 한다.
NFR7: 초기 기준 부하 정의 문서에 명시된 기준 대비 3배 부하에서도 핵심 액션 성능 기준(p95 2초)을 유지해야 한다.
NFR8: 데이터 증가 시 핵심 조회/수정 플로우 성능 저하가 급격히 발생하면 안 된다.
NFR9: 사용자 웹 경험은 WCAG AA 기준을 충족해야 한다.
NFR10: 핵심 플로우(사진 업로드, 필드 입력, 저장)는 키보드 기반 조작이 가능해야 한다.
NFR11: 오류/상태 변경은 보조기술 사용자에게 인지 가능한 형태로 제공되어야 한다.
NFR12: 내부 이벤트 스키마는 버전 관리되어야 하며 의미 변경 시 버전 증분 원칙을 따라야 한다.
NFR13: 외부 연동 확장 시 기존 핵심 플로우 호환성을 유지할 수 있어야 한다.
NFR14: 계측 품질 기준으로 이벤트 중복률 1% 미만, 필수 이벤트 누락률 2% 미만을 유지해야 한다.
NFR15: 판독 실패 수동입력 fallback E2E 통과율은 100%를 유지해야 한다.
NFR16: 가드레일 위반 감지 후 운영 상태 반영 지연은 30초 이내여야 한다.

### Additional Requirements

- 제약/가정: MVP 범위에서는 외부 파트너 API 연동 없이 내부 플로우 완결 우선.
- 제약/가정: SEO 페이지와 앱 셸 간 도메인 로직 중복 구현 금지(단일 서비스 레이어 원칙).
- 컴플라이언스/운영: 정책/신고/분쟁/개인정보 관련 안내 화면 3클릭 이내 접근.
- 컴플라이언스/운영: 데이터 주체 요청(열람/정정/삭제) 처리 절차/SLA 정의 및 상태 추적.
- 정책 원칙: AI 보조는 참고 정보이며 사용자 최종 확정 책임 경계 명시.
- 기술 요구: 이벤트 스키마 버전 관리 및 의미 변경 시 버전 증분.
- 운영 규칙: Week 1-2 baseline, Week 3-8 공식 판정 윈도우 운영.
- 운영 규칙: 가드레일 위반 시 Hold/Stop 우선, fallback E2E <100%면 자동 Hold.
- 확장 훅: 후속 유동성 인사이트를 위한 최소 신호 스키마(업데이트 시점, 가격변경 사유) 선수집.

### UX Design Requirements

UX-DR1: `사진 업로드 -> AI 검토/수정 -> 추천가 확정 -> 요약/등록`의 단순 단계형 플로우를 구현한다.
UX-DR2: `PhotoUploader`, `ExtractionFieldEditor`, `PriceSuggestionCard`, `ListingSummarySubmitBar`를 MVP 핵심 컴포넌트로 구현한다.
UX-DR3: AI 제안 정보는 항상 사용자 수정 가능해야 한다.
UX-DR4: AI 실패/저신뢰 시 1탭 내 수동 fallback 전환을 제공해야 한다.
UX-DR5: 상태 전달은 색상 단독이 아닌 텍스트/아이콘을 병행한다.
UX-DR6: 모바일 우선(320-767)과 터치 타깃 44x44을 준수한다.
UX-DR7: WCAG 2.1 AA, 키보드 접근, 명확한 포커스 표시를 준수한다.

### FR Coverage Map

FR1: Epic 1 - 프리리스팅 등록
FR2: Epic 1 - 프리리스팅 수정
FR3: Epic 1 - 프리리스팅 조회
FR4: Epic 1 - 프리리스팅 저장
FR5: Epic 1 - 프리리스팅 업데이트
FR6: Epic 1 - 생성/수정 시점 기록
FR7: Epic 1 - 반복 업데이트 가능
FR8: Epic 2 - 사진 업로드 기반 AI 보조 시작
FR9: Epic 2 - AI 초안 제시
FR10: Epic 2 - AI 초안 수정/확정
FR11: Epic 2 - 추천가 제시
FR12: Epic 2 - 추천가 수용/수동 확정
FR13: Epic 2 - 신뢰도 라벨 표시
FR14: Epic 2 - AI 실패 시 수동 fallback
FR15: Epic 2 - fallback 경로로 등록 완료
FR16: Epic 1 - 필수 필드 검증
FR17: Epic 1 - 저장 실패/검증 실패 재시도
FR18: Epic 3 - 자동 가격조정 규칙 설정
FR19: Epic 3 - 규칙 기반 가격조정 적용
FR20: Epic 3 - 가격 변경 사유 기록
FR21: Epic 3 - 가격 변경 이력 조회
FR22: Epic 4 - listing.created 이벤트 기록
FR23: Epic 4 - ai.extraction.reviewed 이벤트 기록
FR24: Epic 4 - pricing.suggestion.accepted 이벤트 기록
FR25: Epic 4 - pricing.auto_adjust.applied 이벤트 기록
FR26: Epic 4 - KPI 확인
FR27: Epic 4 - 가드레일 확인
FR28: Epic 4 - Go/Hold/Stop 판정 관리
FR29: Epic 4 - 정책/신뢰 안내 접근
FR30: Epic 4 - 정책 표시 실패 비차단
FR31: Epic 4 - feature flag 제어
FR32: Epic 3 - 후속 확장용 최소 신호 수집
FR33: Epic 5 - 구매자 탐색(Deferred-P2)
FR34: Epic 5 - 관심 신호 남기기(Deferred-P2)
FR35: Epic 5 - 관심 신호 기반 우선순위 반영(Deferred-P2)

## Epic List

### Epic 1: 프리리스팅 등록 완료 경험
판매 미확정 사용자도 1분 내 등록/저장/조회/수정을 완료할 수 있다.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR16, FR17

### Epic 2: AI 보조 등록 및 실패 복구
사용자는 사진 기반 AI 초안/추천가를 활용하되, 실패 시 즉시 수동 경로로 완료할 수 있다.
**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15

### Epic 3: 자동 가격조정 및 업데이트 신호
사용자는 자동 가격조정 규칙을 설정하고, 시스템은 변경 사유/이력을 추적해 후속 확장 신호를 축적한다.
**FRs covered:** FR18, FR19, FR20, FR21, FR32

### Epic 4: 계측·운영 판정·정책 신뢰 가드레일
운영자는 KPI/가드레일/판정 상태를 관리하고, 정책·신뢰 안내 실패가 핵심 플로우를 막지 않도록 운영할 수 있다.
**FRs covered:** FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31

### Epic 5: 구매자 탐색/관심 신호 확장(Deferred-P2)
구매자는 프리리스팅 탐색·관심 신호를 남기고, 시스템은 이를 판매자 우선순위에 반영할 수 있다.
**FRs covered:** FR33, FR34, FR35

## Epic 1: 프리리스팅 등록 완료 경험

판매 미확정 사용자도 1분 내 등록/저장/조회/수정을 완료할 수 있다.

### Story 1.1: 프리리스팅 생성 및 임시저장

As a 판매 사용자,
I want 첫 등록 시도를 안정적으로 시작하고 임시저장할 수 있길 원한다,
So that 중단 없이 다음 단계로 진행할 수 있다.

**FRs:** FR1, FR16

**Acceptance Criteria:**

**Given** 판매 사용자가 첫 등록 화면에 진입했을 때
**When** 필수 필드(제목/카테고리/핵심 스펙 1개 이상/가격)를 입력해 임시저장을 요청하면
**Then** 프리리스팅 초안이 저장된다
**And** Story 1.2에서 즉시 검증 가능한 seed/fixture 기준이 문서화된다.

**Given** 부팅 또는 기본 검증 단계에서 실패가 발생했을 때
**When** 사용자가 재시도를 수행하면
**Then** 실패 원인과 복구 절차가 명확히 안내된다
**And** 복구 후 동일 화면에서 임시저장을 다시 시도할 수 있다.

### Story 1.2: 프리리스팅 조회 및 수정

As a 판매 사용자,
I want 저장한 프리리스팅을 조회하고 수정하고 싶다,
So that 등록 상태를 반복적으로 업데이트할 수 있다.

**FRs:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR16

**Acceptance Criteria:**

**Given** 본인이 생성한 프리리스팅이 있을 때
**When** 상세 화면에서 항목을 수정 후 저장하면
**Then** 변경 내용이 반영된다
**And** 수정 시각이 최신으로 갱신된다.

### Story 1.3: 필수 필드 검증 및 재시도 복구

As a 판매 사용자,
I want 저장 실패나 검증 실패 시 즉시 복구하고 재시도하고 싶다,
So that 등록 플로우가 중단되지 않는다.

**FRs:** FR16, FR17

**Acceptance Criteria:**

**Given** 필수 필드가 누락되었거나 저장 중 오류가 발생했을 때
**When** 사용자가 저장을 요청하면
**Then** 누락/오류 원인이 사용자에게 명확히 표시된다
**And** 동일 화면에서 수정 후 재시도할 수 있다.

### Story 1.4: 1분 등록 플로우 기본 UX 및 접근성 적용

As a 판매 사용자,
I want 모바일 기준의 단순 단계형 등록 플로우를 사용하고 싶다,
So that 짧은 시간 안에 완료 가능성을 예측할 수 있다.

**FRs:** FR1, FR4, FR5, FR7

**Acceptance Criteria:**

**Given** 사용자가 모바일 화면(320-767)에서 등록 플로우를 사용할 때
**When** 단계 진행을 수행하면
**Then** 현재 단계와 남은 단계가 일관되게 표시된다
**And** 주요 인터랙션은 44x44 이상 터치 타깃과 키보드 포커스를 제공한다.

## Epic 2: AI 보조 등록 및 실패 복구

사용자는 사진 기반 AI 초안/추천가를 활용하되, 실패 시 즉시 수동 경로로 완료할 수 있다.

### Story 2.1: PhotoUploader 기반 이미지 업로드와 AI 초안 요청

As a 판매 사용자,
I want 사진 업로드로 AI 초안 생성을 요청하고 싶다,
So that 입력 시간을 줄일 수 있다.

**FRs:** FR8, FR9

**Acceptance Criteria:**

**Given** 사용자가 등록 플로우에서 사진 업로드 단계를 열었을 때
**When** 유효한 상품 사진을 업로드하면
**Then** AI 초안 생성 요청이 실행된다
**And** 업로드/요청 상태가 사용자에게 명확히 표시된다.

**Given** 사용자가 형식 오류/용량 초과/손상 이미지를 업로드했을 때
**When** 시스템이 파일 유효성 검사를 수행하면
**Then** 오류 유형이 구분되어 표시된다
**And** 사용자는 즉시 재시도 CTA를 사용할 수 있다.

**Given** AI 요청이 실패하거나 타임아웃이 발생했을 때
**When** 사용자가 fallback CTA를 선택하면
**Then** 1탭 내 수동 입력 경로로 전환된다
**And** 핵심 등록 플로우는 비차단으로 유지된다.

**Given** 사용자가 fallback 경로로 전환한 이후 지연된 AI 응답이 도착했을 때
**When** 시스템이 응답의 요청 버전/취소 토큰을 검증하면
**Then** 이전 요청 응답은 폐기된다
**And** 수동 입력 상태는 덮어쓰지 않는다.

**Given** 동일 요청이 중복 전송되었을 때
**When** 시스템이 idempotency 키를 확인하면
**Then** 서버 처리는 1회만 수행된다
**And** 사용자에게는 단일 결과 상태만 노출된다.

### Story 2.2: ExtractionFieldEditor 기반 초안 검토/수정/확정

As a 판매 사용자,
I want AI가 제시한 제목/카테고리/핵심 스펙을 수정 후 확정하고 싶다,
So that 최종 정보에 대한 통제권을 유지할 수 있다.

**FRs:** FR9, FR10, FR13

**Acceptance Criteria:**

**Given** AI 초안이 생성되어 편집 화면에 표시되었을 때
**When** 사용자가 필드를 수정하고 확정하면
**Then** 수정값이 최종 등록 데이터에 반영된다
**And** AI 신뢰도/확신도 라벨이 함께 표시된다.

### Story 2.3: PriceSuggestionCard 기반 추천가 수용/수정 확정

As a 판매 사용자,
I want 추천가를 수용하거나 수동으로 수정해 확정하고 싶다,
So that 가격 결정을 빠르게 마무리할 수 있다.

**FRs:** FR11, FR12

**Acceptance Criteria:**

**Given** 추천가가 제시된 상태에서
**When** 사용자가 추천가 수용 또는 수동 가격 입력 중 하나를 선택하면
**Then** 선택한 값이 최종 가격으로 확정된다
**And** 확정 방식(수용/수정)이 이벤트로 기록 가능 상태가 된다.

**Given** 사용자가 수동 가격을 입력했을 때
**When** 최소/최대/단위 검증을 통과하지 못하면
**Then** 저장이 차단된다
**And** 필드 오류 메시지와 복구 가이드가 표시된다.

**Given** 권한 오류(세션 만료 포함)가 발생했을 때
**When** 사용자가 가격 확정을 시도하면
**Then** 재인증 또는 복구 경로가 제공된다
**And** 잘못된 가격 확정 이벤트는 기록되지 않는다.

**Given** 가격 확정이 성공했을 때
**When** 시스템이 이벤트를 기록하면
**Then** 단일 `eventId`가 보장된다
**And** 중복률 가드레일 기준과 연결된다.

**Given** 추천가 산출 이후 상품 핵심 정보가 수정되었을 때
**When** 사용자가 기존 추천가 수용을 시도하면
**Then** 시스템은 revision 불일치를 감지한다
**And** 추천가 재산출 또는 재확인을 요구한다.

### Story 2.4: AI 실패/저신뢰 1탭 수동 fallback 완주

As a 판매 사용자,
I want AI 실패 시 즉시 수동 입력 경로로 전환하고 싶다,
So that 이탈 없이 등록을 완료할 수 있다.

**FRs:** FR14, FR15

**Acceptance Criteria:**

**Given** AI 판독 실패 또는 저신뢰 상태가 감지되었을 때
**When** 사용자가 fallback CTA를 선택하면
**Then** 1탭 내 수동 입력 경로로 전환된다
**And** 수동 입력만으로도 등록 완료가 가능하다.

## Epic 3: 자동 가격조정 및 업데이트 신호

사용자는 자동 가격조정 규칙을 설정하고, 시스템은 변경 사유/이력을 추적해 후속 확장 신호를 축적한다.

### Story 3.1: 자동 가격조정 규칙 설정

As a 판매 사용자,
I want 기간/인하율/최저가 하한 기반 가격조정 규칙을 설정하고 싶다,
So that 가격 관리를 자동화할 수 있다.

**FRs:** FR18

**Acceptance Criteria:**

**Given** 사용자가 가격조정 설정 화면에 진입했을 때
**When** 주기, 인하율, 최저가 하한을 입력하고 저장하면
**Then** 규칙이 유효성 검증 후 저장된다
**And** 이후 조정 실행 대상에 포함된다.

### Story 3.2: 규칙 기반 자동 가격조정 실행 및 사유 기록

As a 시스템 운영 사용자,
I want 저장된 규칙에 따라 자동 가격조정이 실행되길 원한다,
So that 수동 개입 없이 최신 가격 상태를 유지할 수 있다.

**FRs:** FR19, FR20

**Acceptance Criteria:**

**Given** 유효한 가격조정 규칙이 존재할 때
**When** 조정 주기가 도래하면
**Then** 규칙에 맞는 가격조정이 적용된다
**And** 변경 사유와 적용 시점이 기록된다.

**Given** 자동조정 결과가 최저가 하한을 위반할 때
**When** 시스템이 적용 여부를 평가하면
**Then** 조정 적용을 건너뛴다
**And** skip 사유와 평가 시점이 기록된다.

**Given** 동일 리스팅에 대한 동시 실행 충돌이 발생했을 때
**When** 시스템이 조정 작업을 처리하면
**Then** 단일 처리만 성공한다
**And** 나머지 시도는 중복 처리로 기록된다.

**Given** 자동 가격조정 작업이 중간 실패 후 재시도될 때
**When** 시스템이 동일 run key로 재실행을 판단하면
**Then** 가격 적용은 최대 1회만 반영된다
**And** 부분 적용 상태는 트랜잭션 경계 또는 상태 머신 규칙으로 복구된다.

**Given** 조정이 성공적으로 적용되었을 때
**When** 시스템이 후속 계측에 전달하면
**Then** Epic 3은 이벤트 발생 책임만 수행한다
**And** 관측/무결성/경보 책임은 Epic 4로 위임된다.

### Story 3.3: 가격 변경 이력 조회 및 최소 신호 수집

As a 판매 사용자,
I want 가격 변경 이력을 확인하고 싶다,
So that 가격 결정 근거를 추적할 수 있다.

**FRs:** FR21, FR32

**Acceptance Criteria:**

**Given** 가격 변경 이력이 존재할 때
**When** 사용자가 이력 화면을 조회하면
**Then** 변경 전/후 값, 변경 시각, 변경 사유를 확인할 수 있다
**And** 후속 확장을 위한 최소 신호(업데이트 시점, 가격변경 사유)가 저장된다.

## Epic 4: 계측·운영 판정·정책 신뢰 가드레일

운영자는 KPI/가드레일/판정 상태를 관리하고, 정책·신뢰 안내 실패가 핵심 플로우를 막지 않도록 운영할 수 있다.

### Story 4.1: MVP 핵심 이벤트 4종 계측

As a 운영자,
I want 핵심 이벤트 4종이 누락 없이 기록되길 원한다,
So that KPI와 실험 판정을 신뢰할 수 있다.

**FRs:** FR22, FR23, FR24, FR25

**Acceptance Criteria:**

**Given** 등록/AI검토/추천가확정/자동가격조정 액션이 발생했을 때
**When** 시스템이 이벤트를 발행하면
**Then** `listing.created.v1`, `ai.extraction.reviewed.v1`, `pricing.suggestion.accepted.v1`, `pricing.auto_adjust.applied.v1`가 기록된다
**And** 이벤트에는 스키마 버전과 중복 방지 식별자가 포함된다.

**Given** 운영자가 계측 품질을 점검할 때
**When** 주간 윈도우 기준으로 이벤트 품질을 계산하면
**Then** 이벤트 누락률은 2% 미만이어야 한다
**And** 이벤트 중복률은 1% 미만이어야 한다.

**Given** 스키마 불일치 또는 필수 필드 누락이 감지될 때
**When** 이벤트 수집 파이프라인이 데이터를 검증하면
**Then** 문제 이벤트는 격리되고 경보가 발행된다
**And** 핵심 등록/수정 플로우는 비차단으로 유지된다.

**Given** 이벤트가 지연 도착하거나 순서가 역전되어 수집될 때
**When** 운영 집계가 주간 가드레일을 계산하면
**Then** event-time 기준 재처리 규칙이 적용된다
**And** late-event 처리 여부가 추적 가능하게 기록된다.

**Given** FR25 관련 책임을 검토할 때
**When** Epic 3/4의 역할을 확인하면
**Then** Epic 3은 발생 책임을 가진다
**And** Epic 4는 관측/무결성/경보 및 운영 Hold 판정 책임을 가진다.

### Story 4.2: KPI 및 가드레일 모니터링 화면

As a 운영자,
I want 완료율/업데이트율/필수필드 완성률과 계측 가드레일을 확인하고 싶다,
So that 주간 판정 전에 리스크를 조기에 파악할 수 있다.

**FRs:** FR26, FR27

**Acceptance Criteria:**

**Given** 이벤트 데이터가 누적되었을 때
**When** 운영자가 모니터링 화면을 조회하면
**Then** 핵심 KPI와 가드레일 상태가 함께 표시된다
**And** 임계치 위반 항목은 식별 가능한 상태로 강조된다.

### Story 4.3: Go/Hold/Stop 판정 및 Feature Flag 운영

As a 운영자,
I want 주간 판정 상태를 관리하고 비핵심 기능을 제어하고 싶다,
So that 품질 리스크 시 즉시 범위를 축소할 수 있다.

**FRs:** FR28, FR31

**Acceptance Criteria:**

**Given** 주간 판정 시점에 운영자가 상태를 결정할 때
**When** Go/Hold/Stop 중 하나를 저장하거나 feature flag를 변경하면
**Then** 변경 사항이 즉시 운영 상태에 반영된다
**And** 판정/플래그 변경 행위가 감사 가능한 로그로 남는다.

### Story 4.4: 정책·신뢰 안내 접근성과 비차단 처리

As a 사용자,
I want 정책/신뢰 안내를 쉽게 확인하고 싶다,
So that 서비스 이용 경계를 명확히 이해할 수 있다.

**FRs:** FR29, FR30

**Acceptance Criteria:**

**Given** 사용자가 정책/신뢰 안내를 확인하려고 할 때
**When** 안내 페이지로 이동하면
**Then** 3클릭 이내 접근이 가능하다
**And** 안내 표시 계층 장애가 발생해도 등록/수정 핵심 플로우는 차단되지 않는다.

## Epic 5: 구매자 탐색/관심 신호 확장(Deferred-P2)

구매자는 프리리스팅 탐색·관심 신호를 남기고, 시스템은 이를 판매자 우선순위에 반영할 수 있다.

### Story 5.1: 프리리스팅 탐색 화면 제공 (Deferred-P2)

As a 구매자,
I want 프리리스팅 상품을 탐색하고 싶다,
So that 관심 있는 상품을 미리 파악할 수 있다.

**FRs:** FR33

**Acceptance Criteria:**

**Given** 구매자가 프리리스팅 탐색 화면에 진입했을 때
**When** 카테고리/키워드 기반으로 목록을 조회하면
**Then** 탐색 가능한 프리리스팅 목록이 표시된다
**And** 본 스토리는 MVP Go 판정 전에는 활성화되지 않는다.

### Story 5.2: 관심 신호(찜/관심등록) 남기기 (Deferred-P2)

As a 구매자,
I want 관심 있는 프리리스팅에 관심 신호를 남기고 싶다,
So that 나중에 다시 확인하거나 판매자에게 의도를 전달할 수 있다.

**FRs:** FR34

**Acceptance Criteria:**

**Given** 구매자가 탐색 목록 또는 상세 화면을 보고 있을 때
**When** 찜/관심등록 액션을 수행하면
**Then** 관심 신호가 저장된다
**And** 본 스토리는 MVP Go 판정 전에는 활성화되지 않는다.

### Story 5.3: 관심 신호 기반 판매자 업데이트 우선순위 반영 (Deferred-P2)

As a 시스템 운영 사용자,
I want 관심 신호를 판매자 업데이트 우선순위에 반영하고 싶다,
So that 수요가 있는 상품의 갱신이 먼저 이루어지게 할 수 있다.

**FRs:** FR35

**Acceptance Criteria:**

**Given** 관심 신호 데이터가 누적되었을 때
**When** 시스템이 업데이트 우선순위를 계산하면
**Then** 관심 신호가 높은 상품이 상위 우선순위로 반영된다
**And** 본 스토리는 MVP Go 판정 전에는 활성화되지 않는다.
