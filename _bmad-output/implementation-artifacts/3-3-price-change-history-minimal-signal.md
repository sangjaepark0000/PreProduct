# Story 3.3: 가격 변경 이력 조회 및 최소 신호 수집

Status: ready-for-dev

## Story

As a 판매 사용자,
I want 가격 변경 이력을 확인하고 싶다,
so that 가격 결정 근거를 추적할 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Brownfield enhancement / pricing history
**FR Trace:** FR21, FR32

## Acceptance Criteria

1. **Given** 가격 변경 이력이 존재할 때
   **When** 사용자가 이력 화면을 조회하면
   **Then** 변경 전/후 값, 변경 시각, 변경 사유를 확인할 수 있다.

2. **Given** 자동 가격조정이 적용된 이후 후속 확장용 최소 신호를 적재할 때
   **When** 시스템이 신호 레코드를 생성하면
   **Then** 업데이트 시점과 가격변경 사유가 저장된다.

## Story Intent

- Story 3.2가 `pricing.auto_adjust.applied.v1`와 실행 결과를 source of truth로 고정했다.
- Story 3.3는 그 적용 결과를 다시 가공하지 말고, 같은 applied record에서 history row와 minimal signal을 파생해야 한다.
- history row와 minimal signal은 서로 다른 mutable price snapshot을 읽지 않아야 한다.

## Scope Boundaries

- 포함:
  - price change history view
  - applied before/after price display
  - applied time and reason display
  - minimal signal storage with `updatedAt` and `reasonCode`
- 제외:
  - scheduler execution
  - rule editing
  - event emission
  - ops/dashboard surfaces

## Current Workspace Reality

- Story 3.1 already owns rule setup and validation boundaries.
- Story 3.2 already owns execution, idempotency, and `pricing.auto_adjust.applied.v1` emission.
- Epic 3 test design marks the remaining Story 3.3 risks as history/signal divergence, so this story should stay tied to the applied adjustment record and not invent a second pricing source of truth.

## Recommended Implementation Shape

- `src/domain/pricing/price-change-history.ts`
- `src/domain/pricing/price-change-history.test.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts`
- `src/infra/pricing/price-change-history.repository.ts`
- `src/app/listings/[listingId]/price-change-history/page.tsx`
- `src/feature/pricing/components/price-change-history-list.client.tsx`

## Data Modeling Guidance

- Keep the persisted history row serializable and stable enough for later expansion.
- The minimum useful fields are `listingId`, `beforePriceKrw`, `afterPriceKrw`, `appliedAt`, and `reasonCode`.
- The minimal signal must remain smaller than the history row and should only retain the update timestamp and reason code required by FR32.
- Do not reintroduce mutable listing price state as the source of truth for history rendering.

## Testing Requirements

- Add one browser-level acceptance test for the populated history view.
- Add one contract-level test for the minimal signal schema and fixture.
- Keep the red-phase artifacts focused on the Story 3.3 acceptance behavior; do not duplicate Story 3.2 execution coverage.

## References

- `_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md`
- `_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md`
- `_bmad-output/test-artifacts/test-design-epic-3.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`