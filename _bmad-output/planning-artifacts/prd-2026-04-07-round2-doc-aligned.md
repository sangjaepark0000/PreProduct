---
stepsCompleted:
  - "step-01-init"
  - "step-02-discovery"
  - "step-02b-vision"
  - "step-02c-executive-summary"
  - "step-03-success"
  - "step-04-journeys"
  - "step-05-domain"
  - "step-06-innovation"
  - "step-07-project-type"
  - "step-08-scoping"
  - "step-09-functional"
  - "step-10-nonfunctional"
  - "step-11-polish"
  - "step-12-complete"
classification:
  projectType: "web_app"
  domain: "general"
  complexity: "high"
  projectContext: "greenfield"
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-preproduct-2026-04-04.md"
  - "_bmad-output/planning-artifacts/product-brief-preproduct-experiment-plan-2026-04-04.md"
  - "_bmad-output/planning-artifacts/product-brief-preproduct-experiment-tickets-2026-04-04.md"
  - "_bmad-output/brainstorming/index.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate-distillate.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate-validation-report.md"
  - "_bmad-output/planning-artifacts/local-execution-board.md"
documentCounts:
  briefCount: 3
  researchCount: 0
  brainstormingCount: 5
  projectDocsCount: 0
  otherCount: 1
workflowType: "prd"
date: "2026-04-05"
lastEdited: "2026-04-07"
editHistory:
  - date: "2026-04-05"
    changes: "minimum edits: frontmatter date added, FR phase tags added, NFR measurability clauses added"
  - date: "2026-04-07"
    changes: "correct course 반영: MVP 축소(단순 중고거래 + AI 3기능), 고복잡도 영역 P1.5+ 이관"
---

# Product Requirements Document - PreProduct

**Author:** 상재
**Date:** 2026-04-04

## Scope Priority Notice (2026-04-07)

- 구현/검증/릴리즈 기준은 `Correct Course Baseline (2026-04-07 revised-minimal)`을 우선 적용한다.
- 본문의 legacy/확장 내용과 충돌할 경우 Correct Course Baseline이 authoritative source다.
- 2026-04-07 승인된 `Analysis Restart Baseline` 이후, 본 문서의 구현 확정 문구는 재검증 전까지 reference로 간주한다.
- Round 2 labeling (4/7 revised-minimal baseline):
  - Active MVP: authoritative current sprint implementation scope
  - Deferred P1.5+: design kept, implementation postponed
  - Legacy Reference: reference-only context; no implementation priority

## Executive Summary

PreProduct는 거래 체결 중심 중고거래 앱이 아니라, 구매·판매·보류 의사결정을 먼저 돕는 거래 전 판단 플랫폼이다. 초기 타깃은 거래 의향은 있지만 확신이 낮아 탐색 비용이 큰 사용자이며, 제품 목표는 "어디서 무엇을 사거나 팔든 먼저 여기서 알아본다"는 시작점 습관을 만드는 것이다.
기존 대안이 최저가 노출 중심이라 실제 의사결정에 필요한 맥락을 충분히 제공하지 못하는 반면, PreProduct는 사용자 의도·상태·시점 기반으로 행동 대안을 제시해 잘못된 거래, 타이밍 손실, 불필요한 탐색 시간을 줄인다. 초기 1차 성과는 거래량 확대보다 판단 품질 개선으로 정의한다.

한 줄 포지셔닝: "거래 전에, 먼저 판단부터 하는 플랫폼."

### What Makes This Special

PreProduct의 핵심 메커니즘은 선의향 공개 -> 시장 신호 형성 -> 행동 선택 지원의 3단 구조다.
1) 판매 결심 이후 등록이 아니라 결심 이전 의향 공개로 잠재 공급을 먼저 연결하고,
2) 이 의향 데이터를 유동성 신호로 전환해 거래 가능성을 가시화하며,
3) "지금 팔기/보류/대안 행동"을 비교 가능한 형태로 제시해 판단 신뢰도와 의사결정 만족도를 높인다.
핵심 인사이트는 초기 유동성이 체결 단계가 아니라 의향 노출 단계에서 먼저 만들어진다는 점이다.

## Project Classification

- Project Type: `web_app`
- Domain: `general`
- Complexity: `high`
- Project Context: `greenfield`

## Success Criteria

### User Success

- 사용자가 구매/판매/보류 결정을 더 빠르고 확신 있게 내린다.
- 핵심 아하 모먼트: "지금 행동(판매/보류/대안)이 왜 유리한지"를 즉시 이해하는 순간.
- 완료 시나리오: 판단 카드 확인 후 실제 액션 선택(구매/판매/보류/등록) 또는 보류 사유 등록 후 재평가 루프로 진입.

### Business Success

- 8주 내 판단 시작점 습관 형성 신호를 확보하고, 12주 내 재평가 루프를 안정화한다.
- 1차 성과는 거래량보다 판단 품질 개선 지표 달성으로 판정한다.
- 핵심지표 5개:
  - 의향 등록률
  - 판단 활용률
  - 보류 후 재전환율(14일)
  - 의사결정 만족도
  - 탐색 시간 절감률
