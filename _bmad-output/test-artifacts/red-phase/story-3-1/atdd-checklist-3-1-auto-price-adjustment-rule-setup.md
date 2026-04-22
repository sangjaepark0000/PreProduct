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
storyId: "3.1"
storyKey: "3-1-auto-price-adjustment-rule-setup"
storyTitle: "자동 가격조정 규칙 설정"
storyFile: "_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md"
inputDocuments:
  - "_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md"
  - "_bmad-output/test-artifacts/test-design-epic-3.md"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/story-3-1/tests/domain/auto-adjust-rule.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts"
---

# ATDD Checklist: Story 3.1 자동 가격조정 규칙 설정

## TDD Red Phase

- 상태: 완료
- 생성 방식: AI generation, sequential fallback
- 감지 스택: fullstack
- 테스트 프레임워크: Playwright 1.59.1, Jest 30.3.0, TypeScript 6.0.3
- Red phase 원칙: 모든 테스트는 `test.skip()` 기반으로 생성했다. 구현 후 skip을 제거하면 현재 없는 `auto-adjust-rule` 도메인/페이지/서버 액션 때문에 실패해야 한다.

## Acceptance Criteria Coverage

| AC | 시나리오 | 테스트 파일 | 우선순위 |
| --- | --- | --- | --- |
| AC1 | 유효한 주기/인하율/최저가 하한 저장 시 규칙이 활성 규칙으로 반영됨 | `_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts` | P0 |
| AC2 | 유효하지 않은 규칙 제출 시 필드 오류와 복구 안내를 표시하고 마지막 유효 상태를 유지함 | `_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts` | P0 |
| AC2 | 규칙 도메인 검증이 invalid period/discount/floor 조합을 거부함 | `_bmad-output/test-artifacts/red-phase/story-3-1/tests/domain/auto-adjust-rule.red.test.ts` | P0 |
| AC3 | 재진입 시 현재 활성 규칙이 미리 채워지고 키보드 접근성이 유지됨 | `_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts` | P1 |

## Generated Files

- `_bmad-output/test-artifacts/red-phase/story-3-1/tests/domain/auto-adjust-rule.red.test.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-3-1/atdd-checklist-3-1-auto-price-adjustment-rule-setup.md`

## Required Implementation Hooks

- `src/domain/pricing/auto-adjust-rule.ts`
- `src/domain/pricing/auto-adjust-rule.test.ts`
- `src/feature/listing/actions/save-auto-adjust-rule.action.ts`
- `src/feature/listing/components/auto-adjust-rule-selector.client.tsx`
- `src/app/listings/[listingId]/auto-adjust-rule/page.tsx`
- `src/app/listings/[listingId]/page.tsx` for the entry link and summary surface only

## Required Selectors And Accessible Names

- `data-testid="auto-adjust-rule-form"`
- `data-testid="auto-adjust-rule-active-summary"`
- `data-testid="auto-adjust-rule-save-status"`
- Label `주기(일)`
- Label `인하율(%)`
- Label `최저가 하한 (원)`
- Button `규칙 저장`
- Status region `role="status"` for polite success/reopen feedback
- Alert region `role="alert"` for recoverable validation errors

## Mock And Fixture Requirements

- Rule values can remain deterministic and local; no scheduler, queue, or event pipeline is required for Story 3.1.
- The save action should preserve the last valid rule in form state when validation fails.
- Revisit/prefill can be asserted through the route page itself without DB-backed history.

## Red-Green-Refactor Handoff

1. Implement the domain rule contract and validation helper first.
2. Implement the save-rule server action and persistence boundary.
3. Implement the rule settings page and client selector with accessible labels and summary text.
4. Remove `test.skip()` from the generated red-phase tests during green phase.
5. Run focused checks:
   - `pnpm unit`
   - Playwright check for `_bmad-output/test-artifacts/red-phase/story-3-1/tests/e2e/auto-adjust-rule-flow.spec.ts`

## Validation

- Prerequisites satisfied: story has explicit ACs, `playwright.config.ts` exists, `package.json` has Playwright/Jest/TypeScript.
- Existing patterns reviewed: listing form/action state handling, prior ATDD checklist structure, selector resilience, and the Epic 3 test design.
- Knowledge applied: Epic 3 risk R-002, invalid config recovery, and last-valid-state preservation.
- TDD compliance: generated executable scenarios use `test.skip()` and contain concrete assertions rather than placeholders.
- CLI browser recording: not used; target component and selectors do not exist yet, so selector verification is documented as implementation requirements.
- Temp artifacts: stored under `_bmad-output/test-artifacts/red-phase/story-3-1/`, not random temp paths.
