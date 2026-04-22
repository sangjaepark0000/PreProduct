# Story 3.3: 가격 변경 이력 조회 및 최소 신호 수집

Status: ready-for-dev

## Story

As a 판매 사용자,
I want 가격 변경 이력을 확인하고 최소 신호를 함께 누적하고 싶다,
so that 가격 결정 근거를 추적하고 후속 확장을 위한 신호를 남길 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Brownfield feature / read-model projection
**FR Trace:** FR21, FR32

## Acceptance Criteria

1. **Given** 하나 이상의 적용 완료된 자동 가격조정 실행이 특정 listing에 존재할 때  
   **When** 판매 사용자가 가격 변경 이력 화면을 열면  
   **Then** 최신 항목이 먼저 보이는 목록에 변경 전 가격, 변경 후 가격, 적용 시각, 변경 사유가 표시된다  
   **And** 적용 이력이 없으면 빈 상태가 명확하게 표시된다.

2. **Given** 적용 완료된 가격조정이 저장되어 있을 때  
   **When** 시스템이 최소 신호 projection을 생성하면  
   **Then** 동일한 applied execution source에서 정확히 1개의 signal record가 기록된다  
   **And** FR32에 필요한 최소 payload인 update time과 reason code가 포함된다.

3. **Given** skipped, duplicate, partial-failure 실행 기록이 함께 존재할 때  
   **When** history와 minimal signal projection이 생성되면  
   **Then** history list와 signal record에는 applied execution만 반영된다  
   **And** 반복 조회나 재렌더링으로 history row 또는 signal row가 중복 생성되지 않는다.

## Tasks / Subtasks

- [ ] 가격 변경 이력 projection과 조회 모델을 추가한다. (AC: 1, 3)
  - [ ] `src/domain/pricing/auto-adjust-history.ts`를 생성해 `AutoAdjustExecution` applied row를 display row와 minimal-signal payload로 변환한다.
  - [ ] `src/infra/pricing/auto-adjust-execution.repository.ts`와 `prisma/schema.prisma`의 execution record를 canonical source of truth로 재사용하고, UI나 scheduler route에서 history를 파생하지 않는다.
  - [ ] newest-first 정렬, skip/duplicate/partial-failure 제외, 안정적인 필드 매핑을 단위 테스트로 고정한다.

- [ ] 판매자용 history 화면과 진입점을 추가한다. (AC: 1)
  - [ ] `src/app/listings/[listingId]/price-change-history/page.tsx`를 생성해 listing을 로드하고 history projection을 렌더링한다.
  - [ ] `src/app/listings/[listingId]/page.tsx`에 기존 auto-adjust rule summary 옆의 별도 CTA를 추가하되, rule 설정 UI와 history UI를 섞지 않는다.
  - [ ] 불필요한 client state는 만들지 말고, 실제 상호작용이 필요할 때만 `.client.tsx` 컴포넌트를 사용한다.

- [ ] 최소 신호 persistence surface를 추가한다. (AC: 2, 3)
  - [ ] FR32용 compact read model이 필요하면 `src/infra/pricing/auto-adjust-signal.repository.ts` 또는 동등한 projection repository를 추가한다.
  - [ ] signal row는 applied execution에서만 파생되도록 하고, one applied execution -> one signal row 규칙을 유지한다.
  - [ ] history와 signal이 같은 서비스/transaction boundary 안에서 기록되도록 해서 두 projection이 분리되지 않게 한다.

- [ ] 회귀 테스트를 추가한다. (AC: 1, 2, 3)
  - [ ] `src/domain/pricing/auto-adjust-history.test.ts`에 mapping, ordering, exclusion 규칙을 추가한다.
  - [ ] repository/API 테스트로 minimal signal persistence와 empty-history behavior를 검증한다.
  - [ ] `tests/e2e/price-change-history-flow.spec.ts`를 추가해 listing detail에서 history page 진입, populated history rows, empty state를 검증한다.
  - [ ] 접근성 검증은 heading order, navigation label, history row semantics 중심으로 확인한다.

