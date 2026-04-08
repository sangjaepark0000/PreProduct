# Sprint Change Proposal - 2026-04-07

## 1) 이슈 요약

- 트리거: 사용자 피드백 - "현재 복잡도가 높다. 단순 중고거래 플랫폼 + AI 보조 기능으로 축소 가능한가?"
- 문제 유형: Strategic pivot / MVP 복잡도 리스크 관리
- 현재 상태 근거:
  - PRD 복잡도 분류: `high`
  - Epic 수: 7개 (운영/실험/파트너 API 포함)
  - MVP에 고급 운영/실험/연동 요구가 동시 포함되어 초기 구현 리스크가 큼
- 핵심 판단:
  - 방향(판단 지원)은 유효
  - 초기 스코프(기능 폭)는 과도

## 2) 영향 분석

### Epic 영향

- Epic 1~3(사용자 핵심 가치): 유지 가능
- Epic 4(시그널/알림): 축소 필요
- Epic 5(운영/지원), Epic 6(실험/드리프트), Epic 7(파트너 API): MVP에서 제외 또는 후순위 전환 권장

### 아티팩트 영향

- PRD: MVP 정의를 "판단 중심 플랫폼 전체"에서 "단순 중고거래 + AI 보조"로 축소 필요
- Epics: 7개 체계를 3개 내외 핵심 에픽으로 재구성 필요
- Architecture: 운영/파트너/복합 실험 경계는 유지하되 P1.5+로 이동
- UX: 진입 플로우 단순화(등록 -> AI 분석 -> 자동 가격조정 옵션)

### 기술 영향

- 단기: 개발 복잡도와 일정 리스크 크게 감소
- 중기: 고급 기능 재도입 시 확장 설계 필요 (현재 아키텍처 활용 가능)

## 3) 경로 평가

### Option 1 - Direct Adjustment (원안 유지 + 부분 조정)

- 판단: Viable
- 노력: Medium
- 리스크: Medium~High
- 메모: 방향성 유지는 쉽지만 MVP 과적재 위험이 남음

### Option 2 - Potential Rollback

- 판단: Not viable
- 노력: High
- 리스크: Medium
- 메모: 현재는 코드 롤백보다 기획 스코프 조정이 핵심

### Option 3 - PRD MVP Review (스코프 축소)

- 판단: Viable
- 노력: Medium
- 리스크: Low~Medium
- 메모: 사용자 제안과 일치, 구현 속도/검증력 개선

### 권고 경로

- 선택: Hybrid (Option 3 중심 + Option 1의 핵심 가치 보존)
- 권고안:
  1. 제품 정체성(판단 보조)은 유지
  2. MVP는 "단순 중고거래 + AI 3기능"으로 축소
  3. 운영/실험/파트너 연동은 P1.5+로 이관

## 4) 상세 변경 제안 (old -> new)

### A. PRD 변경

문서: `_bmad-output/planning-artifacts/prd.md`

- OLD (MVP)
  - 선의향 공개 + 설명 가능한 판단 카드 + 보류 재평가 + 11종 계측 + 주간 판정 등 다중 축 동시 구현

- NEW (MVP 재정의)
  - 단순 중고거래 기본 플로우(상품 등록/조회/수정)
  - AI 기능 1: 사진 업로드 -> LLM 기반 상품 정보 자동 추출(제목/카테고리/주요 스펙)
  - AI 기능 2: 가격 제안(초기 추천가)
  - AI 기능 3: 미판매 기간 경과 시 가격 자동 조정 규칙(예: N일마다 x% 인하)
  - 필수 계측은 최소 이벤트로 축소(등록, AI제안 확인, 가격조정 반영)

Rationale: 핵심 사용자 가설(판단 보조)을 유지하면서 구현 난이도/범위를 낮춤.

### B. Epics 변경

문서: `_bmad-output/planning-artifacts/epics.md`

- OLD
  - Epic 1~7 (의향/판단/보류/알림/운영/실험/파트너)

- NEW (MVP 기준)
  - Epic A: 상품 등록/관리 기본 기능
  - Epic B: AI 상품 판독(사진 -> 상품 정보 자동 입력)
  - Epic C: AI 가격 제안 + 시간 기반 자동 가격조정
- P1.5+
  - 기존 Epic 4~7 성격 기능(고급 신호/운영/실험/파트너) 단계적 재도입

Rationale: 사용자가 즉시 체감하는 핵심 가치에 집중.

### C. Architecture 변경

문서: `_bmad-output/planning-artifacts/architecture.md`

- OLD
  - 초기부터 광범위 운영/실험/파트너 경계 활성화

- NEW
  - MVP 런타임 경계 최소화:
    - Listing Service
    - Image Analysis Adapter (LLM API)
    - Pricing Engine (rule-based + AI 추천)
  - Ops/Partner/Experiment 고급 경계는 설계만 유지하고 구현은 비활성(P1.5+)

