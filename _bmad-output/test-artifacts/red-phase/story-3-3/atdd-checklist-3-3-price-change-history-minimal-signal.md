---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: "2026-04-22"
workflowType: testarch-atdd
storyId: "3.3"
storyKey: "3-3-price-change-history-minimal-signal"
storyTitle: "가격 변경 이력 조회 및 최소 신호 수집"
storyFile: "_bmad-output/implementation-artifacts/3-3-price-change-history-minimal-signal.md"
inputDocuments:
  - "_bmad-output/implementation-artifacts/3-3-price-change-history-minimal-signal.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/story-3-3/tests/e2e/price-change-history-flow.spec.ts"
  - "_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/fixtures/pricing.auto-adjust.minimal-signal.v1.json"
---

# ATDD Checklist: Story 3.3 가격 변경 이력 조회 및 최소 신호 수집

## TDD Red Phase

- 상태: 완료
- 생성 방식: focused manual ATDD
- 감지 스택: fullstack
- 테스트 프레임워크: Playwright + Jest + TypeScript
- Red phase 원칙: 모든 테스트는 `test.skip()` 기반으로 작성했다. 구현 후 skip을 제거하면 아직 없는 history page와 minimal signal contract 때문에 실패해야 한다.

## Acceptance Criteria Coverage

| AC | 시나리오 | 테스트 파일 | 우선순위 |
| --- | --- | --- | --- |
| AC1 | 가격 변경 이력이 존재할 때 이력 화면에서 변경 전/후 값, 변경 시각, 변경 사유를 확인할 수 있다 | `_bmad-output/test-artifacts/red-phase/story-3-3/tests/e2e/price-change-history-flow.spec.ts` | P0 |
| AC2 | 최소 신호 레코드가 업데이트 시점과 가격변경 사유만 보존하고 extra mutable fields를 허용하지 않는다 | `_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.red.test.ts` | P0 |

## Generated Files

- `_bmad-output/test-artifacts/red-phase/story-3-3/tests/e2e/price-change-history-flow.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/fixtures/pricing.auto-adjust.minimal-signal.v1.json`
- `_bmad-output/test-artifacts/red-phase/story-3-3/atdd-checklist-3-3-price-change-history-minimal-signal.md`

## Required Implementation Hooks

- `src/domain/pricing/price-change-history.ts`
- `src/domain/pricing/price-change-history.test.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.ts`
- `src/shared/contracts/signals/pricing-auto-adjust-minimal-signal.v1.test.ts`
- `src/infra/pricing/price-change-history.repository.ts`
- `src/app/listings/[listingId]/price-change-history/page.tsx`
- `src/feature/pricing/components/price-change-history-list.client.tsx`

## Required Selectors And Accessible Names

- `data-testid="price-change-history-page"`
- `data-testid="price-change-history-row"`
- `data-testid="price-change-history-before-price"`
- `data-testid="price-change-history-after-price"`
- `data-testid="price-change-history-applied-at"`
- `data-testid="price-change-history-reason"`
- `data-testid="price-change-history-empty-state"`
- Heading text `가격 변경 이력`

## Mock And Fixture Requirements

- Reuse the Story 3.2 applied adjustment record shape as the source of truth for the visible history row.
- The minimal signal fixture should contain only `listingId`, `updatedAt`, and `reasonCode`.
- Extra price fields such as `beforePriceKrw` or `afterPriceKrw` must be rejected by the minimal signal schema.

## Red-Green-Refactor Handoff

1. Implement the history projection and minimal signal contract first.
2. Add the history page and client list only after the domain/contract boundary exists.
3. Remove `test.skip()` from the generated red-phase tests during green phase.
4. Run focused checks:
   - the history page spec under `_bmad-output/test-artifacts/red-phase/story-3-3/tests/e2e/price-change-history-flow.spec.ts`
   - the minimal signal contract test under `_bmad-output/test-artifacts/red-phase/story-3-3/tests/contracts/pricing-auto-adjust-minimal-signal.v1.contract.red.test.ts`

## Validation

- Prerequisites satisfied: Story 3.3 is the next ready backlog story in sprint tracking, Epic 3 test design covers history/signal risk R-005, and Story 3.2 already provides the applied adjustment source of truth.
- Existing patterns reviewed: Story 3.1 and 3.2 ATDD checklists, contract test structure, and current pricing event contract conventions.
- Knowledge applied: FR21 and FR32, plus the Epic 3 requirement that history and minimal signal stay aligned with the applied adjustment record.
- TDD compliance: generated executable scenarios use `test.skip()` and concrete assertions rather than placeholders.
- Temp artifacts: stored under `_bmad-output/test-artifacts/red-phase/story-3-3/`.