## Dev Notes

### Story Intent

- Story 3.3는 Epic 3의 read-side를 닫는 스토리다. Story 3.2가 `pricing.auto_adjust.applied.v1`와 durable execution record를 소유하고, 이 스토리는 그 applied record를 소비해 history/minimal signal을 노출한다.
- 새로운 가격조정 실행 경로, scheduler logic, event producer를 만들지 않는다. 이 스토리는 read-model + projection만 책임진다.
- 사용자가 보게 되는 entry point는 listing detail이고, history는 별도 subpage로 제공한다. Story 3.1의 rule page와 혼합하지 않는다.

### Scope Boundaries

- 포함:
  - applied price change history list
  - empty state
  - FR32 minimal signal projection
  - listing-detail CTA / navigation
- 제외:
  - rule editing
  - scheduler execution
  - `pricing.auto_adjust.applied.v1` contract 변경
  - ops dashboard / Go-Hold-Stop / KPI 화면
  - buyer flow

### Current Workspace Reality

- `prisma/schema.prisma` already defines `AutoAdjustExecution` with `beforePriceKrw`, `afterPriceKrw`, `reasonCode`, `skipReason`, `appliedAt`, `eventId`, and `duplicateCount`. Treat this as the canonical source for price-change history.
- `src/infra/pricing/auto-adjust-execution.repository.ts` already persists applied/skip/duplicate outcomes in one transaction. History and minimal signal should be derived from those applied rows, not from a second write path in the UI.
- `src/app/listings/[listingId]/page.tsx` already renders the current auto-adjust rule summary and links to `/auto-adjust-rule`. Add the history CTA nearby without collapsing the existing split.
- `src/app/listings/[listingId]/auto-adjust-rule/page.tsx` is the precedent for a dedicated listing-scoped subpage and is the style reference for the new history page.
- `_bmad-output/test-artifacts/test-design-epic-3.md` marks R-005 as a high-priority risk and explicitly scopes history/minimal-signal consistency to Story 3.3.
- `_bmad-output/implementation-artifacts/dependency-graph.md` marks Story 3.3 as the next ready backlog story after Story 3.2.
- There is no repo-root `_bmad-output/project-context.md`; use the architecture, PRD, epics, UX, test-design docs, and current codebase as the source set.

### Recommended Implementation Shape

- `src/domain/pricing/auto-adjust-history.ts`
- `src/domain/pricing/auto-adjust-history.test.ts`
- `src/infra/pricing/auto-adjust-signal.repository.ts`
- `src/infra/pricing/auto-adjust-signal.repository.test.ts`
- `src/app/listings/[listingId]/price-change-history/page.tsx`
- `src/app/listings/[listingId]/page.tsx`
- optional presentational component only if needed: `src/feature/listing/components/price-change-history-list.tsx` or `.client.tsx`

### Data Modeling Guidance

- Applied execution records remain the single source of truth.
- History rows should include `beforePriceKrw`, `afterPriceKrw`, `appliedAt`, and `reasonCode`, newest first.
- Minimal signal should stay compact and append-only. Keep it derived from the same applied execution record and avoid UI-only fields.
- Exclude skipped, duplicate, and partial-failure records from both history and signal projections.
- If a new projection table is added, enforce one signal row per applied execution to prevent drift.

### UX and Accessibility Guardrails

- The history page should read like a dense seller audit view, not a dashboard.
- Keep the layout mobile-first and scannable; use text and icons together where status or empty state needs emphasis.
- Do not rely on color alone to distinguish empty, applied, or missing states.
- Preserve 44x44 touch targets for any navigation buttons and keep keyboard focus order predictable.
- Empty state copy must say what happened and how to return to the listing detail page.
- If a list or table is used, ensure headers and row labels are semantically clear to assistive tech.

### Architecture Compliance

