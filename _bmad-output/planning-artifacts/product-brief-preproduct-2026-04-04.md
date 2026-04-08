# Product Brief: PreProduct (MVP Hypothesis Focus)

## Revision Note (2026-04-07)

- 본 개정은 MVP 가설을 축소해 검증 리스크를 낮추기 위한 업데이트다.
- 기준 문서 정합성: `prd-2026-04-07-round2-doc-aligned.md`, `epics.md`
- 핵심 결정: 이번 MVP는 "판매 전 등록(프리리스팅) 니즈 검증"에 집중한다.

## Executive Summary

PreProduct의 이번 MVP 목적은 단순하다.  
"사용자는 팔기로 확정하기 전에도 먼저 등록할 필요를 느끼는가?"를 빠르게 검증한다.

기존 중고 서비스는 보통 "판매 결심 완료 -> 등록" 흐름을 전제한다. 그러나 실제 사용자 행동은 결심 이전 단계에서 망설임이 크고, 이 구간에서 정보 정리와 기록 니즈가 발생한다. PreProduct는 이 공백을 프리리스팅으로 메운다.

이번 MVP는 거래 전체 최적화가 아니라, 프리리스팅 수요의 존재 여부를 입증하는 문제검증(Product Discovery) 단계다.

## Problem

- 사용자는 "지금 팔지 말지"를 정하지 못한 상태에서도 자산 정보를 정리하고 싶다.
- 판매 확정 전에는 등록 도구를 쓰기 애매해 기록이 미뤄지고, 이후 행동 전환이 늦어진다.
- 팀 입장에서는 "프리리스팅이 실제로 필요한 기능인지"를 데이터로 확증하지 못한 상태다.

## MVP Hypothesis

### Core Hypothesis (H1)

사용자는 판매 확정 전에도 먼저 등록(프리리스팅)할 니즈가 있다.

### Operational Sub-Hypotheses

1. H1-행동 가설  
판매 미확정 상태에서도 사용자는 프리리스팅을 완료한다.

2. H1-품질 가설  
프리리스팅 데이터는 후속 가격설정/수정에 활용 가능한 품질을 가진다.

3. H1-유지 가설  
프리리스팅 사용자는 7일 이내 재방문/업데이트 행동을 보인다.

## Who This Serves

- 1차: 판매를 고민 중인 보유자(아직 판매 확정 전)
- 2차: 반복 판매자(초기 등록을 빠르게 끝내고 이후 시점에 조정하려는 사용자)

## Success Criteria (MVP Gate)

### Measurement Window

- 1차 판정: 출시 후 8주

### Go / Hold / Reframe

1. Go
- 프리리스팅 완료율 `>= 35%`
- 7일 내 업데이트율 `>= 25%`

2. Hold
- 프리리스팅 완료율 `25%~34%` 또는
- 7일 내 업데이트율 `15%~24%`

3. Reframe
- 프리리스팅 완료율 `< 25%` and 7일 내 업데이트율 `< 15%`

### Quality Guardrail

- 필수 필드 완성률 `>= 85%`

## Scope (MVP)

### In Scope

- 판매 전 프리리스팅 생성/수정
- AI 사진 판독 기반 상품 정보 초안 생성
- AI 추천가 제안 + 사용자의 수동 수정
- 기간 기반 자동 가격조정 규칙 적용
- 최소 이벤트 계측:
  - `listing.created.v1`
  - `ai.extraction.reviewed.v1`
  - `pricing.suggestion.accepted.v1`
  - `pricing.auto_adjust.applied.v1`

### Out of Scope

- 의사결정 전체 여정(진행/보류/알림/드랍) 고도화
- 보류-재평가 루프 실험 고도화
- 파트너 API, 고급 실험/드리프트 운영

## Differentiation (Current MVP Lens)

- "판매 확정 이후 등록"이 아니라 "판매 확정 이전 등록"을 제품의 시작점으로 둔다.
- AI는 결정을 대체하는 기능이 아니라, 프리리스팅 마찰을 줄이는 보조 기능으로 사용한다.

## Vision

장기적으로는 판단 중심 플랫폼으로 확장하되, 현재 단계는 프리리스팅 니즈를 증명하는 데 집중한다.  
즉, 확장보다 검증이 우선이다.

## Measurement Execution Reference

- `product-brief-preproduct-experiment-plan-2026-04-04.md`
