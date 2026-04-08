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
  complexity: "medium"
  projectContext: "greenfield"
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-preproduct-2026-04-04.md"
  - "_bmad-output/planning-artifacts/product-brief-preproduct-experiment-plan-2026-04-04.md"
  - "_bmad-output/planning-artifacts/research/market-preproduct-prelisting-mvp-research-2026-04-07.md"
documentCounts:
  briefCount: 2
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 0
  otherCount: 0
workflowType: "prd"
date: "2026-04-07"
lastEdited: "2026-04-07"
---

# Product Requirements Document - PreProduct

**Author:** 상재
**Date:** 2026-04-07

## Executive Summary

PreProduct(working title)는 판매 결심 이전 단계에서 프리리스팅으로 판단 부담을 줄이는 웹앱이다. 이번 MVP는 8주 내 프리리스팅 니즈의 존재와 지속성을 행동지표로 검증한다.
국내 주요 중고거래 맥락에서 실행거래 경쟁이 심화된 반면, 결심 이전 단계 지원은 상대적으로 덜 구조화되어 있다. 제품은 1분 등록 플로우와 AI 보조(정보정리/가격보조)를 실행수단으로 사용해 초기 마찰을 낮춘다. AI 보조는 결정을 자동화하지 않으며, 입력/가격 판단의 초기 마찰만 낮춘다.
초기 검증 앵커는 `listing.created.v1`와 `pricing.suggestion.accepted.v1`이며, 세부 수치 목표는 Step 3에서 확정한다. MVP는 거래 완료 최적화나 파트너 확장보다 프리리스팅 행동 검증에 우선순위를 둔다.

### What Makes This Special

차별점은 거래 성사 최적화가 아니라 “결심 전 확신 형성”을 제품의 출발점으로 삼는 데 있다. 정답을 강요하지 않고 판단 보조 정보를 제공해 사용자의 부담을 줄인다.
핵심 인사이트는 병목이 거래 실행이 아니라 실행 전 정리·판단 구간에 있다는 점이며, MVP는 재평가 고도화 대신 프리리스팅 마찰 제거와 AI 보조 정확도 검증에 집중한다.
외부 포지셔닝: “팔지 말지 고민될 때, 먼저 등록하고 판단 부담을 줄인다.”
UX 약속: “1분 등록으로, 오늘의 결정을 가볍게.”

## Project Classification

- Project Type: `web_app`
- Domain: `general` (중고거래/e-commerce use case)
- Complexity: `medium`
- Project Context: `greenfield`

## Success Criteria

### User Success

- 사용자는 판매 확정 전에도 1분 내 프리리스팅을 완료할 수 있다.
- 사용자는 등록 직후 다음 행동(즉시 판매 준비/보류/가격 조정) 판단에 필요한 최소 근거를 얻는다.
- 핵심 아하 모먼트: “아직 안 팔아도, 지금 등록해두면 판단이 쉬워진다.”

### Business Success

- 8주 내 프리리스팅 수요 검증 여부를 Go/Hold/Stop&Reframe으로 판정한다.
- 1차 성공 기준은 거래 완료량이 아니라 결심 전 행동 전환(등록/업데이트)이다.
- MVP 기간 동안 리소스는 프리리스팅 마찰 제거와 핵심 이벤트 계측 안정화에 집중한다.
- 판정 윈도우는 Week 1-2 baseline 학습, Week 3-8 공식 판정으로 운영한다.

### Technical Success

- 핵심 이벤트 계측(`listing.created.v1`, `ai.extraction.reviewed.v1`, `pricing.suggestion.accepted.v1`, `pricing.auto_adjust.applied.v1`)이 안정 수집된다.
- 계측 품질 기준: 이벤트 중복률 `< 1%`, 필수 이벤트 누락률 `< 2%`.
- AI 보조는 결정을 자동화하지 않고 입력/가격 판단 마찰 감소 수단으로 동작한다.
- 판독 실패 시 수동 입력 fallback이 사용자 흐름을 끊지 않는다.
- 판독 실패 수동입력 fallback E2E 통과율은 `100%`를 유지한다.

