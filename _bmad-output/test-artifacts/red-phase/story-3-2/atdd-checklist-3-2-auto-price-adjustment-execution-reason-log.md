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
storyId: "3.2"
storyKey: "3-2-auto-price-adjustment-execution-reason-log"
storyTitle: "규칙 기반 자동 가격조정 실행 및 사유 기록"
storyFile: "_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md"
inputDocuments:
  - "_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/story-3-2/tests/domain/auto-adjust-execution.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/story-3-2/tests/contracts/pricing-auto-adjust-applied.v1.contract.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/story-3-2/tests/e2e/auto-adjust-execution-flow.spec.ts"
---

# ATDD Checklist: Story 3.2 규칙 기반 자동 가격조정 실행 및 사유 기록

## TDD Red Phase

- 상태: 완료
- 생성 방식: AI generation, sequential fallback
- 감지 스택: fullstack
- 테스트 프레임워크: Playwright 1.59.1, Jest 30.3.0, TypeScript 6.0.3
- Red phase 원칙: 모든 테스트는 `test.skip()` 기반으로 생성했다. 구현 후 skip을 제거하면 아직 없는 `auto-adjust-execution`, `pricing-auto-adjust-applied.v1`, scheduler route, and execution repository 때문에 실패해야 한다.

## Acceptance Criteria Coverage

| AC | 시나리오 | 테스트 파일 | 우선순위 |
| --- | --- | --- | --- |
| AC1 | 유효한 규칙이 due 상태일 때 가격조정이 1회 적용되고 변경 사유/적용 시점이 기록됨 | `_bmad-output/test-artifacts/red-phase/story-3-2/tests/domain/auto-adjust-execution.red.test.ts` | P0 |
| AC2 | floor 위반 또는 stale/superseded 규칙은 skip되고 평가 시점과 skip 사유가 기록됨 | `_bmad-output/test-artifacts/red-phase/story-3-2/tests/domain/auto-adjust-execution.red.test.ts` | P0 |
| AC3 | 동일 run key의 동시 재실행은 1회만 apply되고 나머지는 duplicate로 기록됨 | `_bmad-output/test-artifacts/red-phase/story-3-2/tests/e2e/auto-adjust-execution-flow.spec.ts` | P0 |
| AC4 | 부분 실패 후 같은 run key 재시도 시 price apply가 최대 1회로 수렴함 | `_bmad-output/test-artifacts/red-phase/story-3-2/tests/domain/auto-adjust-execution.red.test.ts` | P1 |
| AC5 | `pricing.auto_adjust.applied.v1` 이벤트가 required common envelope fields와 execution payload를 포함함 | `_bmad-output/test-artifacts/red-phase/story-3-2/tests/contracts/pricing-auto-adjust-applied.v1.contract.red.test.ts` | P0 |

## Generated Files

- `_bmad-output/test-artifacts/red-phase/story-3-2/tests/domain/auto-adjust-execution.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-2/tests/contracts/pricing-auto-adjust-applied.v1.contract.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-2/tests/e2e/auto-adjust-execution-flow.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-2/atdd-checklist-3-2-auto-price-adjustment-execution-reason-log.md`

## Required Implementation Hooks

- `src/domain/pricing/auto-adjust-execution.ts`
- `src/domain/pricing/auto-adjust-execution.test.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts`
- `src/infra/pricing/auto-adjust-execution.repository.ts`
- `src/app/api/pricing/auto-adjust/route.ts`
- `src/app/api/pricing/auto-adjust/route.test.ts`
- `tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts`
- `tests/e2e/auto-adjust-execution-flow.spec.ts`

## Required Machine-Readable Fields

- Scheduler-facing entrypoint: `POST /api/pricing/auto-adjust`
- Request fields: `listingId`, `runKey`, `traceId`, `requestedAt`, `ruleRevision`, `currentPriceKrw`
- Applied response fields: `status`, `reasonCode`, `beforePriceKrw`, `afterPriceKrw`, `appliedAt`, `evaluationAt`, `eventId`
- Skip response fields: `status`, `skipReason`, `evaluationAt`, `ruleRevision`, `runKey`
- Duplicate response fields: `status`, `duplicateOfRunKey`, `evaluationAt`, `runKey`

## Mock And Fixture Requirements

- Deterministic clock fixtures for due-time, retry, and boundary behavior.
- A seeded active rule snapshot plus a stale/superseded rule snapshot for skip coverage.
- A partial-failure execution record so the retry path can prove single-apply semantics.
- A canonical `pricing.auto_adjust.applied.v1` event payload with stable `eventId` derivation.
- A duplicate run-key fixture for concurrent scheduler replay.

## Red-Green-Refactor Handoff

1. Implement the domain execution evaluator first, including due-time, floor-violation, stale-rule, duplicate, and retry states.
2. Implement the event contract and deterministic event builder next.
3. Implement the scheduler-facing route and durable execution repository boundary.
4. Remove `test.skip()` from the generated red-phase tests during green phase.
5. Run focused checks:
   - `pnpm unit`
   - Playwright check for `_bmad-output/test-artifacts/red-phase/story-3-2/tests/e2e/auto-adjust-execution-flow.spec.ts`

## Validation

- Prerequisites satisfied: Story 3.2 ACs exist and Epic 3 test design calls out single-apply, skip, and contract risk.
- Existing patterns reviewed: Story 3.1 red-phase checklist, listing pricing contract tests, and the current Playwright/Jest fixtures.
- Knowledge applied: Epic 3 risks R-001, R-003, and R-004.
- TDD compliance: generated executable scenarios use `test.skip()` and contain concrete assertions rather than placeholders.
- CLI browser recording: not used; the route and contract still need implementation before the flow can run.

## Appendix

### Related Documents

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/test-artifacts/test-design-epic-3.md`
- `_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md`

