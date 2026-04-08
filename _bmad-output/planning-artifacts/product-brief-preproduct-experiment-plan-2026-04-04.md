# PreProduct MVP Experiment Plan (H1 Focus)

## 1) Measurement Scope

- 기준 문서: `product-brief-preproduct-2026-04-04.md`
- 실험 목적: "판매 확정 전 프리리스팅 니즈 존재 여부" 검증
- 측정 기간: 출시 후 8주
- 판정 단위: 주간 집계 + 누적 추세

## 2) Hypothesis Set (Reduced)

### Core Hypothesis (H1)

사용자는 판매 확정 전에도 먼저 등록(프리리스팅)할 니즈가 있다.

### Sub-Hypotheses

1. H1-행동 가설  
판매 미확정 상태에서도 프리리스팅 완료 행동이 발생한다.

2. H1-품질 가설  
프리리스팅 데이터는 후속 액션(가격설정/수정)에 쓸 수 있는 품질을 가진다.

3. H1-유지 가설  
프리리스팅 사용자는 7일 내 업데이트를 수행한다.

## 3) Tracking Contract (MVP Minimal)

### 필수 이벤트 (PRD Active MVP 기준)

1. `listing.created.v1`
- 정의: 프리리스팅 생성 완료
- 목적: H1-행동 가설 검증 핵심 이벤트

2. `ai.extraction.reviewed.v1`
- 정의: AI 판독 결과 검토/수정 완료
- 목적: 입력 품질/보정 행동 파악

3. `pricing.suggestion.accepted.v1`
- 정의: 추천가 수용 또는 수동 확정
- 목적: 프리리스팅 이후 가격결정 연결성 확인

4. `pricing.auto_adjust.applied.v1`
- 정의: 자동 가격조정 적용 완료
- 목적: 운영 안정성 및 후속 관리 검증

### 보조 데이터 소스 (DB 집계)

- `listing.updated_at` 기반 7일 내 업데이트 여부
- 필수 필드 완성률(제목/카테고리/핵심 스펙/가격 관련 필드)

## 4) Metric Formulas

1. 프리리스팅 완료율  
`listing.created users / landing_or_entry users`

2. 7일 내 업데이트율  
`(created listings with update within 7d) / (created listings)`

3. 필수 필드 완성률  
`(created listings with required fields complete) / (created listings)`

## 5) Decision Rule (Weekly)

1. Go
- 프리리스팅 완료율 `>= 35%`
- 7일 내 업데이트율 `>= 25%`
- 필수 필드 완성률 `>= 85%`

2. Hold
- 프리리스팅 완료율 `25%~34%` 또는
- 7일 내 업데이트율 `15%~24%`

3. Reframe
- 프리리스팅 완료율 `< 25%` and 7일 내 업데이트율 `< 15%`

## 6) Dashboard Spec

### A. Core Panel

- 프리리스팅 완료율 (목표선 35%)
- 7일 내 업데이트율 (목표선 25%)
- 필수 필드 완성률 (가드레일 85%)

### B. Quality Panel

- AI 판독 검토 후 수정 비율
- 추천가 수용률
- 자동 가격조정 실패율

## 7) Ops Checklist

- 이벤트 스키마 버전(`v1`) 고정
- 이벤트 공통 필드 누락률 점검
- UTC 저장 및 주간 집계 타임존 일관성 유지
- 실험 기간 중 지표 정의 변경 금지