### Measurable Outcomes

- 프리리스팅 완료율: `>= 35%` (8주)
- 7일 내 업데이트율: `>= 25%` (8주)
- 필수 필드 완성률: `>= 85%` (가드레일)
- 추천가 수용률: `>= 50%` (보조 KPI)
- 자동 가격조정 실패율: `< 1%`
- 필수 필드 정의: 제목, 카테고리, 핵심 스펙 1개 이상, 가격

### Weekly Decision Rule (8주 운영)

- Go: Week 3-8 기준 완료율 `>= 35%` AND 7일 내 업데이트율 `>= 25%` AND 필수 필드 완성률 `>= 85%`
- Hold: 핵심 지표 1개만 충족 또는 가드레일 미충족 1주
- Stop&Reframe: 핵심 지표 2개 모두 미충족 2주 연속, 또는 가드레일 미충족 2주 연속
- 판정 우선순위: 가드레일 위반 시 핵심지표 달성과 무관하게 Hold/Stop 우선
- 예외 규칙: fallback E2E 통과율 `100%` 미달 시 자동 Hold

## Product Scope

### MVP - Minimum Viable Product

- 상품 등록/조회/수정 기본 플로우
- 1분 프리리스팅 플로우
- AI 사진 판독 기반 정보 초안 생성 + 사용자 검토/수정
- AI 추천가 제안 + 수동 확정
- 기간 기반 자동 가격조정
- 핵심 이벤트 4종 계측 + 주간 판정 리포트 운영

### Growth Features (Post-MVP)

- 재평가 루프 고도화
- 운영/지원 콘솔 고도화
- 실험군/대조군 자동 운영 및 드리프트 대응
- 파트너 API 파일럿(P1.5+)

### Vision (Future)

- 결심 전 판단 시작점을 카테고리 전반으로 확장
- 개인화된 판단 보조(의향 변화 기반)
- 데이터/리드형 수익모델 확장

## User Journeys

### Journey 1 - Primary User Success Path (판매 미확정 보유자)

**Opening Scene**  
민수는 물건을 팔지 말지 아직 결정하지 못했다. 시세를 모르고, 등록 준비가 번거로워 미루고 있다.

**Rising Action**  
민수는 PreProduct에 들어와 사진을 올리고 기본 정보를 빠르게 입력한다. AI가 제목/카테고리/핵심 스펙 초안을 제시하고 추천가를 보여준다. 민수는 일부를 수정한 뒤 프리리스팅을 저장한다.

**Climax**  
민수는 "지금 당장 판매 확정은 아니지만, 등록을 먼저 해두니 판단이 쉬워졌다"는 체감을 얻는다.

**Resolution**  
민수는 프리리스팅을 유지하다가 7일 내 상태/가격을 업데이트하며 다음 행동 결정을 구체화한다.

**Failure/Recovery**  
추천가가 마음에 들지 않으면 수동으로 가격을 확정하고 저장 가능해야 한다.

### Journey 2 - Primary User Edge Path (AI 판독 실패 -> 수동 fallback)

**Opening Scene**  
지은은 사진 품질이 낮거나 카테고리가 애매한 물건을 등록하려 한다.

**Rising Action**  
AI 판독이 부분 실패하거나 신뢰도가 낮게 나온다. 시스템은 실패를 숨기지 않고 수동 입력 경로를 즉시 제시한다.

**Climax**  
지은은 수동 입력으로 필수 필드(제목/카테고리/핵심 스펙/가격)를 채우고 등록을 완료한다.

**Resolution**  
지은은 "AI가 실패해도 등록은 끝낼 수 있다"는 통제감을 회복하고 이탈하지 않는다.

**Failure/Recovery**  
반복 실패 시 도움말/예시 입력을 제시하고, 저장 중단 없이 재시도 가능해야 한다.

### Journey 3 - Admin/Ops + Support Path (겸임 운영)

**Opening Scene**  
운영 담당자 수진은 주간 성과와 품질 리스크를 동시에 관리해야 한다.

