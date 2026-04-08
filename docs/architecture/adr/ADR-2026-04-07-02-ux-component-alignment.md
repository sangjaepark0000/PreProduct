# ADR-2026-04-07-02: UX Component Scope Alignment

- Status: Approved
- Date: 2026-04-07
- Owner: Winston (Architect)

## Context

선택 UX(revision)와 Epics의 UX 컴포넌트 참조 축이 달라 Story DoD와 구현 우선순위 충돌 위험이 확인되었다.

## Decision

MVP Core UX 컴포넌트를 아래로 고정한다.

- `PhotoUploader`
- `ExtractionFieldEditor`
- `PriceSuggestionCard`
- `ListingSummarySubmitBar`

아래 컴포넌트는 `Deferred P1.5+`로 이동한다.

- `DecisionCard`
- `FitCriteriaPanel`
- `ActionDecisionBar`

## Consequences

- 장점: UX 기준과 에픽 구현 범위 정합성 확보
- 단점: 기존 Epic 4의 일부 스토리 재작성 필요

## Required Actions

1. `epics.md`의 Epic 4 Story 4.5/4.6 참조를 MVP core 기준으로 수정
2. UX-DR 맵에서 Deferred 항목 분리 표기
