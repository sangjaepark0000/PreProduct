# PreProduct Local Execution Board

## Usage Rules

- 이 파일 하나로 작업 상태를 관리한다.
- 상태 이동은 체크박스와 섹션 이동으로 처리한다.
- 작업 시작 시 `In Progress`로 이동, 완료 시 `Done`으로 이동한다.

## Sprint 1 (2주)

### Todo

- [ ] S1.4-1 CI workflow baseline 구성 (lint/typecheck/unit)
- [ ] S1.4-2 Contract check workflow 구성 (OpenAPI/이벤트 계약 검증)
- [ ] S1.4-3 Performance budget gate 구성 (핵심 여정 budget + 실패 시 차단)
- [ ] S1.4-4 브랜치 보호 규칙/필수 체크 반영 (gate 미통과 merge 차단)
- [ ] S1.4-5 Story 2.1/4.1/4.2/6.2/7.2 예외 시나리오 테스트 템플릿 확정
- [ ] TKT-A1 이벤트 공통 스키마 적용
- [ ] TKT-A2 핵심 이벤트 11종 트래킹 구현
- [ ] TKT-A3 이벤트 중복 방지(dedupe key) 적용
- [ ] TKT-B1 KPI 계산 쿼리 작성

### In Progress

- [ ] (작업 시작 시 여기에 이동)

### Done

- [ ] (완료 항목 기록)

## Sprint 2 (2주)

### Backlog

- [ ] TKT-B2 Executive/Funnel/Guardrail/Cohort 대시보드 구성
- [ ] TKT-B3 표본충족 경고 로직 구현
- [ ] TKT-C1 주간 판정 리포트 템플릿 자동 생성
- [ ] TKT-C2 판정 규칙 엔진 구현
- [ ] TKT-D1 판단 카드 문구 A/B 테스트
- [ ] TKT-D2 보류 대안 추천 실험
- [ ] TKT-D3 입력 마찰 감소 실험
- [ ] TKT-E1 이벤트 QA 체크리스트 운영
- [ ] TKT-E2 타임존 표준화
- [ ] TKT-E3 저품질 입력 신고 프로세스 정의

## Daily Log

### 2026-04-04

- 브리프 작성/수정 완료
- 실험 설계 문서 완료
- 티켓 분해 완료
- 로컬 운영 보드 전환 완료

### 2026-04-06

- Correct Course 승인 반영 완료 (`c`)
- Story 1.4(CI/CD + 계약검증 + 성능예산 baseline) Sprint 1 Todo 편입
- Story 2.1/4.1/4.2/6.2/7.2 예외/오류 AC 기준 테스트 템플릿 작성 시작