- Follow `feature -> domain -> infra` only. Page and component code must not query Prisma directly.
- Keep minimal signal derivation on the server side, from the applied execution record, not from the UI.
- Do not change `pricing.auto_adjust.applied.v1`, scheduler execution semantics, or rule persistence in this story.
- If a projection write is added, keep it in the same service/repository boundary that reads the applied execution record so history and signal stay in lockstep.
- Avoid introducing a second history source or ad hoc audit log.

### Previous Story Intelligence

- Story 3.1 established the separate rule page and the listing-detail summary pattern; keep this story equally separated instead of mixing concerns into the rule screen.
- Story 3.2 established the durable `AutoAdjustExecution` record, the `reasonCode`/`skipReason` split, and the single applied source of truth that this story should reuse.
- Story 3.2 explicitly left history/minimal-signal out of scope. Use the same execution record and event envelope conventions, but do not alter execution flow.
- The execution repository already tracks `duplicateCount` and partial-failure recovery, so the history projection should filter on applied executions rather than all rows.

### Testing Requirements

- Unit test projection mapping, newest-first ordering, and exclusion of skip/duplicate/partial-failure rows.
- Verify the minimal signal record contains the required FR32 payload and does not drift from the applied execution data.
- E2E should cover listing-detail navigation into the history page, populated history rows, and the empty state.
- Add accessibility checks for heading order, navigation labels, and history row semantics.
- Keep the implementation deterministic by reusing fixtures from `AutoAdjustExecution` and `AutoAdjustRule` tests where possible.

### Specific Risks To Avoid

- Creating a second source of truth for price change history.
- Showing execution attempts that never changed price as if they were history.
- Writing minimal signal data from the page layer or from transient UI state.
- Breaking the existing listing detail rule summary or the separate auto-adjust rule page.
- Overbuilding a client-heavy history UI when a server-rendered read model is enough.

### Latest Technical Notes

- Repo-pinned stack remains Next.js `16.2.4`, React `19.2.5`, MUI `9.0.0`, Prisma `7.7.0`, Zod `4.3.6`, pnpm `10.28.2`.
- The current App Router pattern in this repo favors server pages with narrow client components only when interaction is necessary.
- Use the existing currency formatting and MUI layout patterns from `src/app/listings/[listingId]/page.tsx` and `src/app/listings/[listingId]/auto-adjust-rule/page.tsx`.
- For read-only history, prefer the simplest component shape that satisfies accessibility and mobile layout.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 3, Story 3.3, FR21, FR32
- `_bmad-output/planning-artifacts/prd.md` - Pricing & Update Operations and Policy, Trust & Scope Control sections
- `_bmad-output/planning-artifacts/architecture.md` - Event contract common rules, FR25 RACI, MVP data/domain delta
- `_bmad-output/planning-artifacts/ux-design-specification.md` - MVP primary screens and component priority around `AutoAdjustRulePage` / `AutoAdjustRuleSelector`
- `_bmad-output/test-artifacts/test-design-epic-3.md` - R-005, R-009, P0/P1 history and signal coverage
- `_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md` - Story 3.2 scope boundary and execution record source of truth
- `_bmad-output/implementation-artifacts/dependency-graph.md` - Story 3.3 next-ready status and 3.2 dependency
- `prisma/schema.prisma` - `AutoAdjustExecution` model and unique listing/run-key guard
- `src/infra/pricing/auto-adjust-execution.repository.ts` - applied execution persistence pattern and outcome fields
- `src/app/listings/[listingId]/page.tsx` - current listing detail entry point and auto-adjust summary
- `src/app/listings/[listingId]/auto-adjust-rule/page.tsx` - separate listing-scoped subpage pattern
- `src/domain/pricing/auto-adjust-rule.ts` - pricing domain naming and validation conventions
- `src/domain/pricing/auto-adjust-execution.ts` - execution outcome model and reason/skip split

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

### Completion Notes List

### File List
