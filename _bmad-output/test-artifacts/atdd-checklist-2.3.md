---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: 2026-04-22T11:06:48+09:00
inputDocuments:
  - _bmad-output/implementation-artifacts/2-3-PriceSuggestionCard-기반-추천가-수용-수정-확정.md
  - _bmad/tea/config.yaml
  - playwright.config.ts
  - package.json
  - src/feature/listing/components/listing-form.client.tsx
  - src/shared/contracts/events/ai-extraction-reviewed.v1.ts
  - tests/e2e/extraction-field-editor-flow.spec.ts
  - tests/e2e/photo-uploader-flow.spec.ts
  - tests/support/factories/listing.factory.ts
  - _bmad/tea/agents/bmad-tea/resources/knowledge/data-factories.md
  - _bmad/tea/agents/bmad-tea/resources/knowledge/test-quality.md
  - _bmad/tea/agents/bmad-tea/resources/knowledge/selector-resilience.md
  - _bmad/tea/agents/bmad-tea/resources/knowledge/network-first.md
---

# ATDD Checklist: Story 2.3 PriceSuggestionCard 기반 추천가 수용/수정 확정

## TDD Red Phase

- 상태: 완료
- 생성 방식: AI generation, sequential fallback
- 감지 스택: fullstack
- 테스트 프레임워크: Playwright 1.59.1, Jest 30.3.0, TypeScript 6.0.3
- Red phase 원칙: 모든 테스트는 `test.skip()`으로 생성했다. 구현 후 `test.skip()`을 제거하면 현재 누락된 `PriceSuggestionCard`, pricing 계약, deterministic event helper 때문에 실패해야 한다.

## Acceptance Criteria Coverage

| AC | 시나리오 | 테스트 파일 | 우선순위 |
| --- | --- | --- | --- |
| AC1 | 추천가 수용 시 `priceKrw` 최종 확정 및 `accepted` 이벤트 준비 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts` | P0 |
| AC1 | 수동 수정 가격 확정 시 `priceKrw` 최종 확정 및 `edited` 이벤트 준비 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts` | P0 |
| AC2 | 최대값/단위/범위 검증 실패 시 확정과 이벤트 생성을 차단하고 복구 안내 표시 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts` | P0 |
| AC3 | `AUTH_REQUIRED` 오류에서 재인증 경로 제공, 입력 유지, 이벤트 미생성 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts` | P1 |
| AC4 | 동일 추천/확정 재시도에서 deterministic `eventId` 보장 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/pricing-suggestion-accepted-v1.spec.ts` | P0 |
| AC4 | canonical event fixture schema 고정 및 필수 필드 누락 거부 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/pricing-suggestion-accepted-v1.spec.ts` | P0/P1 |
| AC5 | 상품 핵심 정보 revision 변경 후 기존 추천가 수용 차단 | `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts` | P0 |

## Generated Files

- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/e2e/price-suggestion-card-flow.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/pricing-suggestion-accepted-v1.spec.ts`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/contracts/fixtures/pricing.suggestion.accepted.v1.json`
- `_bmad-output/test-artifacts/red-phase/story-2-3/tests/support/factories/pricing-confirmation.factory.ts`
- `_bmad-output/test-artifacts/atdd-checklist-2.3.md`

## Required Implementation Surface

- `src/feature/listing/components/price-suggestion-card.client.tsx`
- `src/feature/listing/components/listing-form.client.tsx`
- `src/shared/contracts/pricing-suggestion.ts`
- `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`
- `src/domain/pricing/pricing-suggestion.ts`
- Optional domain/listing price policy export if the client card needs shared max/step constants.

## Required Selectors And Accessible Names

- `data-testid="price-suggestion-card"`
- `data-testid="price-suggestion-amount"`
- `data-testid="price-suggestion-accept-button"`
- `data-testid="price-confirmed-event-id"`
- `data-testid="price-confirmation-mode"`
- `data-testid="price-suggestion-stale-alert"`
- Label `수동 가격 (원)`
- Label `수정 사유`
- Button `수동 가격 확정`
- Button `현재 정보 기준으로 다시 확인`
- Button `재인증 후 계속`

## Mock And Fixture Requirements

- Auth failure branch may be exposed through a test fixture, local test hook, or typed helper result that maps to `AUTH_REQUIRED`.
- Pricing recommendation can remain deterministic and local; no vendor API, crawler, queue, or database table is required.
- The factory `createPricingConfirmationScenario()` provides unique `clientRequestId`, `idempotencyKey`, `traceId`, and stable pricing values for red-to-green work.

## Red-Green-Refactor Handoff

1. Implement contracts and deterministic helper first.
2. Implement pricing basis revision and price policy helper.
3. Replace the standalone `TextField name="priceKrw"` with `PriceSuggestionCard` while preserving the submitted `FormData` key.
4. Add stale revision, validation, and auth recovery branches with accessible alerts/status regions.
5. Remove `test.skip()` from the generated red-phase tests.
6. Run targeted gates:
   - `pnpm exec playwright test _bmad-output/test-artifacts/red-phase/story-2-3/tests --project=chromium`
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm unit`
   - `pnpm contract`

## Validation

- Prerequisites satisfied: story has explicit ACs, `playwright.config.ts` exists, `package.json` has Playwright/Jest/TypeScript.
- Existing patterns reviewed: listing form, extraction review event contract, E2E selector style, fixture factory style.
- Knowledge applied: data factories, test quality, selector resilience, network-first.
- TDD compliance: generated executable scenarios use `test.skip()` and contain concrete expected assertions, not placeholders.
- CLI browser sessions: none opened, so no orphaned sessions.
- Temp artifacts: stored under `_bmad-output/test-artifacts/`, not random temp paths.
