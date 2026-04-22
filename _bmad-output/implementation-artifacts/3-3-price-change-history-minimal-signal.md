# Story 3.3: 가격 변경 이력 조회 및 최소 신호 수집

Status: done

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

## Tasks / Subtasks

- [x] 가격 변경 이력 projection과 최소 신호 계약을 추가한다. (AC: 1, 2)
  - [x] Story 3.2 applied execution record에서 history row를 생성하는 도메인 helper를 추가한다.
  - [x] `pricing.auto_adjust` minimal signal v1 schema와 builder를 추가하고 extra mutable price fields를 거부한다.
  - [x] history row와 minimal signal이 같은 applied timestamp/reason source를 사용하도록 고정한다.

- [x] 가격 변경 이력 read path와 UI를 추가한다. (AC: 1)
  - [x] `AutoAdjustExecution` applied record를 조회하는 repository를 추가한다.
  - [x] `/listings/[listingId]/price-change-history` page와 history list UI를 추가한다.
  - [x] listing detail에서 가격 변경 이력 화면으로 이동할 수 있는 링크를 추가한다.

- [x] red-phase ATDD 의도를 runnable 테스트로 전환한다. (AC: 1, 2)
  - [x] minimal signal contract fixture/test를 `tests/contracts`에 추가하고 `pnpm contract`에 포함한다.
  - [x] populated history view Playwright acceptance test를 추가한다.
  - [x] domain/repository focused Jest tests를 추가한다.

- [x] focused validation을 실행하고 Story 3.1/3.2 pricing 회귀를 확인한다.
  - [x] Story 3.3 focused unit/contract tests를 실행한다.
  - [x] Story 3.1/3.2 adjacent pricing tests를 실행한다.
  - [x] `typecheck`, `lint`, `contract`, focused Playwright E2E를 실행한다.

## References

- `_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md`
- `_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md`
- `_bmad-output/test-artifacts/test-design-epic-3.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`

## Dev Agent Record

### Implementation Plan

- Story 3.2의 `AutoAdjustExecution` applied record를 history/signal의 단일 source of truth로 사용했다.
- 새 persistence table은 만들지 않고, repository projection에서 history row와 minimal signal을 같은 record에서 파생했다.
- UI는 read-only history page와 listing detail navigation만 추가해 scheduler/rule/event 책임을 건드리지 않았다.

### Debug Log

- `pnpm install` 실행 시 Node engine warning 발생: repo는 `>=24.14.1 <25`, 현재 shell은 `v22.18.0`. 테스트 실행은 계속 가능했다.
- `pnpm exec prisma generate`는 `DATABASE_URL`이 없어 1회 실패했고, 로컬 기본 URL(`postgresql://postgres:postgres@127.0.0.1:5432/preproduct?schema=public`)로 재실행해 성공했다.
- focused Playwright E2E는 최초 실행에서 로컬 DB에 `AutoAdjustExecution` table이 없어 실패했고, checked-in Prisma schema를 `prisma db push`로 로컬 test DB에 동기화한 뒤 재실행해 통과했다.

### Completion Notes

- 가격 변경 이력 page에서 변경 전/후 가격, 적용 시각, reason code를 표시한다.
- minimal signal v1은 `listingId`, `updatedAt`, `reasonCode`만 허용하고 mutable price snapshot field를 거부한다.
- history row와 minimal signal은 모두 Story 3.2 applied execution record에서 파생된다.

### Checks

- `pnpm exec jest --config jest.config.mjs --runTestsByPath src/domain/pricing/price-change-history.test.ts src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts src/infra/pricing/price-change-history.repository.test.ts tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.test.ts` - passed, 4 suites / 10 tests.
- `pnpm exec jest --config jest.config.mjs --runTestsByPath src/domain/pricing/auto-adjust-rule.test.ts src/infra/pricing/auto-adjust-rule.repository.test.ts src/feature/listing/actions/save-auto-adjust-rule.action.test.ts src/domain/pricing/auto-adjust-execution.test.ts src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts src/infra/pricing/auto-adjust-execution.repository.test.ts src/app/api/pricing/auto-adjust/route.test.ts tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts` - passed, 8 suites / 41 tests.
- `pnpm contract` - passed, 6 suites / 20 tests.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `$env:PLAYWRIGHT_WEB_SERVER_COMMAND='pnpm dev'; pnpm exec playwright test tests/e2e/price-change-history-flow.spec.ts --project=chromium` - passed, 1 passed / 1 skipped red-phase artifact.

### File List

- `_bmad-output/implementation-artifacts/3-3-price-change-history-minimal-signal.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `package.json`
- `src/app/listings/[listingId]/page.tsx`
- `src/app/listings/[listingId]/price-change-history/page.tsx`
- `src/domain/pricing/price-change-history.test.ts`
- `src/domain/pricing/price-change-history.ts`
- `src/feature/pricing/components/price-change-history-list.client.tsx`
- `src/infra/pricing/price-change-history.repository.test.ts`
- `src/infra/pricing/price-change-history.repository.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.ts`
- `tests/contracts/fixtures/pricing.auto-adjust.minimal-signal.v1.json`
- `tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.test.ts`
- `tests/e2e/price-change-history-flow.spec.ts`

### Change Log

- 2026-04-22: Implemented Story 3.3 price change history read path, minimal signal contract/projection, focused tests, and browser acceptance coverage.
