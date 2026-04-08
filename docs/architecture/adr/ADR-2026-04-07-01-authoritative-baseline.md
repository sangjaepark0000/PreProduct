# ADR-2026-04-07-01: Authoritative Artifact Baseline

- Status: Approved
- Date: 2026-04-07
- Owner: Winston (Architect)

## Context

IR 결과, PRD/Epics/Architecture/UX 문서 버전이 혼재되어 구현 기준선이 분산되어 있었다.

## Decision

아래 4개 문서를 단일 authoritative baseline으로 고정한다.

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Epics: `_bmad-output/planning-artifacts/epics.md`
- UX: `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md`

충돌 시 본 ADR 기준선이 우선하며, 기타 버전은 Legacy Reference로만 사용한다.

## Consequences

- 장점: 구현/QA/리뷰 기준 일원화
- 단점: 기존 round2 문서와 일시적 불일치 발생 가능

## Required Actions

1. sprint status/스토리 생성 시 위 4개 문서 경로를 기본값으로 사용
2. PR 템플릿에 baseline 문서 확인 항목 추가