- 주간 판정 규칙:
  - Go: 핵심지표 5개 중 4개 이상 달성 + 가드레일 2개 충족
  - Hold: 핵심지표 2~3개 달성 또는 가드레일 1개 미충족
  - Stop & Reframe: 핵심지표 1개 이하 달성 2주 연속 또는 가드레일 심각 이탈 2주 연속
- 심각 이탈 정의:
  - 가드레일 목표 대비 20% 이상 악화, 또는
  - 동일 가드레일 2주 연속 미충족

### Technical Success

- 판단 카드 생성/노출/액션 이벤트 계측 무결성 확보
- KPI 대시보드(Executive/Funnel/Guardrail/Cohort) 주간 자동 갱신
- 가드레일 이탈 조기 감지(표본 부족, 오류율, 신고율) 경보 동작
- 이벤트 중복 방지(dedupe key) 적용 및 중복률 기준 충족

### Measurable Outcomes

- 의향 등록률: 8주 `>= 25%`, 12주 `>= 35%`
- 판단 활용률: 8주 `>= 55%`, 12주 `>= 65%`
- 보류 후 재전환율(14일): 8주 `>= 18%`, 12주 `>= 25%`
- 의사결정 만족도: 8주 `>= 4.0/5`, 12주 `>= 4.2/5`
- 탐색 시간 절감: 8주 `>= 20%`, 12주 `>= 30%`
- 가드레일: 신고율 `<= 3%`, 카드 생성 실패율 `<= 1%`, 카테고리별 주간 표본 `n >= 100`
- 계측 품질: 이벤트 중복률 `< 1%`

## Product Scope

### MVP - Minimum Viable Product

- 단순 중고거래 기본 플로우(상품 등록/조회/수정)
- 판매 확정 전 사전 등록(프리리스팅/선의향 공개) 지원
- AI 사진 판독 기반 상품 정보 자동입력(제목/카테고리/핵심 스펙 제안)
- AI 초기 추천가 제안(사용자 수정 가능)
- 시간 경과 기반 자동 가격조정(규칙형: N일/인하율/하한가)
- 최소 이벤트 계측(등록 완료, AI 제안 수용, 자동 가격조정 반영)
- 필수 산출물:
  - 이미지 판독 결과 스키마(v1)
  - 가격조정 규칙 문서(v1)
  - 축소 MVP KPI 대시보드(v1)

### Growth Features (Post-MVP)

- 선의향/보류-재평가 고도 플로우
- 고급 실험(실험군/대조군 자동 운영, 드리프트 대응)
- 운영 콘솔 고도화(가드레일/주간 판정 자동화)
- 파트너 API 연동(권한/쿼터/감사)

### Vision (Future)

- 거래 전 판단 시작점을 카테고리 전반으로 확장
- 의향 변화 로그(Why-Shift) 기반 개인화 고도화
- 잠재 공급/수요 신호 기반 데이터/리드형 수익모델 확장

## User Journeys

### Journey 1 - Primary User Success Path (목적 미정 사용자)

**Opening Scene**
현우는 "사야 하나, 말아야 하나, 팔아야 하나"만 있고 목적이 명확하지 않다. 무엇을 최적화해야 하는지도 모른다.

**Rising Action**
현우는 PreProduct에서 현재 상태(보유/관심 자산, 예산, 제약, 신분 혜택 가능성)를 최소 입력으로 등록한다.
시스템은 정답을 단정하지 않고 탐색 공간을 줄이는 질문과 선택지를 제시한다.
입력이 쌓일수록 의향 성숙도와 목표 신뢰도가 상승하고, 추천 옵션이 수렴한다.

**Climax**
현우는 "지금 내 조건에선 이 행동이 가장 낫다"는 판단 근거를 이해하고 행동을 결정한다.

**Resolution**
목적은 처음부터 고정되지 않아도 괜찮다는 신뢰를 얻고, 이후에도 먼저 와서 판단하는 습관이 형성된다.

**Failure/Recovery**
목표가 자주 바뀌거나 입력이 모순될 경우, 시스템은 충돌 원인을 보여주고 우선순위 재정렬을 유도한다.

### Journey 2 - Primary User Edge Path (판매 고민 사용자, 선의향 공개)

**Opening Scene**
사용자는 세 가지 주요 맥락에서 진입한다.
- 타이밍 최적화형: 신모델 출시 전, 시세 하락 전 매도 타이밍을 찾는다.
- 목적 완료형: 프로젝트 종료/갈아타기 전제로 처분을 준비한다.
- 유동성 대비형: 현금 유동성 부족 가능성에 대비해 자산을 미리 공개한다.

**Rising Action**
사용자는 자산 상태(소유/사용중/처분준비), 예상 사용기간, 목표 회수금액, 타이밍 제약, 현금흐름 필요도를 입력한다.
시스템은 선의향을 시장 신호로 반영하고, 시세 추이/타이밍 리스크/대안 행동(유지/즉시매도/조건부매도)을 동적으로 재정렬한다.

