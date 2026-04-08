# Sprint Change Proposal - Analysis Restart

Date: 2026-04-07  
Author: SM (Correct Course)  
Project: PreProduct

## 1) 이슈 요약 (Trigger Summary)

- 트리거 스토리/상황: `Epic A` 실행 구간(`A0 done`, `A1~ backlog`)에서 사용자 의사결정 변경 발생
- 사용자 변경 요청: "현재 구현 된 것 날리고 분석을 하는 것부터 다시 시작"
- 문제 유형 분류:
  - 전략 재정의 (Strategic pivot)
  - 기존 실행 접근 철회 (Failed approach requiring different solution path)
- 증거:
  - `_bmad-output/implementation-artifacts/sprint-status.yaml` 에서 구현 단계 진행 상태 확인
  - `_bmad-output/planning-artifacts/prd-2026-04-07-round2-doc-aligned.md`, `epics.md`, `architecture-...`, `ux-...` 문서들이 MVP 축소 기준으로 이미 재정렬되어 있으나, 사용자 의사결정은 이를 포함한 "구현 단계 자체 중단 + 분석 재개"로 변경됨

## 2) 체크리스트 실행 결과

### Section 1 - Trigger & Context
- [x] 1.1 트리거 식별 완료
- [x] 1.2 문제 정의 완료
- [x] 1.3 증거 수집 완료

### Section 2 - Epic Impact
- [x] 2.1 현재 Epic 영향 평가 완료
- [x] 2.2 Epic 수준 변경 필요사항 도출 완료
- [x] 2.3 후속 Epic 영향 점검 완료
- [x] 2.4 무효화/신규 Epic 필요성 점검 완료
- [x] 2.5 우선순위 재정렬 필요성 확인 완료

### Section 3 - Artifact Conflict
- [x] 3.1 PRD 충돌 점검 완료
- [x] 3.2 Architecture 충돌 점검 완료
- [x] 3.3 UX 충돌 점검 완료
- [x] 3.4 기타 산출물(스프린트 상태/테스트/CI 문서) 점검 완료

### Section 4 - Path Forward
- [x] 4.1 Option 1 Direct Adjustment 평가 완료 (Not viable)
- [x] 4.2 Option 2 Potential Rollback 평가 완료 (Viable)
- [x] 4.3 Option 3 PRD MVP Review 평가 완료 (Viable)
- [x] 4.4 권고안 선택 완료 (Hybrid: Option 2 + Option 3)

### Section 5 - Proposal Components
- [x] 5.1~5.5 초안 작성 완료

### Section 6 - Final Review/Handoff
- [x] 6.1/6.2 제안서 정합성 검토 완료
- [!] 6.3 사용자 명시 승인 필요
- [!] 6.4 승인 후 `sprint-status.yaml` 반영 필요
- [!] 6.5 승인 후 최종 handoff 확정 필요

## 3) 영향 분석 (Impact Analysis)

### Epic 영향
- 현재 실행 기준 Epic A~C는 즉시 개발 진행 대상에서 제외되어야 함
- 기존 구현 완료 처리(`A0 done`)도 "실행 이력"으로만 보존하고, 새 기준선에서는 `backlog` 또는 `archived`로 재분류 필요
- 결과적으로 구현 위주의 Epic 로드맵은 일시 중지, 분석 산출물 중심 로드맵으로 전환 필요

### Story 영향
- 구현 스토리(A0~C3) 전체를 "실행 잠금 해제 전 대기" 상태로 변경
- 신규 분석 스토리(브리프/시장/기술/도메인/재정의 PRD)를 우선 배치

### 아티팩트 충돌
- PRD/Architecture/UX는 "MVP 축소 후 구현 진행" 관점으로 맞춰져 있음
- 사용자 최신 의사결정은 "분석으로 회귀"이므로, 해당 문서들은 authoritative 구현 기준에서 reference 기준으로 격하 필요

### 기술 영향
- 코드 삭제/롤백은 고위험 작업이므로 즉시 물리 삭제 대신:
  - 1) 구현 중단 선언
  - 2) 상태 파일 리셋
  - 3) 분석 재출발 산출물 확정
  - 4) 이후 선택적으로 코드 정리(보관/분리 브랜치) 수행

## 4) 권고 접근 (Recommended Approach)

선택안: **Hybrid (Option 2 + Option 3)**

- Option 1 (Direct Adjustment): **비권고**
  - Effort: Medium
  - Risk: High
  - 이유: "구현 진행 유지" 전제를 요구하므로 사용자 의도와 충돌
- Option 2 (Potential Rollback): **권고**
  - Effort: Medium
  - Risk: Medium
  - 이유: 구현 상태를 실행 기준에서 제거해 혼선 최소화 가능
- Option 3 (PRD MVP Review/분석 재개): **강권고**
  - Effort: Medium
  - Risk: Low
  - 이유: 문제정의/범위/우선순위를 다시 확정할 수 있어 이후 재개 비용 감소

종합 판단:
- 단기 일정은 2~4일 지연되지만, 잘못된 가정 위 구현 누적 리스크를 크게 줄인다.
- 팀 모멘텀 손실을 줄이기 위해 "완전 삭제"보다 "실행 기준 전환 + 분석 산출물 고정" 방식을 권장한다.

