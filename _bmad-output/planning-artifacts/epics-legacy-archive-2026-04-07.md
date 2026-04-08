# PreProduct Legacy Epics Archive (2026-04-07)

- 상태: Archive Only (Non-Executable)
- 분리 사유: Active MVP A~C 단일 실행 기준 유지
- 분리 원본: _bmad-output/planning-artifacts/epics.md
- 분리 일시: 2026-04-07

## Legacy Epic Details (Reference Only, Non-Executable)

### Epic 1: 목적 형성과 선의향 등록 시작

사용자가 목적이 불명확해도 탐색을 시작하고, 의향/목표 상태를 생성·관리할 수 있다.

### Story 1.1: Next.js 기반 초기 제품 골격 구축

As a 제품팀,
I want 아키텍처 기준 스타터 템플릿으로 프로젝트를 초기화하고 핵심 경계를 정의하고,
So that 이후 사용자 기능을 일관된 구조에서 안전하게 구현할 수 있다.

**Acceptance Criteria:**

**Given** 신규 저장소 상태에서
**When** 지정된 Next.js 초기화 명령으로 프로젝트를 생성하면
**Then** TypeScript/App Router/src 구조가 생성되어야 하고
**And** feature/domain/infra/shared 경계와 기본 lint/typecheck가 통과해야 한다.
**And** 개발자가 첫 사용자 여정(진입 -> 의향 입력 -> 판단 카드)을 바로 구현/검증 가능한 실행 환경이 준비되어야 한다.

Coverage: Architecture Starter Template, 구조 경계 규칙, 운영 가드레일 기반.

### Story 1.2: 목적 불명확 진입과 상태 진단 플로우

As a 목적이 불명확한 사용자,
I want 현재 상태 진단 후 다음 한 단계 행동을 즉시 제안받고,
So that 막힘 없이 탐색을 시작할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 첫 진입 화면에 도달했을 때
**When** 목적/상품 명확도 질문에 응답하면
**Then** 시스템은 현재 상태를 저장하고 다음 한 단계 행동을 즉시 제시해야 하며
**And** 모바일 화면에서 상태/다음행동/가역성 정보가 초기 노출되어야 한다.

Coverage: FR1, FR2, FR5, FR6, UX-DR1, UX-DR2.

### Story 1.3: 자산 단위 선의향 등록 및 제약조건 편집

As a 판매/구매 고민 사용자,
I want 자산 단위 의향과 제약조건을 등록·수정할 수 있고 선의향을 공개하며,
So that 타이밍과 목적에 맞는 초기 판단 데이터를 쌓을 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 자산을 선택한 상태에서
**When** 의향, 처분유형, 시간압박, 유동성 필요, 예산/기간 제약을 입력해 저장하면
**Then** 의향 레코드가 생성 또는 수정되어야 하고
**And** 동일 요청 재전송 시 dedupe key로 중복 저장 없이 동일 결과를 반환해야 한다.

Coverage: FR3, FR4, FR13, FR14, FR17, FR18.

### Story 1.4: CI/CD + 계약검증 + 성능예산 Baseline 구축

As a 개발팀,
I want Greenfield 초기 단계에서 CI/CD 품질 게이트와 계약검증/성능예산 baseline을 구성하고,
So that 이후 스토리 구현이 일관된 품질 기준을 자동으로 충족하도록 보장할 수 있다.

**Acceptance Criteria:**

**Given** 메인 브랜치에 변경이 발생했을 때
**When** CI 파이프라인이 실행되면
**Then** lint/typecheck/unit test/contract check/perf budget 체크가 모두 실행되어야 하고
**And** 계약 위반 또는 성능예산 초과 시 merge가 차단되어야 한다.
**And** 저장소가 Branch Protection/Rulesets를 지원하면 `main`에서 `lint/typecheck/unit/contracts/e2e/perf-budget`를 Required checks로 강제해야 한다.
**And** 저장소 플랜 제약으로 미지원이면, 운영 전환 블로커로 등록하고 해소 조건(저장소 공개 전환 또는 Pro/Team 업그레이드)을 백로그 액션으로 관리해야 한다.

Coverage: NFR1, NFR2, NFR11, NFR18, Architecture Quality Gates.

## Epic 2: 설명 가능한 판단 카드와 선택지 제시

