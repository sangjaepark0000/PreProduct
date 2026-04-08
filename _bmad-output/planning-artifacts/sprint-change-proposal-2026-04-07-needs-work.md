# Sprint Change Proposal - 2026-04-07 (Needs Work Remediation)

## 1) 이슈 요약

- 최종 상태: `NEEDS WORK`
- 확인된 이슈: 총 6개 (`critical` 1, `major` 3, `warning` 2)
- 핵심 차단 이슈:
  - `epics.md`에서 Legacy 실행 기준(1~7)과 Active 실행 기준(A~C)이 동시에 존재해 구현 기준 혼선 발생
- 문제 유형 분류:
  - 요구사항 오해가 아니라, 문서/운영 기준의 동시 표기에서 발생한 실행 기준 충돌
- 근거:
  - `epics.md`에 `Legacy Epic Details`와 `Active MVP Epics`가 함께 존재
  - `sprint-status.yaml`은 기존 `epic-1~7` 상태를 유지하고 있어 Active A~C와 불일치

## 2) 영향 분석

### Epic 영향

- 직접 영향: Epic A, B, C
- 간접 영향: Legacy Epic 1~7 (실행 기준에서 제외 필요)
- 현 상태 리스크:
  - 스토리 생성/구현 대상 선택 시 팀마다 기준이 달라질 수 있음
  - Done/Backlog 해석이 달라져 진행률/완료 판정이 왜곡될 수 있음

### 아티팩트 영향

- `epics.md`: 실행 기준 잠금 규칙(Execution Baseline Lock) 명시 필요
- `sprint-status.yaml`: 실행 상태 키를 `epic-a~c`로 재정렬 필요
- `prd.md` / `architecture.md` / `ux-design-specification.md`:
  - 근거 링크를 최신 변경제안 문서로 통일 필요

### 기술/프로세스 영향

- 개발 우선순위 혼선
- QA 시나리오 기준 불일치
- 릴리즈 게이트에서 "무엇이 MVP 범위인가" 판단 오류 가능성

## 3) 체크리스트 진행 결과

### Section 1 - Trigger/Context

- [x] 1.1 트리거 스토리 식별: 실행 기준 충돌 이슈(문서/스프린트 상태 불일치)
- [x] 1.2 문제 정의: 이중 실행 기준으로 인한 구현 기준 혼선
- [x] 1.3 증거 확보: 문서 내 Legacy/Active 공존 + sprint-status 불일치

### Section 2 - Epic Impact

- [x] 2.1 현재 에픽 평가: A~C 실행 가능, Legacy는 비실행 참조로 격리 필요
- [x] 2.2 에픽 변경 필요: 실행 기준을 A~C로 강제
- [x] 2.3 후속 에픽 영향: P1.5+ 항목은 유지하되 실행 큐 제외
- [x] 2.4 신규/무효화 점검: 신규 에픽 추가 없음, Legacy 실행 무효화 필요
- [x] 2.5 우선순위 조정: A1 -> A2 -> A3 -> B1 -> B2 -> B3 -> C1 -> C2 -> C3

### Section 3 - Artifact Conflict & Impact

- [x] 3.1 PRD: Scope Override 링크 최신화 필요
- [x] 3.2 Architecture: Correct Course delta source 링크 최신화 필요
- [x] 3.3 UX: Scope Override 링크 최신화 필요
- [x] 3.4 기타 아티팩트: sprint-status.yaml 실행 키 불일치 수정 필요

### Section 4 - Path Forward

- [x] 4.1 Option 1 Direct Adjustment: Viable (Effort: Low, Risk: Low)
- [ ] 4.2 Option 2 Rollback: Not viable (Effort: High, Risk: Medium)
- [x] 4.3 Option 3 MVP Review: Viable (이미 2026-04-07 수행됨)
- [x] 4.4 권고안: Hybrid
  - Option 3로 이미 축소한 MVP를 유지
  - Option 1 방식으로 실행 기준 불일치만 즉시 제거

### Section 5 - Proposal Components