## 5) 상세 변경 제안 (Detailed Change Proposals)

### 5.1 Sprint Status 변경안

Artifact: `_bmad-output/implementation-artifacts/sprint-status.yaml`

OLD (요약):
- `epic-a: in-progress`
- `a0-starter-template-ci-baseline: done`

NEW (제안):
- `analysis-restart-2026-04-07: approved|pending` 필드 추가
- `development_status` 전체를 `backlog` 또는 `archived`로 재분류
- 구현 상태를 baseline truth에서 제외하고, analysis workflow 상태 파일을 source of truth로 전환

Rationale:
- 현재 실행 컨텍스트를 명시적으로 종료해야 이후 자동 라우팅/다음 스토리 생성 충돌을 막을 수 있음

### 5.2 Epics 변경안

Artifact: `_bmad-output/planning-artifacts/epics.md`

OLD:
- Active MVP Epic A~C가 구현 실행 기준

NEW:
- "Implementation Paused - Analysis Restart Baseline (2026-04-07)" 섹션 추가
- A~C는 `Execution Paused (Reference)`로 표시
- 분석 우선 신규 워크스트림 추가:
  - AR1: Problem Reframing
  - AR2: Market & Domain Revalidation
  - AR3: Technical Feasibility Recheck
  - AR4: Re-PRD Consolidation

Rationale:
- 스토리 생성 도구가 구현 스토리를 우선 선택하지 않도록 기준선 재작성 필요

### 5.3 PRD 변경안

Artifact: `_bmad-output/planning-artifacts/prd-2026-04-07-round2-doc-aligned.md` (또는 후속 통합 PRD)

OLD:
- "MVP 축소 + 즉시 구현" 기준

NEW:
- 상단 Notice에 "Analysis Restart Baseline (2026-04-07)" 추가
- 실행 범위를 "구현"에서 "가설/요구사항 재검증"으로 임시 전환
- MVP 기능 확정 문장을 "candidate" 상태로 조정

Rationale:
- PRD가 다시 요구사항 탐색 문서 역할을 수행하도록 목적 재정렬 필요

### 5.4 Architecture 변경안

Artifact: `_bmad-output/planning-artifacts/architecture-2026-04-07-round2-doc-aligned.md`

OLD:
- Next.js 중심 구현 우선순위/경계 확정

NEW:
- 아키텍처 결정을 "proposed" 상태로 표기
- 즉시 구현 강제 문구(First Implementation Priority) 제거 또는 보류 표시
- 재검증 체크리스트(스택, 경계, 운영 복잡도, 비용) 추가

Rationale:
- 분석 재시작 단계에서 기술결정을 잠정 상태로 두어 재검토 가능성 확보

### 5.5 UX 변경안

Artifact: `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-round2-doc-aligned.md`

OLD:
- MVP 핵심 플로우/화면이 구현 가이드로 고정

NEW:
- 핵심 플로우를 "실험 가설 플로우"로 재태깅
- 평가 지표/사용자 검증 시나리오(인터뷰/태스크 테스트) 우선 섹션 추가
- 컴포넌트 구현 우선순위를 "검증 우선순위"로 전환

Rationale:
- 디자인 산출물이 개발 명세에서 검증 계획으로 전환되어야 분석 단계 목적과 일치

## 6) MVP 영향 및 실행계획

### MVP 영향
- 현재 MVP는 "확정 범위"가 아니라 "가설 범위"로 되돌아감
- 구현 진행률 숫자는 당분간 경영/운영 의사결정 지표에서 제외 필요

### 상위 액션 플랜
1. 상태 동결: 구현 스토리 신규 착수 중단
2. 분석 재개: `Create Brief -> Market Research -> Technical Research -> Domain Research`
3. 재정의: `Create PRD`로 단일 기준 문서 재생성
4. 재진입 게이트: `Check Implementation Readiness` 통과 후에만 구현 재개

### 의존성/순서
- Brief가 선행돼야 리서치 질문 범위 고정 가능
- 리서치 산출물 없이 PRD 재작성 시 재작업 위험이 큼
- PRD/UX/Architecture/epics 재동기화 이후에만 sprint planning 재개 가능

## 7) 구현 인계 계획 (Implementation Handoff)

변경 규모 분류: **Major**

- Product Owner / Scrum Master:
  - 백로그 실행 상태 리셋
  - 분석 워크스트림 우선순위 고정
- Product Manager:
  - 문제정의/성공지표 재확정
  - MVP 범위 재승인
- Architect:
  - 기술결정 잠정화 및 재검증 항목 정의
- UX:
  - 구현명세 중심 문서를 검증계획 중심으로 전환
- Development Team:
  - 신규 기능 구현 동결
  - 코드/브랜치 보존 전략 수립(삭제 전 스냅샷)

성공 기준:
- 분석 산출물 4종(Brief/MR/TR/DR) 완료
- 재작성 PRD 1종 승인
- Readiness 보고서에서 implementation go 판정 획득

## 8) 승인 요청

본 제안은 "현재 구현 날리고 분석부터 재시작" 요청을 반영한 공식 변경안이다.

승인 여부:
- yes: 본 문서를 기준으로 상태 파일/핵심 문서를 즉시 업데이트
- revise: 수정할 섹션 지정 후 재작성
- no: 기존 구현 흐름 유지(권고하지 않음)