**Rising Action**  
수진은 완료율/7일 업데이트율/필수 필드 완성률과 기술 가드레일(중복률/누락률/fallback E2E)을 확인한다. 운영은 Week 1-2 baseline 학습, Week 3-8 공식 판정 윈도우로 진행된다.

**Climax**  
주간 회의에서 Go/Hold/Stop&Reframe 판정 규칙을 적용해 상태를 결정한다.

**Resolution**  
지표와 가드레일에 따라 다음 주 액션(온보딩 보완, AI 품질 개선, 계측 수정)을 우선순위화한다.

**Failure/Recovery**  
가드레일 위반 또는 fallback E2E 미달이면 자동 Hold로 전환하고 원인 복구 후 재평가한다.

### Journey Requirements Summary

- 1분 프리리스팅 완료 플로우
- 7일 내 업데이트 유도 및 기록
- AI 초안 제시 + 사용자 수정/확정 UX
- 추천가 수용/수정 경로
- AI 실패 시 수동 fallback 무중단 플로우
- 필수 필드 검증(제목/카테고리/핵심 스펙/가격)
- 핵심 이벤트 계측(등록/판독검토/추천가수용/자동가격조정)
- 운영용 KPI/가드레일 모니터링
- Week 1-2 baseline, Week 3-8 공식 판정 운영
- Go/Hold/Stop&Reframe 판정 지원
- 후속 확장 가설: 사용자가 판매 전 예상 유동성을 확인하고 필요한 준비행동을 이해하면 업데이트/전환 품질이 개선된다.
- 후속 기능명: `사전 유동성 인사이트`
- 출력 형태: 관심도 점수/라벨 + 추천 준비행동(2-3개) + 재확인 시점
- 제품 원칙: 판매 보장/정확한 체결 예측 약속 금지
- 검증 질문: 최소 입력으로 유의미한 신호를 만들 수 있는가, 신호가 업데이트율/전환율을 개선하는가, 오판 시 신뢰 훼손을 제어할 수 있는가
- MVP에서 후속 유동성 인사이트를 위한 최소 신호 스키마(업데이트 시점, 가격변경 사유)를 수집한다.

## Domain-Specific Requirements

### Compliance & Regulatory

- MVP 범위에서는 법령 전수 대응보다 필수 운영정책(이용약관, 신고/차단, 분쟁 처리, 개인정보 처리/삭제 정책) 명확화에 집중한다.
- 데이터 주체 요청(열람/정정/삭제) 처리 절차와 SLA를 정의하고, 접수-처리-완료 상태 추적이 가능해야 한다.
- 정책/신고/분쟁/개인정보 관련 안내 화면은 사용자 기준 3클릭 이내 접근 가능해야 한다.
- 법령 해석/고도 규제 이슈는 후속 법무 검토 트랙으로 분리한다.
- MVP 범위 외 컴플라이언스: 고급 파트너 컴플라이언스 자동화, 자동 법규 판독/규정 매핑 자동화.
- AI 보조 결과는 참고 정보임을 명시하고 사용자 최종 확정 책임 경계를 분명히 한다.
- 규제/정책 요구는 사용자 신뢰 훼손 방지에 필요한 최소선만 MVP에 포함한다.

### Technical Constraints

- 개인정보/거래 데이터 전송·저장 구간 보호를 적용한다.
- 핵심 이벤트 계측 무결성(중복/누락/시간 일관성)을 유지한다.
- AI 판독 실패 시 수동 fallback 경로가 항상 동작해야 하며 사용자 플로우를 차단하면 안 된다.
- AI 결과에 신뢰도/확신도 라벨과 수정 가능 안내를 제공한다.
- 가드레일 우선 운영 규칙(품질 위반 시 Hold/Stop 우선)을 일관 적용한다.
- 정책/안내 표시 계층은 핵심 등록 플로우와 격리하고, 표시 실패가 등록 차단으로 이어지지 않도록 설계한다.

### Integration Requirements

