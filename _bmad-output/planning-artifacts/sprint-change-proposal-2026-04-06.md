# Sprint Change Proposal - 2026-04-06

## 1) 이슈 요약

- 트리거: `Implementation Readiness Assessment (2026-04-06)` 결과 `NEEDS WORK`
- 치명 이슈: 0건
- 보완 필요: 8건 (주요 3, 경미 5)
- 핵심 변경 요구:
  1. UX 액션 용어와 PRD FR 용어 매핑 표 추가
  2. UX 여정 이벤트와 PRD 핵심 이벤트(11종) 1:1 매핑 명시
  3. Story `2.1/4.1/4.2/6.2/7.2` 예외/오류 AC 보강
  4. Greenfield 초기 `CI/CD + 계약검증 + 성능예산` baseline 스토리 추가

발견 시점: 구현 착수 직전 readiness 게이트에서 확인됨. 현재 수정은 선제적 품질 리스크 완화 목적이며, 현재 MVP 방향 자체를 뒤집는 사안은 아님.

## 2) 영향 분석

### Epic 영향

- Epic 1: 운영 baseline 스토리 추가 필요(신규 Story 추가)
- Epic 2/4/6/7: 지정된 스토리 AC에 실패/예외/권한/계약/타임아웃 기준 보강 필요
- Epic 순서/우선순위: 대분류 순서(E1~E7)는 유지. 단, Epic 1 내부에서 baseline story를 초기에 수행하도록 우선순위 상향 필요

### 아티팩트 충돌/갭

- PRD: 핵심 이벤트 11종은 언급되어 있으나 명시 목록/정의/UX 이벤트 매핑 표가 없음
- UX: 여정 이벤트가 정의되어 있으나 PRD canonical 이벤트와 1:1 공식 매핑 부재
- Epics/Stories: 오류/예외 AC가 일부 Happy path 중심
- Architecture: 품질 게이트 원칙은 존재하나 스토리 단의 실행 항목으로 직접 추적되는 연결이 약함

### 기술 영향

- CI: 계약검증 및 성능예산 검사 추가로 초기 파이프라인 설정 필요
- 테스트: 예외 경로 AC 반영으로 계약/통합/회귀 테스트 케이스 증가
- 릴리즈 리스크: 단기 구현량은 증가하나, 중기 재작업/품질 사고 리스크는 감소

## 3) 경로 평가 (Checklist Section 4)

### Option 1 - Direct Adjustment

- 판단: **Viable**
- 이유: 현재 문서/스토리 체계 유지한 채 용어/이벤트 표준과 AC를 보강하면 해결 가능
- 노력: Medium
- 리스크: Low~Medium

### Option 2 - Potential Rollback

- 판단: **Not viable**
- 이유: 현재는 방향 오류보다 명세 정합성/품질 기준 누락 문제이며 롤백 실익이 낮음
- 노력: High
- 리스크: Medium

### Option 3 - PRD MVP Review

- 판단: **Partially viable (보조 옵션)**
- 이유: MVP 축소가 아니라 명세 정밀화 이슈가 본질. MVP 범위 축소 필요성은 낮음
- 노력: Medium
- 리스크: Medium

### 권고 경로

- 선택: **Option 1 (Direct Adjustment) + 최소 Hybrid(운영 baseline story 추가)**
- 근거: 일정 충격 최소화, 현재 계획/아키텍처 보존, 품질 게이트 선반영 가능

## 4) 상세 변경 제안 (Artifact별 old -> new)

### A. PRD 변경 제안

#### A-1) 핵심 이벤트 11종 명시 섹션 추가

문서: `_bmad-output/planning-artifacts/prd.md`

- OLD
  - "핵심 이벤트 11종 계측" 문구만 존재, 이벤트 목록/정의 미명시

- NEW (추가 섹션)

```md
### 핵심 이벤트 정의 (MVP 11종)

| Event Name | 정의 | 주요 트리거 |
| --- | --- | --- |
| view_landing | 랜딩/진입 화면 노출 | 첫 진입/재진입 |
| start_intent_input | 의향 입력 시작 | 입력 플로우 진입 |
| complete_intent_input | 의향 입력 완료 | 필수 입력 저장 성공 |
| view_decision_card | 판단 카드 노출 | 결과 화면 렌더 |
| select_action | 행동 선택 완료 | 진행/보류/알림/드랍 선택 |
| hold_reason_submit | 보류 사유 제출 | 보류 사유 저장 |
| revisit_decision | 재평가 진입 | 보류/드랍 맥락 복원 후 재진입 |
| convert_after_hold | 보류 후 전환 | 보류 이후 진행/완료로 전환 |
| decision_satisfaction_submit | 만족도 제출 | 판단 후 만족도 기록 |
| decision_card_error | 판단 카드 생성/노출 실패 | API/렌더 실패 |
| report_low_quality_input | 저품질 입력 신고 | 신고 제출 완료 |
```