**Climax**
사용자는 "지금 팔지/더 쓰고 팔지/일단 공개 유지할지"를 근거 기반으로 선택한다.

**Resolution**
즉시 체결이 아니어도 선의향 상태를 유지하며 신뢰 데이터를 축적하고, 조건 충족 시 자연스럽게 행동 전환한다.

**Failure/Recovery**
의향 업데이트가 오래 멈추거나 정보 신뢰도가 낮아지면 시스템이 갱신 요청, 신뢰도 경고, 노출 정책 조정으로 복구를 유도한다.

### Journey 3 - Admin/Ops + Support (겸임)

**Opening Scene**
운영 담당자 수진은 지표 건강성과 사용자 문의를 동시에 관리해야 한다.

**Rising Action**
수진은 KPI/가드레일/표본충족을 모니터링하고, 문의 건에 대해 판단 근거 로그를 조회한다.
이슈 유형별로 UX/정책/계측 보강 액션을 배정한다.

**Climax**
Go/Hold/Stop 규칙으로 주간 판정을 내리고 다음 실험 우선순위를 확정한다.

**Resolution**
운영/지원이 분리되지 않아도 일관된 기준으로 품질과 학습 루프를 유지한다.

**Failure/Recovery**
계측 결함 시 데이터 신뢰도 경고를 표시하고 QA 체크리스트로 복구한다.

### Journey 4 - API/Integration (외부 파트너 포함)

**Opening Scene**
외부 파트너는 의향 기반 신호를 연동해 제안 타게팅과 전환 품질을 높이고자 한다.

**Rising Action**
파트너는 인증/정책 동의 후 계약 범위 API를 연동하고, 익명/집계 신호를 수신한다.
쿼터/스키마/오류 규약을 준수하며 샌드박스 검증 후 운영 적용한다.

**Climax**
파트너는 단순 트래픽이 아닌 "의향 성숙도 기반 신호"로 효율 개선을 확인한다.

**Resolution**
연동은 반복 가능한 수익 축(리드/홍보/타게팅)으로 안정화된다.

**Failure/Recovery**
쿼터 초과, 스키마 불일치, 정책 위반 시 자동 가이드와 제한 정책이 적용된다.

### Journey 5 - Goal Formation Path

**Opening Scene**
사용자는 "이런 문제가 있어서 뭔가 필요함" 정도만 있고, 명확한 구매/판매 목적은 없다.

**Rising Action**
사용자는 문제 단서, 희망 현금흐름, 할인 자격(예: 학생), 자산 상태를 단계적으로 입력한다.
시스템은 입력 누적에 따라 목적 후보를 제안하고, 불필요한 탐색 경로를 줄인다.

**Climax**
사용자는 목적 자체를 업데이트하며 "지금은 이 옵션이 최적"이라는 실행 가능한 결론에 도달한다.

**Resolution**
제품은 단발 거래 도구가 아니라 지속적 자산 의사결정 도구로 자리 잡는다.

**Failure/Recovery**
목적 형성에 필요한 데이터가 부족하면, 시스템은 추가 입력 요청과 보수적 기본 시나리오를 제공한다.

### Journey Requirements Summary

- 목적 가변형 탐색 플로우(초기 목표 미정 상태 지원)
- 의향 빌드업 모델(입력 누적 기반 탐색 공간 축소)
- 상태값 관리: `intent_maturity`, `goal_confidence`
- 분류 필드 관리: `disposal_intent_type`, `time_pressure`, `liquidity_need`, `trust_freshness`
- 선의향 공개/관리(잠재 공급 신호화)
- 설명 가능한 판단 카드(행동 대안 + 이유 문구)
- 보류-재평가 루프 및 전환 추적
- 운영/지원 겸임 콘솔(모니터링 + 문의 근거 조회)
- 외부 파트너 API(인증, 쿼터, 오류 규약, 익명/집계 정책)
- 타이밍 전략 지원(신모델 출시/시세 이벤트 기반 매도 타이밍 알림)
- 처분 목적 태깅(프로젝트 종료/갈아타기/현금유동성 확보)
- 자산 상태 모델(소유/판매/보유/임대) 및 상태 전이 추적
- 학습 데이터 축적 체계(탐색 로그/의향 변화/결정 결과)

## Domain-Specific Requirements

### Compliance & Regulatory

- 초기 MVP는 특정 산업 규제(HIPAA/PCI 등) 직접 대상은 아님
- 개인정보/행동로그/의향데이터 처리에 대한 동의, 보관, 삭제 정책 필요
- 외부 파트너 연동 시 데이터 공유 범위(익명/집계/개별)와 계약 조건 명시 필요
- 데이터 사용 목적 투명성: 어떤 데이터가 어떤 판단/추천에 사용됐는지 사용자에게 설명 가능해야 함
- 데이터 주체 요청 처리 SLA: 열람/정정/삭제 요청 접수-처리-통지의 운영 기준(처리기한 포함) 정의