- MVP는 외부 파트너 API 연동 없이 내부 플로우 완결을 우선한다.
- 후속(P1.5+) 확장을 위해 최소 신호 스키마(업데이트 시점, 가격변경 사유)를 선수집한다.
- 이벤트 스키마 버전 관리 원칙을 유지한다.
- 내부 이벤트/필드 네이밍은 초기부터 안정적으로 고정하고, 의미 변경 시 버전 증분 원칙을 적용한다.

### Risk Mitigations

- 저품질/허위 입력 유입 -> 필수 필드 검증, 신고/리뷰 정책, 운영 모니터링
- AI 보조 과신/오판 -> 판단 보조 톤 유지, 신뢰도 라벨, 수동 수정 경로
- 계측 품질 저하 -> 중복률/누락률 가드레일 + 주간 점검
- 유동성 인사이트 과장 -> 판매 보장/정확한 체결 예측 금지 원칙
- 컴플라이언스 항목은 전환 기능이 아니라 이탈/불신 방지 가드레일로 운영

## Innovation & Novel Patterns

### Detected Innovation Areas

- 혁신은 결심 전 단계를 제품 중심으로 재정의한 데 있다.
- 프리리스팅을 거래 전환 이전의 신호 수집 장치로 사용하는 구조를 채택한다.
- 사전 유동성 인사이트를 예측 보장이 아닌 행동 가이드로 설계한다.
- 결심 전 단계 선점은 이후 전환 품질과 운영 예측 가능성을 높이는 데이터 자산을 만든다.

### Market Context & Competitive Landscape

- 국내 중고거래 서비스는 실행거래 최적화 경쟁이 강하며, 결심 이전 단계 지원은 상대적으로 덜 구조화되어 있다.
- 차별화 축은 거래 성사 기능 추가보다 결심 전 마찰 제거와 업데이트 루프 품질에 있다.

### Validation Approach

- MVP는 행동 검증, Growth는 인사이트 효과 검증으로 분리한다.
- MVP(1차): 프리리스팅 완료율, 7일 업데이트율, 필수 필드 완성률로 검증한다.
- Growth(2차): 사전 정의 임계값(업데이트율/전환율 개선 폭) 충족 시 확장한다.
- 개선 미미 또는 신뢰도 하락 시 축소/중단한다.
- 판매 보장/정확한 체결 예측 약속은 금지한다.

### Risk Mitigation

- 과도한 약속 리스크 -> 신뢰도 라벨 + 행동 가이드 중심 표현
- 신호 품질 리스크 -> 최소 신호 스키마 선수집 + 가드레일 운영
- 성능/안정성 리스크 -> 인사이트 계산은 비동기/격리 경로로 운영
- 기능 장애 리스크 -> 유동성 인사이트 계산 실패 시에도 기본 등록/수정 플로우는 차단하지 않는다.
- 범위 확장 리스크 -> MVP는 프리리스팅 행동 검증에 집중하고 확장은 후속 단계로 분리

## Web App Specific Requirements

### Project-Type Overview

PreProduct(working title)는 MVP 가설검증 효율을 위해 Hybrid 웹 구조를 채택한다. SEO 페이지는 유입/신뢰 형성, 앱 셸 SPA는 프리리스팅 생성/수정/업데이트 전환을 담당한다.

### Technical Architecture Considerations

- 아키텍처: Hybrid (SEO 페이지 + 앱 셸 SPA)
- 브라우저 타깃: Chrome/Edge/Safari 최신 2버전 + iOS Safari
- 접근성 목표: WCAG AA
- 실시간 전략: 알림/조건충족 신호 중심의 선택적 실시간, 일반 데이터는 주기 갱신
- SEO 범위: 랜딩/가치설명/시나리오 페이지 우선, 앱 내부 상호작용 화면은 전환 성능 우선
- SEO 페이지와 앱 셸 간 도메인 로직 중복 구현 금지(단일 서비스 레이어 원칙)

### Browser Matrix

- Desktop: Chrome, Edge, Safari (최신 2버전)
- Mobile: iOS Safari (최신 2버전)
- 범위 외(초기): Firefox/기타 브라우저는 모니터링 후 확장 검토

### Responsive Design