Rationale: PRD의 "핵심 이벤트 11종"을 실행 가능한 계약 단위로 고정.

#### A-2) UX 이벤트 1:1 매핑 표 추가

- NEW (추가 섹션)

```md
### UX 여정 이벤트 -> PRD 핵심 이벤트 1:1 매핑

| UX Journey Event | PRD Canonical Event |
| --- | --- |
| state_assessed | start_intent_input |
| next_step_selected | complete_intent_input |
| decision_card_viewed | view_decision_card |
| preference_reason_logged | select_action |
| candidate_compared | select_action |
| tradeoff_reviewed | select_action |
| results_reordered | view_decision_card |
| decision_submitted | select_action |
| decision_context_saved | hold_reason_submit |
| revisit_flow_started | revisit_decision |
| low_quality_reported | report_low_quality_input |
```

Rationale: UX 계측 이벤트와 KPI 원천 이벤트 간 추적성 확보.

---

### B. Epics 변경 제안

문서: `_bmad-output/planning-artifacts/epics.md`

#### B-1) Action Taxonomy(용어 매핑 표) 추가

- OLD
  - FR7: 구매/판매/보류/대안
  - UX-DR7: 진행/보류/알림/드랍
  - 공식 매핑 표 없음

- NEW (Overview 아래 추가)

```md
### Action Taxonomy Mapping (UX <-> FR)

| UX Action | FR7 Action | 규칙 |
| --- | --- | --- |
| 진행 | 구매 또는 판매 | 사용자 컨텍스트(`disposal_intent_type`, 보유 상태)에 따라 결정 |
| 보류 | 보류 | 동일 의미 |
| 알림 | 대안 | 즉시 거래 대신 조건 충족 시점 행동(재진입 유도 대안) |
| 드랍 | 대안 | 현재 실행 안 함 + 사유/재평가 조건 저장 |
```

Rationale: 스토리/UI/계측 용어 드리프트 방지.

#### B-2) Story 2.1 예외/오류 AC 보강

- OLD
  - 성공 응답 중심 AC 2개

- NEW (AC 추가)

```md
**And** 입력 유효성 위반 시 400 규약 오류(`code/message/recovery_guide`)를 반환해야 한다.
**And** 의향 데이터 신선도 임계치 초과 시 fallback 판단과 `decision_card_error` 이벤트를 기록해야 한다.
```

#### B-3) Story 4.1 예외/오류 AC 보강

- NEW (AC 추가)

```md
**And** 외부 신호 지연/타임아웃 시 마지막 검증된 신호로 degraded 처리하고 지연 메트릭을 기록해야 한다.
**And** 스키마 불일치 신호는 격리 큐로 이동하고 핵심 판단 플로우를 차단하지 않아야 한다.
```

#### B-4) Story 4.2 예외/오류 AC 보강

- NEW (AC 추가)

```md
**And** 권한 없는 알림 규칙 변경 요청은 403으로 거부되고 감사 로그를 남겨야 한다.
**And** 규칙 저장 실패 시 기존 규칙을 보존하고 사용자에게 복구 가이드를 제공해야 한다.
```

#### B-5) Story 6.2 예외/오류 AC 보강

- NEW (AC 추가)

```md
**And** 할당 키 누락/충돌이 발생하면 재할당 대신 요청을 격리하고 `allocation_mismatch` 경고를 기록해야 한다.
**And** 일치율이 NFR21 임계치 미만이면 실험 리포트 집계를 자동 중지하고 운영 경고를 발생해야 한다.
```

#### B-6) Story 7.2 예외/오류 AC 보강

- NEW (AC 추가)

```md
**And** 계약 스키마 위반 응답은 버전드 오류 규약(`schema_version_mismatch`)으로 반환해야 한다.
**And** 쿼터 초과/레이트 리밋 시 표준 재시도 지침과 `Retry-After` 정보를 제공해야 한다.
```

#### B-7) Greenfield 운영 baseline 스토리 추가 (Epic 1)

- NEW Story