### Technical Constraints

- 설명 가능한 판단 결과 제공(이유 문구, 근거 데이터 출처 요약)
- 의향/목표 상태값(`intent_maturity`, `goal_confidence`) 일관성 관리
- 신뢰도 저하 대응(오래된 정보, 업데이트 중단, 허위 의향 의심) 정책 필요
- 계측 무결성(중복률, 누락률, 타임스탬프 일관성)과 감사 가능한 운영 로그 필요
- 의사결정 재현성/변경 추적성: 동일 입력의 결과 일관성 보장 또는 결과 변경 사유 기록

### Integration Requirements

- 외부 파트너 API: 인증키, 쿼터, 버전, 오류코드, 정책 위반 처리
- 익명/집계 신호 중심 연동과 데이터 최소 제공 원칙
- 내부 운영 도구 연계: KPI 대시보드, 문의/이슈 추적, 판정 리포트 자동화
- 파트너 온보딩 게이트: 계약 -> 보안 검토 -> 스키마 검증 -> 샌드박스 검증 -> 운영 승인

### Risk Mitigations

- 리스크: 저품질 의향 유입, 타이밍 추천 오해, 파트너 데이터 오남용, 모델/룰 변경에 따른 품질 저하
- 완화:
  - 의향 검증 단계 + 노출 정책
  - 추천 결과에 확신도/주의문구/재평가 경로 제공
  - 파트너별 접근권한, 필드 제한, 감사로그, 키 회수 절차
  - 모델/룰 변경 시 회귀 검증 체계 운영
  - 판단 품질 드리프트 모니터링 + 3단계 대응:
    - 관찰(경미 이탈): 모니터링 강화
    - 제한(중간 이탈): 노출/추천 강도 제한
    - 롤백(심각 이탈): 이전 안정 버전 즉시 복귀

## Innovation & Novel Patterns

### Detected Innovation Areas

- Goal-Formation UX: 목적 확정 전 사용자도 정상 진입
- Pre-Intent Liquidity Model: 결심 이전 의향 공개로 잠재 공급 선형성
- Decision-First Marketplace: 거래량보다 판단 품질 우선
- Asset-State Continuum: 소유/보유/판매/임대 상태 전이 모델
- 단계적 롤아웃: MVP는 소유/판매 우선, 이후 보유/임대 확장

### Market Context & Competitive Landscape

- 가격 노출 중심 대안의 한계(행동 결정 근거 부족)
- 체결 중심 퍼널의 한계(목적 미정/보류 사용자 이탈)
- 미정/보류 상태를 가치 흐름으로 흡수하는 구조가 차별점

### Validation Approach

- 실험군: 선의향 공개 + 의향 빌드업 플로우
- 대조군: 일반 등록/일반 탐색 플로우
- 비교 지표: 등록률, 활용률, 재전환율, 만족도, 탐색시간
- 정성 검증: 목적 미정 사용자 인터뷰, 이유 문구 신뢰도 평가

### Risk Mitigation

- 인지 부담: 3분기 진입 + 점진 입력
- 데이터 품질: 의향 검증/신뢰도/신선도 정책
- 정답 강요 오해: 확신도/대안 비교/재평가 경로 제공
- 혁신 미검증 fallback:
  - 트리거: 실험군이 대조군 대비 핵심지표 5개 중 3개 이상에서 2주 연속 열위
  - 유지 기능: 일반 등록 + 기본 판단 카드 + 핵심 계측
  - 중단 기능: 선의향 고급 분기/복잡 추천 분기

## Web App Specific Requirements

### Project-Type Overview

PreProduct는 유입 최적화와 판단 플로우 성능을 동시에 만족하기 위해 Hybrid 웹 구조를 채택한다. SEO 친화 페이지는 유입과 신뢰 형성을 담당하고, 앱 내부 SPA는 의향 등록/판단/재평가 경험의 전환과 활용을 담당한다.

### Technical Architecture Considerations

- 아키텍처: Hybrid (`SEO 페이지` + `앱 셸 SPA`)
- 브라우저 타깃: 최신 Chrome, Edge, Safari, iOS Safari
- 접근성 목표: WCAG AA
- 실시간 전략: 이벤트 기반 우선, 일반 정보는 주기 갱신
- 중복 구현 방지 원칙:
  - 도메인 로직(판단/의향/상태 전이)은 앱 서비스 레이어로 단일화
  - SEO 페이지는 콘텐츠/유입 역할에 집중하고 판단 로직을 복제하지 않음
  - 공통 컴포넌트/카피는 단일 소스에서 관리

### Browser Matrix

- Desktop: Chrome(최신 2버전), Edge(최신 2버전), Safari(최신 2버전)
- Mobile: iOS Safari(최신 2버전)
- MVP 후순위: Firefox는 모니터링 후 확장 검토

### Responsive Design