- 모바일 우선 설계
- 프리리스팅 핵심 플로우(사진 업로드, 필드 수정, 저장)는 한 손 조작 기준으로 최적화
- 데스크톱에서는 비교/수정 가독성 중심 레이아웃 적용

### Performance Targets

- 핵심 여정(진입 -> 등록 -> 저장)의 체감 지연 최소화
- 핵심 액션 p95 2초 이내 목표(최종 수치는 Step 10 NFR에서 확정)
- 혁신 기능(유동성 인사이트)은 비동기/격리 처리로 핵심 등록 성능 영향 차단
- 계측/정책 표시 계층 실패가 등록 플로우 차단으로 이어지지 않도록 분리

### SEO Strategy

- SEO 우선 페이지: 랜딩, 문제정의, 가치제안, 시나리오
- 앱 내부 페이지: SEO보다 상호작용/전환 성능 우선
- 메시지 원칙: 판단 보조 톤 유지, 과장 약속 금지

### Accessibility Level

- 목표: WCAG AA
- 필수 항목: 대비, 포커스 표시, 키보드 접근, 폼 오류 안내, 스크린리더 라벨
- 정책/신뢰 안내 페이지는 3클릭 이내 접근 가능해야 함

### Real-Time Strategy (Selected)

- 필수 실시간: 조건 충족 알림, 주요 상태 변화 알림
- 비필수: 일반 탐색/참고 데이터는 주기 갱신
- 원칙: 실시간 기능 장애가 핵심 등록/수정 플로우를 차단하지 않아야 함

### Implementation Considerations

- MVP는 유입(SEO)과 전환(SPA) 책임 분리
- 핵심 플로우 3개를 우선 검증: 진입->프리리스팅 생성, AI 보조 검토->저장, 7일 내 업데이트
- iOS Safari는 업로드/입력/저장 경로를 별도 우선 회귀 검증
- 후속 확장(사전 유동성 인사이트)은 MVP 데이터 훅(업데이트 시점, 가격변경 사유) 기반으로 단계 도입
- MVP 제외 범위: 실시간 전면 동기화, 고급 개인화 추천, 파트너/API 확장
- 기준 제품은 기존 중고거래 플랫폼 표준 플로우이며, MVP 차별점은 사전 등록(프리리스팅) 1개 축에 집중

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP (가설 검증 우선)  
**Resource Requirements:** 최소 3-4명 (PM/PO 1, 풀스택 1-2, 디자인+QA 1)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- 판매 미확정 보유자 프리리스팅 생성/수정
- AI 판독 실패 시 수동 fallback으로 등록 완료
- 운영자의 주간 KPI/가드레일 판정(Hold/Stop 포함)

**Must-Have Capabilities:**
- 기존 중고거래 기본 플로우(등록/조회/수정)
- 사전 등록(프리리스팅) 플로우
- AI 정보초안 + 추천가 보조(수동 수정 가능)
- 자동 가격조정(규칙 기반)
- 핵심 이벤트 4종 계측
- 필수 가드레일 운영(중복/누락/fallback E2E)

### Post-MVP Features

**Phase 2 (Post-MVP):**
- 사전 유동성 인사이트(점수/라벨 + 준비행동 + 재확인 시점)
- 운영 콘솔 고도화
- 실험/드리프트 운영 강화

**Phase 3 (Expansion):**
- 고급 개인화
- 파트너/API 연동
- 다카테고리/신규 시장 확장

### Risk Mitigation Strategy

**Technical Risks:** AI 품질/계측 오류 -> fallback 우선, 가드레일 자동 Hold  
**Market Risks:** 프리리스팅 수요 부재 -> 8주 지표 기반 Stop&Reframe  
**Resource Risks:** 인력 부족 시 "기본 거래 + 프리리스팅 + 최소 계측"만 남기고 축소 출시

### Scope Governance Rules

- MVP 성공 판정 전에는 신규 사용자 유형(구매자/파트너) 확장 금지
- 인력/일정 부족 시 축소 우선순위:
  1) 개인화/실시간 고도화 제거
  2) 운영 콘솔 고도화 지연
  3) 핵심 플로우 유지