사용자가 구매/판매/보류/대안 선택지를 근거와 확신도와 함께 이해하고 비교할 수 있다.

### Story 2.1: 선택지 산출 API와 설명 가능한 판단 데이터 계약

As a 탐색 사용자,
I want 내 입력 기반 행동 선택지와 근거/확신도를 API로 받으며,
So that 왜 이 선택지가 추천되는지 이해할 수 있다.

**Acceptance Criteria:**

**Given** 유효한 의향/상태 입력이 존재할 때
**When** 판단 카드 생성 API를 호출하면
**Then** 구매/판매/보류/대안 선택지와 근거 요약, 확신도, 리스크 레벨이 반환되어야 하고
**And** 의향 신선도/신뢰도와 자산 상태 전이 맥락이 응답에 포함되어야 한다.
**And** 입력 유효성 위반 시 400 규약 오류(`code`, `message`, `recovery_guide`)를 반환해야 한다.
**And** 의향 데이터 신선도 임계치 초과 시 fallback 판단과 `decision_card_error` 이벤트를 기록해야 한다.

Coverage: FR7, FR8, FR9, FR15, FR16.

### Story 2.2: DecisionCard와 FitCriteriaPanel UI 구현

As a 탐색 사용자,
I want 판단 카드와 기준 패널에서 정렬 이유를 확인하고 기준을 조정하며,
So that 후보 비교를 빠르게 수렴할 수 있다.

**Acceptance Criteria:**

**Given** 판단 결과 화면에서
**When** 사용자가 기준 우선순위를 조정하거나 비선호 이유를 입력하면
**Then** 결과 재정렬 피드백이 즉시 표시되어야 하고
**And** DecisionCard/FitCriteriaPanel은 키보드 접근, ARIA 라벨, 텍스트+아이콘 상태 전달을 만족해야 한다.

Coverage: FR12, UX-DR3, UX-DR4, UX-DR5, UX-DR6, UX-DR12, UX-DR13, UX-DR16, UX-DR17, UX-DR19.

### Story 2.3: ActionDecisionBar 기반 2스텝 행동 결정

As a 판단 직전 사용자,
I want 진행/보류/알림/드랍 행동을 2스텝 이내로 선택하며,
So that 결정을 빠르게 완료할 수 있다.

**Acceptance Criteria:**

**Given** 판단 카드 상세 상태에서
**When** 사용자가 ActionDecisionBar를 통해 행동을 선택하면
**Then** 선택은 2스텝 이내로 완료되어야 하고
**And** 액션바는 근거 요약과 가역성 정보가 함께 있을 때만 노출되어야 하며 모바일 터치 타깃 기준을 만족해야 한다.

Coverage: UX-DR7, UX-DR8, UX-DR9, UX-DR14, UX-DR18.

## Epic 3: 보류-재평가 루프와 판단 히스토리

사용자가 보류 후 재평가 흐름으로 복귀하고, 과거 판단 맥락을 조회/회고할 수 있다.

### Story 3.1: 보류/드랍 판단 맥락 저장

As a 의사결정을 미루는 사용자,
I want 보류/드랍 시 사유와 재평가 조건을 저장하고,
So that 나중에 같은 맥락을 이어서 판단할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 보류 또는 드랍을 선택했을 때
**When** 사유와 재평가 조건/시점을 입력하면
**Then** 판단 맥락이 구조화 저장되어야 하고
**And** 저장 완료 이벤트가 decision_context_saved로 기록되어야 한다.

Coverage: FR10, UX-DR10, UX-DR20.

### Story 3.2: 재진입 맥락 복원과 재평가 액션

As a 재방문 사용자,
I want 이전 보류/드랍 맥락이 복원된 상태로 재평가를 시작하고,
So that 처음부터 다시 입력하지 않고 빠르게 결정을 갱신할 수 있다.

**Acceptance Criteria:**

**Given** 저장된 판단 맥락이 존재할 때
**When** 사용자가 재진입하여 재평가를 시작하면
**Then** 이전 사유/조건/상태가 복원되어 보여야 하고
**And** 즉시 다음 행동 제안과 재평가 경로가 제공되어야 한다.

Coverage: FR11, UX-DR11.

### Story 3.3: 탐색/판단 히스토리 및 회고 화면

