# Sprint Change Proposal - 2026-04-07 (Revised Option 3)

## 의도

기존 제안(문서 전반 동시 정리)은 정합성은 높지만 변경 반경이 넓다.
이번 `revise` 안은 **실행 혼선 제거에 필요한 최소 변경**만 먼저 적용한다.

## 1) 이슈 요약 (4/7 IR 기준)

- 기준 문서: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md`
- 핵심 문제:
  1. Starter/CI 선행 스토리 명시 부족
  2. FR27 계측 의무의 상단 가시성 부족
  3. 문서 해석 편차 가능성(Active vs Legacy)

## 2) Revised 전략 (최소 변경)

### 전략 원칙

- 실행 반경 최소화
- 기존 4/7 산출물 보존
- 개발 착수 지연 방지

### 이번 라운드에서 수정할 것 (IN)

1. `epics.md`
- Epic A 앞에 `A0` 스토리 추가(Starter + CI baseline)
- Epic A/C 헤더에 `FR27` 명시 상향
- A1~C3 AC의 정량 문구 부족분 최소 보강

2. `sprint-status.yaml`
- `a0-starter-template-ci-baseline` 키 추가
- A0 선행 규칙 주석 추가

### 이번 라운드에서 미루는 것 (OUT)

- PRD/Architecture/UX 본문 구조 재편집
- 공통 Execution Baseline Table 3문서 동시 삽입
- Legacy 문구 대규모 정리

## 3) 기대 이득

- 당일 적용 가능(문서 2개 중심)
- 구현 착수 조건(A0) 즉시 명확화
- 추적 혼선(FR27, 스프린트 키) 즉시 감소
- 불필요한 문서 churn 최소화

## 4) 남는 위험

- PRD/Architecture/UX의 해석 편차 가능성은 일부 잔존
- 다만 실행 기준 파일(`epics.md`, `sprint-status.yaml`)이 잠금 역할을 하므로 운영 가능

## 5) 단계적 후속(선택)

- 스프린트 1 종료 시점에만 문서 전반 정합화 라운드 2 수행
- 조건:
  - A0 완료
  - A1 착수
  - 구현팀에서 기준 혼선 이슈 재발 시

## 6) 변경 제안 (Before -> After)

### A. epics.md

OLD:
- A1부터 시작
- FR27은 세부 스토리 수준에서 주로 확인

NEW:
- A0 선행 추가
- Epic A/C 헤더에 FR27 병기
- AC 최소 정량화 문장 추가

### B. sprint-status.yaml

OLD:
- A~C 및 A1~C3만 상태 추적

NEW:
- `a0-starter-template-ci-baseline: backlog` 추가
- A0 완료 전 A1 착수 금지 주석 추가

## 7) 핸드오프

- PO/SM: A0 생성/우선순위 잠금
- Dev: A0 완료 후 A1 착수
- QA: A0 게이트를 테스트 진입조건으로 등록

## 8) 승인 요청

- 본 Revised 안으로 즉시 반영 범위를 `epics.md`, `sprint-status.yaml`으로 제한해 진행한다.
- PRD/Architecture/UX는 이번 라운드에서 변경하지 않는다.

작성일: 2026-04-07
분류: Moderate (Low-churn execution lock)