```md
### Story 1.4: CI/CD + 계약검증 + 성능예산 Baseline 구축

As a 개발팀,
I want Greenfield 초기 단계에서 CI/CD 품질 게이트와 계약검증/성능예산 baseline을 구성하고,
So that 이후 스토리 구현이 일관된 품질 기준을 자동 충족하도록 보장할 수 있다.

**Acceptance Criteria:**

**Given** 메인 브랜치에 변경이 발생했을 때
**When** CI 파이프라인이 실행되면
**Then** lint/typecheck/unit test/contract check/perf budget 체크가 모두 실행되어야 하고
**And** 계약 위반 또는 성능예산 초과 시 merge가 차단되어야 한다.

Coverage: NFR1, NFR2, NFR11, NFR18, Architecture Quality Gates.
```

Rationale: Greenfield 초기 품질 기준을 스토리 단위로 추적 가능화.

---

### C. Architecture/UX 정합성 업데이트 제안

문서: `_bmad-output/planning-artifacts/architecture.md`, `_bmad-output/planning-artifacts/ux-design-specification.md`

- Architecture
  - 이벤트 계약 섹션에 "PRD 핵심 이벤트 11종 canonical" 참조 링크 추가
  - 품질 게이트 섹션에 Story 1.4 추적 포인트 추가

- UX
  - Journey 이벤트 목록에 canonical event alias 컬럼 추가
  - ActionDecisionBar 액션 라벨에 UX<->FR 매핑 규칙 주석 추가

## 5) 구현 핸드오프 계획

### 변경 범위 분류

- 분류: **Moderate**
- 사유: 문서 4종(PRD/Epics/UX/Architecture) 동시 정합화 + backlog story 추가 + AC 보강 필요

### 권장 담당/책임

- Product Owner / Scrum Master
  - Story 1.4 추가 및 우선순위 재정렬
  - Story 2.1/4.1/4.2/6.2/7.2 AC 변경 승인
- Architect
  - 이벤트 canonical 계약 및 CI/perf gate 정합성 검증
- Dev Team
  - AC 반영 구현/테스트/CI 파이프라인 반영
- QA
  - 예외 시나리오 및 계약검증 케이스 확대

### 성공 기준

- 용어 매핑 표 + 이벤트 1:1 표가 PRD/Epics/UX에 반영됨
- 지정 5개 스토리에 오류/예외 AC가 반영됨
- Story 1.4(운영 baseline)가 backlog에 추가되고 선행 수행 순서 합의됨
- readiness 상태가 `NEEDS WORK` -> `READY (조건부)` 이상으로 상향됨

## 6) 체크리스트 진행 현황

### Section 1 - Trigger/Context
- [x] 1.1 트리거 스토리/문서 식별 완료 (Readiness report)
- [x] 1.2 문제 정의 완료 (정합성/AC/운영 baseline 갭)
- [x] 1.3 근거 확보 완료 (assessment 결과 8건)

### Section 2 - Epic Impact
- [x] 2.1 현재 epic 영향 평가 완료
- [x] 2.2 epic-level 변경안 도출 완료
- [x] 2.3 후속 epic 영향 점검 완료
- [x] 2.4 신규 story 필요성 확인 완료
- [x] 2.5 epic 우선순위 재조정 필요 확인 완료

### Section 3 - Artifact Impact
- [x] 3.1 PRD 충돌/갭 식별 완료
- [x] 3.2 Architecture 연계 변경 식별 완료
- [x] 3.3 UX 연계 변경 식별 완료
- [x] 3.4 부수 아티팩트(CI/테스트) 영향 식별 완료

### Section 4 - Path Forward
- [x] 4.1 Option 1 평가 완료 (Viable)
- [x] 4.2 Option 2 평가 완료 (Not viable)
- [x] 4.3 Option 3 평가 완료 (Partially viable)
- [x] 4.4 권고 경로 선정 완료 (Option 1 + Hybrid)

### Section 5 - Proposal Components
- [x] 5.1 이슈 요약 완료
- [x] 5.2 영향 요약 완료
- [x] 5.3 권고 경로/근거 완료
- [x] 5.4 MVP 영향 및 실행계획 완료
- [x] 5.5 핸드오프 계획 완료

### Section 6 - Final Review/Handoff
- [x] 6.1 체크리스트 완결성 점검 완료
- [x] 6.2 제안서 일관성 점검 완료
- [x] 6.3 사용자 승인 완료 (`2026-04-06`, 응답: `c`)
- [N/A] 6.4 `sprint-status.yaml` 구조 변경 없음 (에픽/스토리 추가·삭제·리넘버링 미발생)
- [x] 6.5 최종 핸드오프 확정 완료 (PO/SM + Architect + Dev + QA)

