# ADR-2026-04-07-03: Scope Precedence Enforcement (Active vs Legacy)

- Status: Approved
- Date: 2026-04-07
- Owner: Winston (Architect)

## Context

`architecture.md` 내 기존 고복잡도 경계와 revised-minimal MVP 경계가 공존하여 과구현 위험이 있었다.

## Decision

구현 우선순위를 아래 순서로 강제한다.

1. `Active MVP`
2. `Deferred P1.5+`
3. `Legacy Reference`

`Legacy Reference`는 구현 근거로 사용할 수 없고, 참고 목적에만 한정한다.

## Enforcement Rules

- 스토리/작업 항목에 Scope Tag(`Active MVP`/`Deferred`/`Legacy`)가 없으면 착수 금지
- PR에 Scope Tag와 baseline 충돌 점검 항목이 없으면 병합 금지

## Consequences

- 장점: 스코프 누수 및 과구현 방지
- 단점: 초기 문서 업데이트/태깅 비용 증가

## Required Actions

1. story 템플릿에 Scope Tag 필드 추가
2. PR 체크리스트에 Scope Tag 검증 필수화
3. `Legacy Reference` 섹션을 구현 계획에서 명시적 제외