As a 반복 사용자,
I want 과거 탐색/판단 이력과 변경 이유를 조회하고 회고하며,
So that 다음 의사결정 품질을 높일 수 있다.

**Acceptance Criteria:**

**Given** 사용자의 과거 판단 기록이 있을 때
**When** 히스토리 화면을 열면
**Then** 의향/목표 변경 이력과 판단 결과가 시간순으로 표시되어야 하고
**And** 특정 기록에서 재평가를 재시작할 수 있어야 한다.

Coverage: FR36, FR37.

## Epic 4: 타이밍 신호와 알림 기반 의사결정

사용자가 시세/이벤트 기반 신호를 받고, 개인 조건에 맞는 알림으로 행동 타이밍을 잡을 수 있다.

### Story 4.1: 시세/이벤트 신호 수집 및 정규화

As a 타이밍 민감 사용자,
I want 시세/이벤트 신호가 표준 형식으로 수집되어 판단에 반영되고,
So that 외부 변화에 맞춰 선택을 조정할 수 있다.

**Acceptance Criteria:**

**Given** 외부 신호 소스가 연결된 상태에서
**When** 새로운 시세/이벤트 데이터가 유입되면
**Then** 표준 스키마로 정규화되어 저장되어야 하고
**And** 판단 생성 시 최신 신호가 반영되어야 한다.
**And** 외부 신호 지연/타임아웃 시 마지막 검증 신호로 degraded 처리하고 지연 메트릭을 기록해야 한다.
**And** 스키마 불일치 신호는 격리 큐로 이동하고 핵심 판단 플로우를 차단하지 않아야 한다.

Coverage: FR19.

### Story 4.2: 사용자 알림 기준 설정 및 수정

As a 사용자,
I want 조건 기반 알림 규칙을 직접 설정/수정하고,
So that 내 상황에 맞는 타이밍 알림만 받을 수 있다.

**Acceptance Criteria:**

**Given** 알림 설정 화면에서
**When** 사용자가 가격/시간/상태 조건을 저장하면
**Then** 알림 규칙이 사용자별로 저장되어야 하고
**And** 규칙 수정 시 즉시 새 조건이 적용되어야 한다.
**And** 권한 없는 알림 규칙 변경 요청은 403으로 거부되고 감사 로그를 남겨야 한다.
**And** 규칙 저장 실패 시 기존 규칙을 보존하고 사용자에게 복구 가이드를 제공해야 한다.

Coverage: FR21.

### Story 4.3: 조건 충족 알림 전달과 실패 격리

As a 사용자,
I want 조건 충족 시 알림을 받고 실패해도 핵심 판단 플로우가 유지되며,
So that 서비스 신뢰를 유지한 채 타이밍 기회를 놓치지 않을 수 있다.

**Acceptance Criteria:**

**Given** 알림 규칙 조건이 충족되었을 때
**When** 알림 발송 처리가 실행되면
**Then** 알림은 정책 SLA 내 전달되어야 하고
**And** 알림 전송 실패가 발생해도 판단 카드 조회/결정 플로우는 정상 동작해야 한다.

Coverage: FR20, NFR3.

## Epic 5: 운영/지원 신뢰 운영과 서비스 모드 제어

운영/지원 담당자가 지표·근거·문의 대응·정책 적용·DSAR·서비스 모드를 운영할 수 있다.

### Story 5.1: 운영 콘솔의 KPI/가드레일/서비스 모드 보드

As a 운영 담당자,
I want KPI와 가드레일, 현재 서비스 모드를 한 화면에서 확인하고,
So that 주간 판정과 운영 결정을 빠르게 내릴 수 있다.

**Acceptance Criteria:**

**Given** 운영 권한 사용자가 콘솔에 접근하면
**When** 대시보드를 조회할 때
**Then** KPI/가드레일/모드 상태가 최신 스냅샷으로 표시되어야 하고
**And** 상태 반영 지연 기준과 접근권한 정책을 충족해야 한다.

Coverage: FR22, FR23, FR39, NFR20.

### Story 5.2: 문의 대응용 판단 근거 로그 조회

As a 운영/지원 담당자,
I want 사용자 문의 건에서 판단 근거 이력을 조회하고,
So that 일관된 근거 기반 답변과 이슈 처리를 할 수 있다.

