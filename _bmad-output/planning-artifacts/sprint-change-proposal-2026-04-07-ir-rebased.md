# Sprint Change Proposal - 2026-04-07 (IR Rebased, No Overwrite)

## 1) 이슈 요약

- 트리거 근거: `implementation-readiness-report-2026-04-07.md` 결과 `NEEDS WORK`
- 핵심 이슈군(4/7 IR 기준):
  1. Starter Template/초기 CI 품질게이트 스토리 누락
  2. Active MVP FR27(핵심 이벤트 기록) 상위 표기 누락 위험
  3. UX/Architecture에서 Active MVP와 Legacy 참조 혼재로 해석 편차 위험
  4. 일부 AC 문구의 정량 기준 연결 불충분
- 문제 유형: 신규 요구 등장보다는, 4/7 범위축소 이후 실행 기준의 세부 정합성 부족
- 증거: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md`

## 2) 체크리스트 진행 결과

### Section 1 - Trigger and Context

- [x] 1.1 트리거 스토리 식별
  - Story/영역: Epic A 시작부(A1 이전 선행조건) 및 Epic 헤더(추적성 표기)
- [x] 1.2 코어 문제 정의
  - 실행 기준은 맞지만, 착수 가드레일과 추적 표기가 상단에서 충분히 강제되지 않음
- [x] 1.3 근거 수집
  - IR 명시 이슈(Starter/CI, FR27 표기, 문서 혼재, AC 정량화)

### Section 2 - Epic Impact Assessment

- [x] 2.1 현재 에픽 평가
  - Epic A~C 구조는 유지 가능
- [x] 2.2 필요한 에픽 변경
  - Epic A 선행 Story `A0` 추가 필요
- [x] 2.3 잔여 에픽 영향
  - P1.5+ Deferred 영역은 구현 보류 유지
- [x] 2.4 무효화/신규 에픽 여부
  - 신규 "에픽" 불필요, 에픽 내 스토리 보강으로 해결 가능
- [x] 2.5 우선순위 재배치
  - `A0 -> A1 -> A2 -> A3 -> B1...` 순으로 재정렬 필요

### Section 3 - Artifact Conflict and Impact Analysis

- [x] 3.1 PRD 충돌 점검
  - 충돌 아님. Addendum 기준 유지, 실행 기준 표를 더 명확히 연결 필요
- [x] 3.2 Architecture 충돌 점검
  - 충돌 아님. Delta 우선 규칙이 있으나 Legacy 참조 경계 문구를 추가 정리 권장
- [x] 3.3 UX 충돌 점검
  - 충돌 아님. MVP 우선/Legacy 참조 구분을 화면 컴포넌트 우선순위 표로 명확화 필요
- [x] 3.4 기타 영향
  - `sprint-status.yaml`에 `a0-*` 스토리 키 추가 필요(승인 시)

### Section 4 - Path Forward Evaluation

- [x] 4.1 Option 1 Direct Adjustment: Viable
  - Effort: Low~Medium, Risk: Low
- [N/A] 4.2 Option 2 Rollback: Not viable
  - Effort: High, Risk: Medium, 현재 이슈와 부합하지 않음
- [x] 4.3 Option 3 MVP Review: Viable but Already Applied
  - 2026-04-07에 이미 범위 축소 반영 완료
- [x] 4.4 권고 경로
  - Selected: Hybrid (Option 1 + 기존 Option 3 유지)
  - Justification: 범위 재축소가 아니라 "실행 기준 강제력"을 보강하는 것이 정답

### Section 5 - Sprint Change Proposal Components

- [x] 5.1 이슈 요약 완료
- [x] 5.2 영향 분석 완료
- [x] 5.3 권고 경로 완료
- [x] 5.4 MVP 영향/액션 플랜 완료
- [x] 5.5 핸드오프 계획 완료

### Section 6 - Final Review and Handoff

- [x] 6.1 체크리스트 완결성 확인
- [x] 6.2 제안서 정합성 확인
- [!] 6.3 사용자 승인 필요
- [!] 6.4 `sprint-status.yaml` 반영은 승인 후 수행
- [!] 6.5 역할별 핸드오프 확정 필요

## 3) 권고 접근

- 분류: **Moderate**
- 권고안: **Direct Adjustment 중심 Hybrid**
- 일정 영향: 당일 반영 가능(문서/백로그 키 정리 중심)
- 리스크: 낮음(기능 범위 변경 없음)

## 4) 상세 변경 제안 (Before -> After)

### A. Epics 문서 보강

Story: `Epic A` 시작부
Section: Stories

OLD:
- A1부터 시작(Starter/CI 선행 스토리 없음)

NEW:
- `Story A0: Starter Template 초기화 + CI 품질게이트 baseline`
- A0 AC 최소 요건:
  - `pnpm lint`, `pnpm typecheck`, `pnpm test`(최소 단위), `contracts check` 실행 경로 정의
  - 실패 시 merge 차단 규칙 명시
  - `.env.example`/기본 정책 문서/실행 스크립트 정합성 확인

Rationale:
- IR의 Major 이슈(그린필드 선행조건 누락) 직접 해소

---

Story: `Epic A/C` 헤더 표기
Section: Core FR

OLD:
- 상단 Core FR에 FR27 표기가 약함(세부 스토리에만 산재)

NEW:
- Epic A 또는 C 헤더에 `FR27`을 명시적으로 병기
- 예: `Core FR: ... + FR27(핵심 이벤트 기록)`

Rationale:
- 상위 요약만 보는 구현자에게 계측 의무를 강제

---

Story: `A1~C3` AC 문구
Section: Acceptance Criteria

OLD:
- 일부 문구가 "즉시/자동" 등 정성 표현 중심

NEW:
- NFR/품질게이트 연결 수치로 통일
  - 예: "p95 2초", "실패율 <1%", "fallback E2E 100%"

Rationale:
- 테스트 가능성/게이트 자동화 강화

### B. PRD/Architecture/UX 실행 기준 표 단일화

Artifact: PRD, Architecture, UX
Section: Scope Priority / Addendum/Delta 인접 섹션

OLD:
- Active MVP 우선 규칙은 있으나 legacy 참조 경계가 본문 여러 위치에 분산

NEW:
- 3문서 공통 "Execution Baseline Table" 추가:
  - Active MVP (Now)
  - Deferred P1.5+
  - Legacy Reference (Non-Executable)
- 구현 판단은 "표 우선"으로 명시

Rationale:
- 문서 해석 편차 및 과구현 리스크 감소

### C. sprint-status.yaml 정합화 (승인 후)

Artifact: `_bmad-output/implementation-artifacts/sprint-status.yaml`

OLD:
- Epic A~C만 추적, A0 없음

NEW:
- `a0-starter-template-ci-baseline: backlog` 추가
- Epic A 진입 순서 주석 추가: `A0 선행 필수`
- last_updated 갱신

Rationale:
- 실행 추적과 문서 기준 일치

## 5) 구현 핸드오프

- Product Owner / Scrum Master
  - `A0` 스토리 추가 및 우선순위 재정렬
  - A0 완료 전 A1 착수 금지 규칙 공지
- Architect
  - A0의 품질게이트/계약체크 최소 기준 확정
- Development Team
  - A0 구현 후 A1~C3 진행
  - FR27 이벤트 계약 준수 확인
- QA
  - A0 게이트를 릴리즈 진입 조건으로 체크리스트화
  - AC 정량 문구 기반 테스트 케이스 갱신

## 6) 성공 기준

- 실행 기준 혼선 재발 0건
- A0 스토리 생성 및 상태 추적 반영
- Epic 헤더에서 FR27 가시성 확보
- A1~C3 AC 문구의 정량 기준 전환 완료

---

작성일: 2026-04-07
작성 기준: 4/7 IR(`implementation-readiness-report-2026-04-07.md`) 재기준화
비고: 기존 4/7 스프린트 변경 제안서 파일은 보존, 본 문서는 신규 산출물