- 비핵심 기능은 feature flag off 원칙으로 격리 운영
- 이전 PRD에서 고려한 항목은 Phase 2/3 또는 Deferred 목록으로 수용하고, 각 항목에 지표 기반 재진입 조건을 부여

## Functional Requirements

### Listing & Pre-Listing Lifecycle

- FR1 [MVP]: 판매 사용자는 상품을 등록할 수 있다.
- FR2 [MVP]: 판매 사용자는 등록된 상품 정보를 수정할 수 있다.
- FR3 [MVP]: 판매 사용자는 등록된 상품을 조회할 수 있다.
- FR4 [MVP]: 판매 사용자는 판매 확정 전 프리리스팅 상태로 상품을 저장할 수 있다.
- FR5 [MVP]: 판매 사용자는 프리리스팅 상태를 업데이트할 수 있다.
- FR6 [MVP]: 시스템은 프리리스팅의 생성/수정 시점을 기록할 수 있다.
- FR7 [MVP]: 판매 사용자는 프리리스팅을 언제든 업데이트할 수 있다.

### AI-Assisted Preparation

- FR8 [MVP]: 판매 사용자는 상품 사진을 업로드해 정보 초안 생성을 요청할 수 있다.
- FR9 [MVP]: 시스템은 사진 기반 상품 정보 초안(제목/카테고리/핵심 스펙)을 제시할 수 있다.
- FR10 [MVP]: 판매 사용자는 AI가 제시한 정보 초안을 수정/확정할 수 있다.
- FR11 [MVP]: 시스템은 추천가를 제시할 수 있다.
- FR12 [MVP]: 판매 사용자는 추천가를 수용하거나 수동 가격으로 확정할 수 있다.
- FR13 [MVP]: 시스템은 AI 결과의 신뢰도/확신도 라벨을 표시할 수 있다.

### Fallback & Validation Safety

- FR14 [MVP]: 시스템은 AI 판독 실패 시 수동 입력 경로를 제공할 수 있다.
- FR15 [MVP]: 판매 사용자는 AI 실패 상황에서도 등록 플로우를 완료할 수 있다.
- FR16 [MVP]: 시스템은 필수 필드(제목, 카테고리, 핵심 스펙 1개 이상, 가격) 충족 여부를 검증할 수 있다.
- FR17 [MVP]: 시스템은 저장 실패/검증 실패 시 재시도 가능한 상태를 제공할 수 있다.

### Pricing & Update Operations

- FR18 [MVP]: 판매 사용자는 자동 가격조정 규칙을 설정할 수 있다.
- FR19 [MVP]: 시스템은 설정된 규칙에 따라 가격조정을 적용할 수 있다.
- FR20 [MVP]: 시스템은 가격 변경 사유를 기록할 수 있다.
- FR21 [MVP]: 판매 사용자는 가격 변경 이력을 확인할 수 있다.

### Measurement & Governance

- FR22 [MVP]: 시스템은 `listing.created.v1` 이벤트를 기록할 수 있다.
- FR23 [MVP]: 시스템은 `ai.extraction.reviewed.v1` 이벤트를 기록할 수 있다.
- FR24 [MVP]: 시스템은 `pricing.suggestion.accepted.v1` 이벤트를 기록할 수 있다.
- FR25 [MVP]: 시스템은 `pricing.auto_adjust.applied.v1` 이벤트를 기록할 수 있다.
  - 책임 분리 주석: Epic 3은 `pricing.auto_adjust.applied.v1`의 발생 책임을 가진다.
  - 책임 분리 주석: Epic 4는 수집 무결성/중복·누락 가드레일/경보 책임을 가진다.
  - 계약 소유 주석: 이벤트 스키마 버전 관리와 하위호환 검증 기준의 최종 소유자는 Epic 4 운영 계층이다(Producer 준수 책임은 Epic 3).
  - 판정 연계 규칙: 중복률 1% 이상 또는 누락률 2% 이상 위반 시 운영 판정은 Hold 규칙을 우선 적용한다.
  - 비차단 규칙: 위 Hold 판정은 운영 상태 결정 규칙이며, 사용자의 핵심 등록/수정 플로우를 직접 차단하지 않는다.