- 모바일 우선 설계, 데스크톱에서 판단 카드 비교 밀도 확장
- 핵심 플로우는 1핸드 조작 기준 터치 타깃 확보
- 입력 누적형 탐색의 진행 상태를 단계별로 명확히 표시

### Performance Targets

- 핵심 여정 체감 지연 최소화(랜딩 -> 의향 입력 -> 판단 카드)
- 계측/실험 스크립트는 UX 성능 저해 없도록 우선순위 분리
- 실시간 전면 도입 대신 선택 적용으로 운영 복잡도 제어

### SEO Strategy

- SEO 우선 범위: 랜딩/문제정의/가치설명/시나리오 페이지
- 앱 내부 판단 화면은 SEO보다 상호작용 성능 우선
- KPI 역할 분리:
  - SEO 페이지 KPI: 유입 품질/전환 진입률
  - 앱 KPI: 의향 등록률/판단 활용률/재평가 전환률

### Accessibility Level

- 목표: WCAG AA
- 필수: 대비, 포커스, 키보드 접근, 폼 오류 피드백, 스크린리더 라벨
- 실험 UI 추가 시 접근성 회귀 점검 필수

### Real-Time Strategy (Selected)

- 필수 실시간: 시세 급변, 신모델 출시 신호, 조건 충족 알림
- 비필수: 일반 탐색 데이터는 주기 갱신

### Implementation Considerations

- SEO 페이지와 앱 셸 책임 분리
- 테스트 우선순위 핵심 플로우 3개:
  - 랜딩 -> 의향 입력 시작
  - 의향 입력 완료 -> 판단 카드 노출
  - 보류 선택 -> 재평가/행동 전환
- 브라우저 호환성/접근성/성능 점검을 MVP 품질 게이트에 포함

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP (판단 품질 검증 우선)
**Resource Requirements:** 최소 4명
- PM/리서치(1), 풀스택 엔지니어(2), 디자인/QA 겸임(1)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- 목적 미정 사용자 탐색 -> 의향 입력 -> 판단 카드
- 판매 고민 사용자 선의향 공개 -> 보류/전환 판단
- 운영/지원 겸임자의 KPI/가드레일/문의 대응

**Must-Have Capabilities:**
- 목적 가변형 입력 플로우 + 상태값(`intent_maturity`, `goal_confidence`)
- 선의향 등록/업데이트/노출 정책
- 설명 가능한 판단 카드(이유 문구, 확신도, 대안 경로)
- 보류-재평가 루프
- 핵심 이벤트 11종 계측 + KPI 대시보드 v1
- Go/Hold/Stop 판정 리포트 템플릿

### Phase 1.5 (Pilot Integrations)

- 제한된 외부 파트너 1~2곳 대상 파일럿 연동
- 익명/집계 신호만 제공
- 인증키/쿼터/오류 규약/감사로그 최소세트 적용
- 목표: 파트너 연동 가치 검증 및 운영 리스크 측정

**Phase 1 -> 1.5 진입 조건**
- 핵심지표 5개 중 3개 이상 2주 연속 목표선 충족
- 가드레일(신고율/카드 실패율) 2주 연속 충족
- 계측 품질(이벤트 중복률 `< 1%`) 유지

### Post-MVP Features

**Phase 2 (Growth):**
- 조건부 자동매칭 고도화
- 리스크 프로필 기반 추천 강도
- 보류 사유 맞춤 대안 추천
- 듀얼 탐색 모드(AI 추천/직접 탐색)
- 거래 전제/상쇄 조건 카드
- 브라우저 지원 확대(Firefox 포함)
- 파트너 온보딩 자동화 강화

**Phase 3 (Expansion):**
- 자산 상태 확장(보유/임대 고도화)
- Why-Shift 기반 개인화 추천
- 구매조건 우선 공개 + 판매자 유료 열람(리드형 수익모델)
- 결심 레디니스/의향 미러 시각화
- 마켓메이커/예치금 강화 신뢰장치
- 데이터/리드형 수익모델 확장
- 카테고리 다변화 및 세그먼트 특화 전략

### Risk Mitigation Strategy

**Technical Risks:** Hybrid 중복 구현, 추천 재현성, 데이터 품질
- 대응: 도메인 로직 단일화, 변경 추적, 회귀/드리프트 모니터링

**Market Risks:** 목적 미정 사용자 잔존/전환 불확실
- 대응: 실험군/대조군 운영 + 8~12주 지표 판정

**Resource Risks:** 인력/시간 부족
- 대응: fallback 사전 정의
- 유지: 일반 등록 + 기본 판단 카드 + 핵심 계측
- 중단: 선의향 고급 분기/복잡 추천 분기

## Functional Requirements

### User Intent & Goal Formation