## 7) 제안 결론

- 권고: 문서/스토리 Direct Adjustment를 즉시 수행하고, Story 1.4를 Epic 1 선행 backlog로 반영
- 기대효과: 구현 단계 재작업/해석 불일치/품질게이트 누락 리스크를 초기 단계에서 차단
- 실행 결과: `prd.md`, `epics.md`, `ux-design-specification.md`, `architecture.md` 반영 완료

## 8) AC6 정정 제안 (2026-04-06)

### 8.1 이슈 요약

- 트리거: Story `1.4` AC6(Branch Protection Required checks 강제) 검증 단계
- 문제 유형: 구현 결함이 아닌 외부 플랫폼/요금제 제약
- 근거:
  - `gh api .../branches/main/protection` 호출 403
  - 응답 메시지: `Upgrade to GitHub Pro or make this repository public to enable this feature.`

### 8.2 영향 분석

- Epic 영향: Epic 1 Story 1.4 완료 판정이 외부 의존성으로 지연
- 아티팩트 영향:
  - `epics.md` Story 1.4 AC에 운영 블로커 처리 규칙 명시 필요
  - Story 구현 문서(`1-4-...md`)에 AC6 블로커 분류 및 해소 절차 반영 필요
- 일정 영향: 기능 개발 자체 영향은 경미하나, 운영 전환 Go 조건에 직접 영향

### 8.3 권고 경로

- 선택: Option 1 (Direct Adjustment)
- 조치:
  - AC6를 "지원 플랜에서는 강제, 미지원 플랜에서는 운영 전환 블로커 유지"로 명확화
  - 해소 조건을 두 가지로 고정:
    1. 저장소 Public 전환
    2. GitHub Pro/Team 업그레이드
- 노력/리스크:
  - 문서 반영 노력: Low
  - 기술 리스크: Low
  - 운영 리스크: Medium (블로커 미해소 시 main 보호 미보장)

### 8.4 상세 변경 반영

- Stories:
  - Story 1.4 AC에 AC7(플랜 미지원 시 블로커 처리) 추가
  - Story 1.4 체크리스트/완료노트/해소계획 업데이트
- Epics:
  - Story 1.4 AC에 Branch Protection/Rulesets 지원 여부별 처리 규칙 추가
- Sprint 상태:
  - 상태값 스키마는 유지하고, Story 1.4는 `in-progress` + 외부 블로커로 운영

### 8.5 핸드오프

- PO/SM:
  - 저장소 정책 선택(공개 전환 vs Pro/Team 업그레이드) 의사결정
  - Story 1.4 완료 조건에 AC6 블로커 해소 증적 포함 승인
- Dev/Ops:
  - 정책 적용 후 Required checks 6종 강제 설정 및 증적 캡처
- QA:
  - 테스트 PR에서 required checks 미통과 시 merge 차단 동작 재검증

## 9) 최종 승인 및 라우팅

- 승인 상태: **Approved**
- 승인 일자: **2026-04-06**
- 승인 결과: AC6 정정 제안을 포함한 Sprint Change Proposal 전체 반영 확정
- 변경 범위 분류: **Moderate** (문서 정합화 + 운영 블로커 관리)

### 라우팅 확정

- Product Owner / Scrum Master
  - AC6 블로커 해소 경로 결정(Public 전환 또는 Pro/Team 업그레이드)
  - Story 1.4 완료 조건에 "Required checks 강제 증적" 승인 기준 반영
- Development / Operations
  - 저장소 설정 적용 후 `main` Required checks 6종 강제 설정
  - 테스트 PR로 차단 동작 증적(설정 화면/체크 로그) 제출
- QA
  - required checks 누락 시 merge 차단 회귀 검증
  - Story 1.4 종료 전 AC6/AC7 충족 여부 최종 검증

### 완료 판정 기준 (Story 1.4)

1. CI 6개 게이트(`lint`,`typecheck`,`unit`,`contracts`,`e2e`,`perf-budget`)가 실행/실패 차단 동작을 유지한다.
2. `main` Branch Protection/Rulesets에서 위 6개가 Required checks로 강제된다.
3. 증적 확인 후 Story `1-4-ci-cd-계약검증-성능예산-baseline-구축` 상태를 `done`으로 전환한다.

---

검토 옵션: Continue [c] / Edit [e]