- FR26 [MVP]: 운영자는 핵심 지표(완료율, 7일 업데이트율, 필수 필드 완성률)를 확인할 수 있다.
- FR27 [MVP]: 운영자는 계측 가드레일(중복/누락/fallback 상태)을 확인할 수 있다.
- FR28 [MVP]: 운영자는 Go/Hold/Stop&Reframe 판정 상태를 기록/관리할 수 있다.

### Policy, Trust & Scope Control

- FR29 [MVP]: 사용자는 정책/신뢰 관련 안내 페이지에 접근할 수 있다.
- FR30 [MVP]: 시스템은 정책/안내 표시 실패가 핵심 등록/수정 플로우를 차단하지 않도록 동작할 수 있다.
- FR31 [MVP]: 운영자는 비핵심 기능을 feature flag로 비활성화할 수 있다.
- FR32 [MVP]: 시스템은 후속 유동성 인사이트 확장을 위한 최소 신호(업데이트 시점, 가격변경 사유)를 수집할 수 있다.

### Deferred Functional Requirements (Phase 2 Gate)

- FR33 [Deferred-P2]: 구매자는 프리리스팅 상품을 탐색할 수 있다.
- FR34 [Deferred-P2]: 구매자는 관심 신호(찜/관심등록)를 남길 수 있다.
- FR35 [Deferred-P2]: 시스템은 관심 신호를 판매자 업데이트 우선순위에 반영할 수 있다.
- 활성화 조건: MVP Go 판정 이후에만 Deferred-P2 FR을 활성화한다.

## Non-Functional Requirements

### Performance

- NFR1: 핵심 사용자 액션(등록 시작, 저장, 수정)은 p95 2초 이내 응답해야 한다.
- NFR2: 핵심 여정(진입 -> 프리리스팅 저장) 성공률은 주간 기준 95% 이상을 유지해야 한다.
- NFR3: 유동성 인사이트 계산 실패가 핵심 등록/수정 플로우 지연 또는 차단을 유발하면 안 된다.

### Security

- NFR4: 사용자/거래 데이터 보호 통제는 전송 및 저장 구간 모두 적용되어야 하며 월 1회 점검 리포트로 검증 가능해야 한다.
- NFR5: 운영자 기능은 권한 기반 접근 제어가 적용되어야 하며 권한 외 요청은 차단되어야 한다.
- NFR6: 주요 운영 행위(판정 변경, 기능 플래그 변경) 감사로그 적재율은 99.9% 이상이어야 한다.

### Scalability

- NFR7: 초기 기준 부하 정의 문서에 명시된 기준 대비 3배 부하에서도 핵심 액션 성능 기준(p95 2초)을 유지해야 한다.
- NFR8: 데이터 증가 시 핵심 조회/수정 플로우 성능 저하가 급격히 발생하면 안 된다.

### Accessibility

- NFR9: 사용자 웹 경험은 WCAG AA 기준을 충족해야 한다.
- NFR10: 핵심 플로우(사진 업로드, 필드 입력, 저장)는 키보드 기반 조작이 가능해야 한다.
- NFR11: 오류/상태 변경은 보조기술 사용자에게 인지 가능한 형태로 제공되어야 한다.

### Integration

- NFR12: 내부 이벤트 스키마는 버전 관리되어야 하며 의미 변경 시 버전 증분 원칙을 따라야 한다.
- NFR13: 외부 연동 확장 시 기존 핵심 플로우 호환성을 유지할 수 있어야 한다.

### Reliability & Operability

- NFR14: 계측 품질 기준으로 이벤트 중복률 1% 미만, 필수 이벤트 누락률 2% 미만을 유지해야 한다.
- NFR15: 판독 실패 수동입력 fallback E2E 통과율은 100%를 유지해야 한다.
- NFR16: 가드레일 위반 감지 후 운영 상태 반영 지연은 30초 이내여야 한다.