- [x] 5.1 이슈 요약 완료
- [x] 5.2 영향 분석 완료
- [x] 5.3 권고 경로/근거 완료
- [x] 5.4 MVP 영향/액션 플랜 완료
- [x] 5.5 핸드오프 계획 완료

### Section 6 - Final Review and Handoff

- [x] 6.1 체크리스트 완결성 검토 완료
- [x] 6.2 제안서 정확성 검토 완료
- [!] 6.3 사용자 최종 승인 필요
- [x] 6.4 sprint-status.yaml 반영 완료 (`epic-a~c` 기준으로 갱신)
- [!] 6.5 실행 핸드오프 확인 필요

## 4) 상세 변경 제안 (old -> new)

### A. epics.md

Section: Epic List 상단 실행 규칙

OLD:
- Active/Legacy 구분 문구가 하단 Addendum에만 있어 가시성이 낮음

NEW:
- `Execution Baseline Lock (2026-04-07 Hotfix)` 섹션 추가
- 실행 기준은 `Epic A~C` + `sprint-status.yaml`로 명시
- Legacy/Story KPI 맵은 Non-Executable 참조로 명시

Rationale:
- 구현자가 문서 상단에서 즉시 실행 기준을 확인하게 하여 오해를 차단

### B. sprint-status.yaml

Section: `development_status`

OLD:
- `epic-1~7` 기준 상태 추적

NEW:
- `epic-a~c` + A1~C3 스토리 기준으로 재베이스
- `execution_baseline` 메타데이터 추가
- `legacy_tracking_snapshot`로 이전 상태를 별도 보존

Rationale:
- 실행 추적 단일 기준화 + 과거 기록 보존을 동시에 충족

### C. PRD / Architecture / UX 링크

OLD:
- 근거 문서: `sprint-change-proposal-2026-04-07.md`

NEW:
- 근거 문서: `sprint-change-proposal-2026-04-07-needs-work.md`

Rationale:
- 최신 승인/수정 이력 문서로 단일 참조 정합성 확보

## 5) 권고 접근 방식

- 권고 분류: **Moderate**
- 선택 경로: **Hybrid** (Option 3 유지 + Option 1 즉시 정합화)
- 노력: Low~Medium
- 리스크: Low
- 일정 영향: 당일 반영 가능, 구현 지연 최소화

## 6) 구현 핸드오프

- PO/SM
  - `epic-a~c` 기준 백로그 재정렬 확인
  - 신규 스토리 생성 시 Legacy ID 사용 금지
- Dev Team
  - 다음 구현 대상은 A1부터 시작
  - PR/커밋 설명에 `Epic A/B/C`만 사용
- QA
  - 테스트 플랜의 스토리 매핑을 A1~C3로 업데이트
- Architect
  - 경계 문서에서 P1.5+ 항목의 "설계 유지/구현 보류" 상태 재확인

## 7) 성공 기준

- 문서/상태 파일 모두에서 실행 기준이 A~C로 일치
- 신규 작업 항목 생성 시 Legacy 1~7 키가 더 이상 등장하지 않음
- 리뷰에서 "구현 기준 혼선" 재발 0건

---

작성일: 2026-04-07
작성 목적: NEEDS WORK 이슈(실행 기준 충돌) 해소

## 8) 승인 및 라우팅 기록

- 사용자 승인: `yes`
- 승인 일시: `2026-04-07`
- 변경 범위 분류: `Moderate`
- 라우팅:
  - Development Team: Epic A~C 기준으로 직접 구현 진행
  - Product Owner / Scrum Master: 백로그 키/우선순위 A1~C3 재정렬 및 Legacy 키 사용 차단
  - Product Manager / Architect: P1.5+ 재확장 경계 유지 검토(에스컬레이션 없음, 모니터링만 수행)
- 성공 기준 확인:
  - 실행 기준 단일화 완료 (`epics.md`, `sprint-status.yaml`)
  - 문서 참조 링크 정합성 완료 (`prd.md`, `architecture.md`, `ux-design-specification.md`)