Rationale: 현재 아키텍처 자산을 버리지 않고 실행 범위만 줄임.

### D. UX 변경

문서: `_bmad-output/planning-artifacts/ux-design-specification.md`

- OLD
  - 목적 진단/적합도 함수/보류-재평가 등 고밀도 결정 플로우

- NEW
  - 등록 중심 단순 플로우:
    1) 사진 촬영/업로드
    2) AI 자동 판독 결과 확인/수정
    3) AI 추천가 확인
    4) 자동 가격조정 옵션 on/off 및 규칙 선택

Rationale: 초기 학습비용을 줄여 활성 사용자 확보에 유리.

## 5) MVP 영향 및 실행 계획

- MVP 영향: 있음 (범위 축소)
- 목표 변경: "복합 판단 플랫폼 검증" -> "중고거래 등록 전환 + AI 보조 효용 검증"
- 1차 실행 항목:
  1. PRD MVP 섹션 축소안 반영
  2. Epics 재구성(3개)
  3. Story 재작성(핵심 사용자 플로우 기준)
  4. 가격조정 규칙 기본값 정의 (N일, 인하율, 하한가)

## 6) 핸드오프 계획

- 범위 분류: Moderate
- Product Owner / Scrum Master
  - 스프린트 백로그를 Epic A/B/C 중심으로 재정렬
- Architect
  - LLM 어댑터/가격조정 엔진 최소 아키텍처 확정
- Development Team
  - 등록 플로우 + AI 판독 + 가격조정 구현
- QA
  - AI 판독 정확도 임계치/수동수정 플로우/가격조정 스케줄 검증

## 7) 체크리스트 진행 현황

### Section 1 - Trigger/Context
- [x] 1.1 트리거 식별 완료 (복잡도 우려 + 단순화 제안)
- [x] 1.2 문제 정의 완료 (MVP 과적재)
- [x] 1.3 근거 확보 완료 (PRD complexity high, epic breadth)

### Section 2 - Epic Impact
- [x] 2.1 현재 에픽 영향 평가 완료
- [x] 2.2 에픽 레벨 변경안 도출 완료
- [x] 2.3 후속 에픽 영향 점검 완료
- [x] 2.4 신규/이관 필요성 확인 완료
- [x] 2.5 우선순위 재조정 필요 확인 완료

### Section 3 - Artifact Impact
- [x] 3.1 PRD 영향 분석 완료
- [x] 3.2 Architecture 영향 분석 완료
- [x] 3.3 UX 영향 분석 완료
- [x] 3.4 부수 아티팩트 영향 분석 완료

### Section 4 - Path Forward
- [x] 4.1 Option 1 평가 완료
- [x] 4.2 Option 2 평가 완료
- [x] 4.3 Option 3 평가 완료
- [x] 4.4 권고 경로 선정 완료 (Hybrid)

### Section 5 - Proposal Components
- [x] 5.1 이슈 요약 완료
- [x] 5.2 영향 요약 완료
- [x] 5.3 권고 경로/근거 완료
- [x] 5.4 MVP 영향/액션플랜 완료
- [x] 5.5 핸드오프 계획 완료

### Section 6 - Final Review/Handoff
- [x] 6.1 체크리스트 완결성 점검 완료
- [x] 6.2 제안서 정확성 점검 완료
- [x] 6.3 사용자 승인 완료 (`2026-04-07`, 응답: `일단 승인 할게`)
- [N/A] 6.4 `sprint-status.yaml` 파일 미존재 (추후 승인 시 `workflow-status.yaml` 또는 실제 sprint 상태 파일 기준 반영)
- [x] 6.5 최종 next steps 확정 (문서 축소 반영 + 검증 게이트 수행)

## 8) 결론

- 원안은 "문제"가 있는 것은 아니지만, 현재 팀 속도/초기 검증 목적 기준으로는 과복잡 위험이 높다.
- 권장: 원안 철학은 유지하고 MVP는 단순 중고거래 + AI 3기능으로 축소 진행.

---

## 9) 승인 후 검증 게이트 (필수)

### 기획 검증 (D+1 ~ D+2)
- 사용자 5~8명 기준 태스크 테스트: 사진 업로드 -> 자동입력 확인 -> 등록 완료
- 합격 기준:
  - 등록 완료율 `>= 70%`
  - AI 제안 수용률 `>= 50%`
  - 이해도(5점 척도) 평균 `>= 4.0`

### 기술 검증 (D+2 ~ D+4)
- LLM 판독 정확도 샘플 테스트(카테고리별)
- 자동 가격조정 규칙 시뮬레이션(N일/인하율/하한가)
- 실패 대응 검증(판독 실패 시 수동입력 fallback, 조정 실패 시 원가 유지)
- 합격 기준:
  - 필수 필드 판독 정확도 `>= 85%`
  - 가격조정 작업 실패율 `< 1%`
  - fallback 경로 E2E 통과율 `100%`