**Acceptance Criteria:**

**Given** 문의 티켓과 사용자 식별 정보가 있을 때
**When** 근거 로그 조회를 요청하면
**Then** 해당 시점의 판단 근거/입력/결과가 추적 가능하게 보여야 하고
**And** 민감 조회는 reason code와 감사 로그를 반드시 남겨야 한다.

Coverage: FR24, NFR9.

### Story 5.3: 노출 정책/DSAR 처리/모드 전환 운영 액션

As a 운영 담당자,
I want 저품질 의향 정책 적용, DSAR 처리, fallback 모드 전환을 수행하고,
So that 신뢰/규정/안정성 리스크를 통제할 수 있다.

**Acceptance Criteria:**

**Given** 운영 액션 권한이 있는 상태에서
**When** 노출 제한, DSAR 처리, 모드 전환을 실행하면
**Then** 각 액션은 정책 규칙과 승인 로그에 따라 처리되어야 하고
**And** 모드 전환 후에도 핵심 여정은 정의된 기준으로 서비스되어야 한다.

Coverage: FR25, FR26, FR38, NFR4, NFR8.

## Epic 6: 계측·실험·품질 드리프트 관리

제품이 핵심 이벤트를 계측하고, 실험군/대조군 비교 및 드리프트 감지로 학습 루프를 운영할 수 있다.

### Story 6.1: 이벤트 계약 기반 계측 파이프라인과 dedupe

As a 데이터 운영팀,
I want 버전드 이벤트 계약과 dedupe 규칙으로 핵심 여정을 계측하고,
So that KPI 계산의 신뢰도를 확보할 수 있다.

**Acceptance Criteria:**

**Given** 핵심 여정 이벤트가 발생할 때
**When** 이벤트가 수집 파이프라인으로 적재되면
**Then** 공통 필드(eventId/occurredAt/traceId/schemaVersion)가 검증되어야 하고
**And** 중복 이벤트는 dedupe key로 제거되며 품질 지표가 기록되어야 한다.

Coverage: FR27, UX-DR20, Event Contract, dedupe rule.

### Story 6.2: 사용자 고정 실험군 할당과 성과 비교

As a 실험 운영자,
I want 사용자 단위로 일관된 실험군 할당과 대조군 비교를 수행하고,
So that 기능 변화의 인과 효과를 신뢰성 있게 해석할 수 있다.

**Acceptance Criteria:**

**Given** 실험이 활성화된 상태에서
**When** 사용자가 재방문하거나 여러 세션에서 활동하면
**Then** 동일 사용자의 실험군 할당은 일관되게 유지되어야 하고
**And** 실험군/대조군 비교 리포트에 KPI 차이와 통계 검증 결과가 포함되어야 한다.
**And** 할당 키 누락/충돌 발생 시 재할당 대신 요청을 격리하고 `allocation_mismatch` 경고를 기록해야 한다.
**And** 할당 일치율이 NFR21 임계치 미만이면 실험 리포트 집계를 자동 중지하고 운영 경고를 발생해야 한다.

Coverage: FR28, FR40, NFR21.

### Story 6.3: 주간 리포트 자동화와 드리프트 감지

As a 운영 리더,
I want 주간 KPI/가드레일 리포트와 드리프트 경보를 자동으로 받고,
So that Go/Hold/Stop 의사결정을 빠르게 실행할 수 있다.

**Acceptance Criteria:**

**Given** 주간 집계 시점이 도래하면
**When** 리포트 파이프라인이 실행되면
**Then** KPI/가드레일/판정 권고가 생성되어야 하고
**And** 드리프트 임계치 초과 시 관찰-제한-롤백 후보 상태가 기록되어야 한다.

Coverage: FR29, FR30, NFR22.

## Epic 7: 파트너 API 연동과 감사 가능한 외부 신호 제공

파트너가 안전한 권한/쿼터/오류규약 하에 익명/집계 신호를 활용할 수 있다.

### Story 7.1: 파트너 인증키 발급과 권한/쿼터 정책

As a 파트너 운영자,
I want 파트너별 인증키와 권한, 쿼터 정책을 관리하고,
So that 안전한 범위 내에서 API를 사용할 수 있다.

**Acceptance Criteria:**

