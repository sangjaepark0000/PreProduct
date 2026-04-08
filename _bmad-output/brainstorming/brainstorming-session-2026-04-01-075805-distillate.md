---
type: bmad-distillate
sources:
  - "brainstorming-session-2026-04-01-075805.md"
downstream_consumer: "execution-ready product planning"
created: "2026-04-01"
token_estimate: 1017
parts: 1
---

## Session State
- Source: brainstorming-session-2026-04-01-075805.md; workflow final state=stepsCompleted[1,2,3,4], selected_approach=ai-recommended, session_continued=true(2026-04-01), session_active=false, workflow_completed=true
- Topic: 팔 마음 생기기 전 판매 의향을 열어두는 선매도 의향 기반 중고거래 플랫폼; goals=가치제안 정교화, 핵심기능 발산, MVP 범위/차별 포인트 도출
- Source heading map preserved: Session Overview; Technique Selection; Technique Execution Results (In Progress); SCAMPER Progress (Current); Idea Organization and Prioritization; Session Summary and Insights

## Technique Outcomes
- Sequence fixed: Question Storming -> Assumption Reversal -> SCAMPER
- Question Storming conclusions: 정보비대칭/허위의향/유료 의향 역인센티브/카테고리 규제 차이 탐지; 성패축=의향시장 설계 + 신뢰 인프라
- Assumption Reversal conclusions: 결심 전 등록; 의향의 자산화; 이벤트 기반 가격 관점; 자산 +/-(플러스/마이너스) 대시보드 관점
- SCAMPER baseline input vars: 카테고리, 구매가/구매시점, 상태등급, 최근 거래량, 가격추세, 거래마찰비용
- SCAMPER baseline metrics: 순회수액(Net Resale Value), 일 사용비용; action messages=지금 팔면 +X원/Y일 보유 시 -Z원/손익분기 매도가
- Core decisions fixed: 코어 루프=의향 등록->자동매칭; modify=의향카드 표준화+3단계 매칭+신뢰장치 단계화; eliminate(MVP 제외)=멀티 카테고리/자동체결/대여 동시운영/리테일러 연동/고급 예측모델

## Idea Inventory
- #21 결심 레디니스 그래프; #22 의향 미러 마켓; #23 허위의향 방어 레이어; #24 이벤트 감응 가격 엔진; #25 타이밍 코치; #26 구매 대안 시뮬레이터
- #27 자산 플러스/마이너스 대시보드; #28 거래 전제/상쇄 조건 카드; #29 듀얼 탐색 모드; #30 저복잡도 탐색 업데이트; #31 리스크 프로필 기반 추천강도 조절
- #32 구매조건 우선 공개+판매자 유료 열람; #33 거래 보류도 성공 KPI; #34 물건 등록 전 목적 등록; #35 보류 사유 기반 대안 제안; #36 의향 변화 로그(Why-Shift) 데이터 자산화

## Product Model and Boundaries
- Framing pivot: 중고거래 앱 -> 개인 자산 의사결정 엔진
- Recommendation principle: 가격은 적합도 함수의 일부; 목적/제약/리스크/유동성/가격 통합 적합도
- Value stacks: 사용자(판단 품질), 시장(의향 기반 유동성 신호), 제조/유통(피드백 인사이트)
- MVP in-scope: 단일 카테고리; 의향 등록; 조건 기반 자동 제안; 승인/거절; 최소 신뢰 장치; 기본 시세구간/추세

## Prioritization and Execution
- Priority order fixed: 5(개인 자산 리밸런싱) -> 1(구매 전 검증) -> 0(의향등록->자동매칭) -> 2(구독 대체 판단) -> 6(전문가 서비스 연결) -> 3(커뮤니티 공동구매 신호) -> 4(지역 유동성 지도)
- Quick wins: 의향카드 표준화; 보류 사유 수집; 적합도 점수 + 이유 3줄
- Breakthroughs: 구매조건 우선 공개 리드마켓; Why-Shift 데이터 자산화
- This-week actions: 의향 카드 v3 스키마 확정; 화면 3개 와이어(의향등록/제안피드/보류-대안); 2주 검증 실험
- Core metrics: 의향등록율, 제안승인율, 보류후 재전환율

## Risk, Trust, Monetization
- Risk domains: 정보비대칭, 허위의향/스팸, 규제/카테고리 차이, 거래 신뢰
- Trust controls: 평판/신고 기본; 이상행동 제어; 필요 시 예치금 강화
- Monetization signals: 판매자 유료 열람(구매조건 리드); 제조/유통사 익명 집계 인사이트 판매; 성과형 과금 확장 가능
- Privacy constraint: 개인 식별정보 비노출; 조건 데이터 블라인드/집계 처리