- FR1 [MVP]: 사용자(목적 미정 포함)는 현재 문제/상황만으로 탐색을 시작할 수 있다.
- FR2 [MVP]: 사용자는 탐색 중에 목표를 생성, 수정, 폐기할 수 있다.
- FR3 [MVP]: 사용자는 자산 단위로 의향을 등록할 수 있다.
- FR4 [MVP]: 사용자는 의향에 제약조건(예산, 기간, 혜택, 현금흐름 필요 등)을 추가, 수정할 수 있다.
- FR5 [MVP]: 시스템은 사용자 의향 성숙도(`intent_maturity`)를 관리할 수 있다.
- FR6 [MVP]: 시스템은 목표 신뢰도(`goal_confidence`)를 관리할 수 있다.

### Decision Support & Recommendation

- FR7 [MVP]: 시스템은 사용자 입력을 기반으로 행동 선택지(구매, 판매, 보류, 대안)를 제시할 수 있다.
- FR8 [MVP]: 시스템은 각 선택지에 대해 설명 가능한 판단 근거를 제공할 수 있다.
- FR9 [MVP]: 시스템은 판단 결과의 확신도/불확실성 정보를 제공할 수 있다.
- FR10 [MVP]: 사용자는 판단 결과 이후 보류를 선택할 수 있다.
- FR11 [MVP]: 시스템은 보류 후 재평가 경로를 제공할 수 있다.
- FR12 [MVP]: 시스템은 시점/조건 변화에 따라 제시 선택지를 재정렬할 수 있다.

### Pre-Intent Liquidity & Asset State

- FR13 [MVP]: 사용자는 판매 확정 전에도 선의향을 공개할 수 있다.
- FR14 [MVP]: 사용자는 공개된 의향을 업데이트할 수 있다.
- FR15 [MVP]: 시스템은 의향 정보의 신선도/신뢰도를 관리할 수 있다.
- FR16 [MVP]: 시스템은 자산 상태(소유/보유/판매/임대)를 기록하고 상태 전이를 추적할 수 있다.
- FR17 [MVP]: 사용자는 처분 의도 유형(`disposal_intent_type`)을 지정할 수 있다.
- FR18 [MVP]: 시스템은 시간 압박(`time_pressure`)과 유동성 필요(`liquidity_need`)를 반영해 판단을 지원할 수 있다.

### Timing, Signals, and Alerts

- FR19 [MVP]: 시스템은 시세/이벤트 변화 신호를 수집해 사용자 판단에 반영할 수 있다.
- FR20 [MVP]: 시스템은 타이밍 민감 조건 충족 시 사용자에게 알림을 제공할 수 있다.
- FR21 [MVP]: 사용자는 알림 기준을 설정, 수정할 수 있다.

### Operations, Trust, and Support

- FR22 [MVP]: 운영자는 핵심 지표와 가드레일 상태를 확인할 수 있다.
- FR23 [MVP]: 운영자는 Go/Hold/Stop 판정 근거를 확인할 수 있다.
- FR24 [MVP]: 운영/지원 담당자는 사용자 문의 건에 대한 판단 근거 로그를 조회할 수 있다.
- FR25 [MVP]: 운영자는 저품질/정책위반 의향에 대해 노출 정책을 적용할 수 있다.
- FR26 [MVP]: 시스템은 데이터 주체의 열람/정정/삭제 요청을 접수, 처리할 수 있다.

### Measurement & Experimentation

- FR27 [MVP]: 시스템은 핵심 이벤트(판단 여정 전반)를 기록할 수 있다.
- FR28 [MVP]: 시스템은 실험군/대조군을 구분해 성과를 비교할 수 있다.
- FR29 [MVP]: 운영자는 핵심 지표와 가드레일을 주기적으로 리포트할 수 있다.
- FR30 [MVP]: 시스템은 품질 저하(드리프트) 신호를 감지할 수 있다.
- FR40 [MVP]: 시스템은 사용자별 실험군 할당을 일관되게 유지할 수 있다.

### Partner Integration

- FR31 [P1.5]: 시스템은 파트너별 API 접근 권한을 발급/관리할 수 있다.
- FR32 [P1.5]: 시스템은 파트너에게 익명/집계 신호를 제공할 수 있다.
- FR33 [P1.5]: 시스템은 API 사용량 제한(쿼터)을 적용할 수 있다.
- FR34 [P1.5]: 시스템은 API 오류 규약을 일관되게 제공할 수 있다.
- FR35 [P1.5]: 시스템은 파트너 접근/데이터 사용 이력을 감사할 수 있다.

### User History, Reflection, and Service Mode

- FR36 [P2+]: 사용자는 자신의 탐색/판단 히스토리를 조회할 수 있다.
- FR37 [P2+]: 사용자는 목표/의향 변경 이력을 기반으로 판단 회고를 할 수 있다.
- FR38 [MVP]: 운영자는 서비스 모드를 기본 모드와 fallback 모드로 전환할 수 있다.
- FR39 [MVP]: 운영자와 지원 담당자는 현재 적용 중인 서비스 모드 상태를 조회할 수 있다.

### 핵심 이벤트 정의 (MVP 11종)