**Given** 신규 파트너가 온보딩 심사를 통과했을 때
**When** 운영자가 파트너 프로필을 발급하면
**Then** 인증키/권한범위/쿼터가 함께 생성되어야 하고
**And** 권한 외 요청은 정책 오류로 차단되어야 한다.

Coverage: FR31, FR33, NFR6, NFR19.

### Story 7.2: 익명/집계 신호 제공 API와 버전드 오류 규약

As a 파트너 개발자,
I want 익명/집계 신호 API를 버전 정책과 표준 오류 형식으로 사용하고,
So that 안정적으로 연동을 운영할 수 있다.

**Acceptance Criteria:**

**Given** 인증된 파트너 요청이 들어올 때
**When** 신호 조회 API를 호출하면
**Then** 개인 식별이 제거된 익명/집계 데이터만 반환되어야 하고
**And** 오류는 표준 코드/메시지/복구 가이드를 포함한 버전드 규약으로 응답해야 한다.
**And** 계약 스키마 위반 응답은 버전드 오류 규약(`schema_version_mismatch`)으로 반환해야 한다.
**And** 쿼터 초과/레이트 리밋 시 표준 재시도 지침과 `Retry-After` 정보를 제공해야 한다.

Coverage: FR32, FR34, NFR17, NFR18.

### Story 7.3: 파트너 접근 감사 로그와 온보딩 게이트

As a 컴플라이언스 운영자,
I want 파트너 접근 이력을 감사하고 온보딩 게이트를 추적하며,
So that 정책 위반과 리스크를 조기에 통제할 수 있다.

**Acceptance Criteria:**

**Given** 파트너 API 사용 및 온보딩 절차가 진행될 때
**When** 감사 로그와 게이트 상태를 조회하면
**Then** 계약/보안검토/스키마검증/샌드박스/운영승인 단계가 추적 가능해야 하고
**And** 접근/데이터 사용 이력은 감사 리포트로 추출 가능해야 한다.

Coverage: FR35, 온보딩 게이트 요구사항.

## Story Release & KPI Map (Legacy Reference, Non-Executable)

- Story 1.1 | Release: MVP | Primary KPI: 탐색 시간 절감률(기반), 계측 품질
- Story 1.2 | Release: MVP | Primary KPI: 의향 등록률
- Story 1.3 | Release: MVP | Primary KPI: 의향 등록률
- Story 1.4 | Release: MVP | Primary KPI: 계측 품질, 계약 준수율, 성능예산 준수율
- Story 2.1 | Release: MVP | Primary KPI: 판단 활용률
- Story 2.2 | Release: MVP | Primary KPI: 판단 활용률, 탐색 시간 절감률
- Story 2.3 | Release: MVP | Primary KPI: 판단 활용률, 의사결정 만족도
- Story 3.1 | Release: MVP | Primary KPI: 보류 후 재전환율(14일)
- Story 3.2 | Release: MVP | Primary KPI: 보류 후 재전환율(14일)
- Story 3.3 | Release: P2+ | Primary KPI: 의사결정 만족도, 탐색 시간 절감률
- Story 4.1 | Release: MVP | Primary KPI: 판단 활용률
- Story 4.2 | Release: MVP | Primary KPI: 보류 후 재전환율(14일)
- Story 4.3 | Release: MVP | Primary KPI: 보류 후 재전환율(14일), 가드레일(알림 SLA)
- Story 5.1 | Release: MVP | Primary KPI: 가드레일 충족률, 주간 판정 신뢰도
- Story 5.2 | Release: MVP | Primary KPI: 의사결정 만족도(지원 품질 간접)
- Story 5.3 | Release: MVP | Primary KPI: 가드레일 충족률
- Story 6.1 | Release: MVP | Primary KPI: 계측 품질(중복률/누락률)
- Story 6.2 | Release: MVP | Primary KPI: 실험 해석 신뢰도(할당 일치율)
- Story 6.3 | Release: MVP | Primary KPI: 주간 판정 실행률, 드리프트 대응시간
- Story 7.1 | Release: P1.5 | Primary KPI: 파트너 운영 안정성(권한/쿼터 위반률)
- Story 7.2 | Release: P1.5 | Primary KPI: 파트너 API 품질(오류 규약 준수율)
- Story 7.3 | Release: P1.5 | Primary KPI: 감사 추적 완결성
