# PreProduct Experiment Implementation Tickets

## Epic A: Instrumentation Foundation

### TKT-A1 이벤트 공통 스키마 적용
- 목적: 모든 이벤트에 공통 필드 표준 적용
- 범위: `event_time`, `user_id`, `session_id`, `category_id`, `app_version`, `channel`
- 완료 기준:
- 신규/기존 핵심 이벤트에 공통 필드 누락 없음
- 이벤트 샘플 로그 100건 수동 검증 완료

### TKT-A2 핵심 이벤트 11종 트래킹 구현
- 목적: 브리프 KPI 계산 가능 상태 확보
- 범위:
- `view_landing`
- `start_intent_input`
- `complete_intent_input`
- `view_decision_card`
- `select_action`
- `hold_reason_submit`
- `revisit_decision`
- `convert_after_hold`
- `decision_satisfaction_submit`
- `decision_card_error`
- `report_low_quality_input`
- 완료 기준:
- 이벤트 명/속성명 문서와 100% 일치
- QA 환경에서 각 이벤트 최소 1회 이상 발생 확인

### TKT-A3 이벤트 중복 방지(dedupe key) 적용
- 목적: KPI 왜곡 방지
- 완료 기준:
- 중복 발송률 1% 미만
- dedupe key 충돌/누락 케이스 테스트 통과

## Epic B: KPI Pipeline & Dashboard

### TKT-B1 KPI 계산 쿼리 작성
- 목적: 핵심 지표 7개 주간 계산 자동화
- 범위:
- 의향 등록률
- 판단 활용률
- 보류 후 재전환율(14일)
- 의사결정 만족도
- 탐색 시간 절감률
- 신고율
- 카드 생성 실패율
- 완료 기준:
- 샘플 데이터 기준 수기 계산과 오차 0
- 주간 스냅샷 생성 자동화

### TKT-B2 Executive/Funnel/Guardrail/Cohort 대시보드 구성
- 목적: 의사결정 패널 운영
- 완료 기준:
- 4개 패널 모두 주간 자동 갱신
- 8주/12주 목표선 시각화 반영

### TKT-B3 표본충족 경고 로직 구현
- 목적: 잘못된 결론 방지
- 범위: 카테고리별 주간 `n < 100` 시 경고 배지
- 완료 기준:
- 미충족 구간 자동 표시
- 리포트 요약에 경고 사유 자동 포함

## Epic C: Weekly Operating Cadence

### TKT-C1 주간 판정 리포트 템플릿 자동 생성
- 목적: `Go/Hold/Stop` 일관 판정
- 범위:
- 핵심 지표 달성 수
- 가드레일 충족 여부
- 판정 결과
- 다음 주 실험 우선순위
- 완료 기준:
- 매주 월요일 자동 생성
- PM 리뷰 입력란 포함

### TKT-C2 판정 규칙 엔진 구현
- 목적: 수동 해석 편차 제거
- 규칙:
- Go: 핵심지표 5개 중 4개 이상 달성 + 가드레일 2개 충족
- Hold: 핵심지표 2~3개 달성 또는 가드레일 1개 미충족
- Stop: 핵심지표 1개 이하 달성 2주 연속 또는 가드레일 심각 이탈 2주 연속
- 완료 기준:
- 지난 데이터 리플레이 시 규칙 결과 재현 가능

## Epic D: Experiment Backlog Execution

### TKT-D1 판단 카드 문구 A/B 테스트
- 가설: 설명형 문구 강화 시 판단 활용률 +5%p
- 실험군:
- A: 기존 문구
- B: 이유 3줄 + 행동 제안 문구
- 완료 기준:
- 통계 유의성 충족 또는 최소 효과 크기 달성

### TKT-D2 보류 대안 추천 실험
- 가설: 보류 사유 맞춤 대안 제공 시 재전환율 +4%p
- 완료 기준:
- 14일 cohort 기준 상승 확인

### TKT-D3 입력 마찰 감소 실험
- 가설: 입력 단계 축소/자동완성으로 등록률 +6%p
- 완료 기준:
- 완료율 개선 + 입력 시간 감소 동시 달성

## Epic E: Data Quality & Governance

### TKT-E1 이벤트 QA 체크리스트 운영
- 목적: 릴리즈마다 측정 무결성 보장
- 완료 기준:
- 릴리즈 체크리스트 100% 수행 기록
- 실패 항목 재배포 전 차단

### TKT-E2 타임존 표준화
- 목적: 시간 축 분석 오류 방지
- 범위: 저장 UTC, 대시보드 로컬 변환
- 완료 기준:
- 일/주 경계값 오류 0건

### TKT-E3 저품질 입력 신고 프로세스 정의
- 목적: 신고율 가드레일 운영 가능화
- 완료 기준:
- 신고 접수-분류-조치 SLA 문서화
- 운영자 콘솔 최소 기능 확보

## Suggested Sprint Cut (2 Weeks)

- Sprint 1:
- A1, A2, A3, B1
- Sprint 2:
- B2, B3, C1, C2
- 병행 실험:
- D1 기획 시작, D2/D3 실험 설계

## Dependencies

- A2 선행 후 B1 가능
- B1 선행 후 B2/C2 신뢰도 확보
- C2 선행 후 주간 운영 자동화(C1) 완성
- D계열은 A/B 계열 최소 구현 이후 착수