| Canonical Event | 정의 | 주요 트리거 |
| --- | --- | --- |
| `view_landing` | 랜딩/진입 화면 노출 | 첫 진입 또는 재진입 |
| `start_intent_input` | 의향 입력 시작 | 입력 플로우 진입 |
| `complete_intent_input` | 의향 입력 완료 | 필수 입력 저장 성공 |
| `view_decision_card` | 판단 카드 노출 | 결과 화면 렌더 |
| `select_action` | 행동 선택 완료 | 진행/보류/알림/드랍 선택 |
| `hold_reason_submit` | 보류 사유 제출 | 보류 사유 저장 |
| `revisit_decision` | 재평가 진입 | 보류/드랍 맥락 복원 후 재진입 |
| `convert_after_hold` | 보류 후 전환 | 보류 이후 진행/완료로 전환 |
| `decision_satisfaction_submit` | 만족도 제출 | 판단 후 만족도 기록 |
| `decision_card_error` | 판단 카드 실패 | 생성/노출 실패 감지 |
| `report_low_quality_input` | 저품질 입력 신고 | 신고 제출 완료 |

### UX Journey Event <-> PRD Canonical Event 매핑

| UX Event (Alias) | PRD Canonical Event |
| --- | --- |
| `state_assessed` | `view_landing` |
| `intent_input_started` | `start_intent_input` |
| `next_step_selected` | `complete_intent_input` |
| `decision_card_viewed` | `view_decision_card` |
| `decision_submitted` | `select_action` |
| `decision_context_saved` | `hold_reason_submit` |
| `revisit_flow_started` | `revisit_decision` |
| `convert_after_hold` | `convert_after_hold` |
| `decision_satisfaction_submitted` | `decision_satisfaction_submit` |
| `decision_card_error` | `decision_card_error` |
| `low_quality_reported` | `report_low_quality_input` |

## Non-Functional Requirements

### Performance

- NFR1: 핵심 여정(랜딩 -> 의향 입력 시작 -> 판단 카드 노출) 주요 액션 응답시간은 주간 p95 기준 2초 이내여야 한다.
- NFR2: 판단 카드 첫 노출 시간은 주간 p95 기준 3초 이내여야 한다.
- NFR3: 타이밍 알림 이벤트(조건 충족/시세 급변)는 이벤트 발생 후 5분 이내 전달률 95% 이상을 유지해야 한다.
- NFR4: 성능 저하 시 fallback 모드에서도 핵심 여정은 유지 가능해야 한다. (주간 합성 모니터링 기준 핵심 여정 성공률 >= 95%)

### Security & Privacy

- NFR5: 사용자/의향 데이터는 전송 구간 및 저장 구간 모두 보호되어야 한다. (전송 TLS 1.2 이상, 저장 AES-256 이상, 월 1회 검증 리포트)
- NFR6: 파트너 API는 인증된 주체만 접근 가능해야 하며 권한 범위 외 요청은 차단되어야 한다. (인증 실패/권한 오류 401/403 분리 로깅, 일별 차단 누락률 0%)
- NFR7: 데이터 사용 목적, 수집 항목, 제공 범위는 사용자에게 확인 가능해야 한다. (정책 화면 3클릭 이내 접근, 주간 표본 점검 100% 통과)
- NFR8: 데이터 주체 요청(열람/정정/삭제)은 정의된 SLA 내 처리 상태 추적이 가능해야 한다.
- NFR9: 운영자/파트너 주요 행위는 감사 가능한 로그로 남아야 한다. (핵심 행위 로그 적재율 99.9% 이상, 보존기간 365일 이상)
- NFR10: 서비스는 목적 달성에 필요한 최소 데이터만 수집, 보관해야 한다. (분기별 데이터 최소수집 리뷰 1회, 불필요 필드 0건 목표)

### Scalability

- NFR11: 기준 부하(초기 예상 동시 사용자 및 요청량) 대비 3배 부하에서도 핵심 여정 성능 기준(NFR1~NFR3)을 유지해야 한다.
- NFR12: 사용자/의향 데이터 증가 시 핵심 조회/판단 흐름의 성능 저하가 급격히 발생하지 않아야 한다. (데이터 2배 증가 시 p95 응답시간 증가율 <= 25%)
- NFR13: 파트너 연동은 파일럿(1~2개)에서 시작해 단계적으로 확장 가능한 구조여야 한다.

### Accessibility

- NFR14: 웹 경험은 WCAG AA 수준을 충족해야 한다.
- NFR15: 핵심 여정은 키보드만으로 수행 가능해야 한다. (핵심 여정 3개 시나리오 키보드 전용 통과율 100%, 주간 회귀 점검)
- NFR16: 입력 오류/상태 변화/알림 정보는 보조기술 사용자에게 인지 가능해야 한다. (스크린리더 점검 체크리스트 항목 100% 충족)

### Integration

- NFR17: 파트너 API는 버전 관리가 가능해야 하며 하위호환/변경 공지 정책을 가져야 한다. (하위호환 유지기간 최소 90일, 사전 공지 최소 30일)
- NFR18: API 오류 응답은 일관된 규약과 복구 가능한 안내를 포함해야 한다. (표준 오류 스키마 준수율 100%, 복구 가이드 포함율 100%)
- NFR19: 파트너 쿼터/레이트 제한은 정책 기반으로 적용되고 관측 가능해야 한다. (정책 적용률 100%, 초과 이벤트 관측 지연 <= 1분)

### Reliability & Operability

- NFR20: 시스템은 기본/fallback 모드 상태를 운영자가 확인 가능해야 한다. (운영 콘솔 상태 반영 지연 <= 30초)
- NFR21: 실험군/대조군 할당은 사용자 단위로 일관되게 유지되어야 한다. (재방문 사용자 할당 일치율 >= 99.5%)
- NFR22: 드리프트/가드레일 이탈 시 관찰-제한-롤백 절차를 실행 가능한 상태로 유지해야 한다. (분기별 모의훈련 1회, 절차 실행 성공률 100%)
- NFR23: 장애 발생 시 핵심 데이터(의향/판단/이력)의 무결성과 복구 가능성이 보장되어야 한다. (RPO <= 15분, RTO <= 60분, 월 1회 복구 리허설)

## Round 2 Label Harmonization (2026-04-07)

### Active MVP

- In this document, Active MVP means the authoritative implementation scope for the current sprint.

### Deferred P1.5+

- In this document, Deferred P1.5+ means design is retained, but implementation is postponed.

### Legacy Reference

- Existing extended or historical narratives are treated as Legacy Reference.
- If any conflict exists, Active MVP and Deferred P1.5+ take precedence.

## Correct Course Baseline (2026-04-07 revised-minimal)

### Scope Override (Authoritative for MVP)

- 본 절은 이전 본문의 충돌 항목보다 우선한다.
- MVP 정의는 "판단 중심 전체 플랫폼"이 아니라 "단순 중고거래 + AI 보조 3기능"이다.
- 근거 문서: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-07-needs-work.md`

### Updated MVP Definition

- 상품 등록/조회/수정 기본 플로우
- AI 기능 1: 사진 업로드 기반 상품 정보 자동 추출(제목/카테고리/핵심 스펙)
- AI 기능 2: 초기 추천가 제안(수동 수정 가능)
- AI 기능 3: 미판매 기간 경과 시 자동 가격조정(주기/인하율/하한가)
- 실패 대응: AI 판독 실패 시 수동 입력 fallback

### Revised Functional Scope

- MVP Active FR:
  - FR3, FR4, FR7, FR8, FR9, FR12, FR13, FR14, FR19, FR20, FR21, FR27
- P1.5+ Deferred FR:
  - FR22~FR26 (운영/지원 고도화)
  - FR28~FR30, FR40 (실험/드리프트 고도화)
  - FR31~FR35 (파트너 API)
- P2+ 유지:
  - FR36, FR37

### Revised MVP Events (Minimal Contract)

- `listing.created.v1`
- `ai.extraction.reviewed.v1`
- `pricing.suggestion.accepted.v1`
- `pricing.auto_adjust.applied.v1`

### Event Rollout Policy (MVP vs Expansion)

- MVP(현재): 위 4종 이벤트만 필수 수집/검증 대상으로 운영한다.
- Expansion(P1.5+): 운영/실험/파트너 확장 이벤트를 단계적으로 재도입한다.
- 정책 규칙:
  - 신규 이벤트는 `versioned schema + recovery_guide + dashboard mapping`이 없으면 배포 불가
  - 확장 이벤트 실패는 핵심 등록 플로우 차단 금지(격리/재처리 원칙)
  - 릴리즈 노트에 이벤트 활성 범위(MVP/P1.5+)를 명시한다

### Revised MVP Quality Gates

- 등록 완료율: `>= 70%`
- AI 제안 수용률: `>= 50%`
- 필수 필드 판독 정확도: `>= 85%`
- 자동 가격조정 실패율: `< 1%`
- 판독 실패 수동입력 fallback E2E 통과율: `100%`

### Implementation Priority (Re-baselined)

1. Listing CRUD + 소유권 정책
2. 이미지 판독 어댑터 + 검토/수정 UI
3. 추천가 제안 + 자동 가격조정 스케줄러
4. 최소 이벤트 계측/기초 대시보드
5. P1.5+ 재확장(운영/실험/파트너)

## Analysis Restart Baseline (2026-04-07 approved)

- 승인 문서: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-07-analysis-restart.md`
- 본 PRD는 현재 "즉시 구현 기준"이 아니라 "재분석/재검증 대상 기준"이다.
- 필수 선행:
  - `[CB]` Product Brief 재작성/갱신
  - `[MR]` Market Research
  - `[TR]` Technical Research
  - `[DR]` Domain Research
  - `[CP]` PRD 재작성
  - `[IR]` Implementation Readiness 재판정
- 위 선행 승인 전에는 `create-story`/`dev-story`를 실행하지 않는다.

