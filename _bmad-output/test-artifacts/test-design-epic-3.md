---
stepsCompleted:
  - "step-01-detect-mode"
  - "step-02-load-context"
  - "step-03-risk-and-testability"
  - "step-04-coverage-plan"
  - "step-05-generate-output"
lastStep: "step-05-generate-output"
lastSaved: "2026-04-22"
inputDocuments:
  - "_bmad/tea/config.yaml"
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/implementation-artifacts/2-3-PriceSuggestionCard-기반-추천가-수용-수정-확정.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/risk-governance.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/probability-impact.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-levels-framework.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-priorities-matrix.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/playwright-cli.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/overview.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/api-request.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/selector-resilience.md"
---

# Test Design: Epic 3 - 자동 가격조정 및 업데이트 신호

**Date:** 2026-04-22  
**Author:** 상재  
**Status:** Draft  
**Mode:** Epic-level test design  
**Detected stack:** Fullstack Next.js App Router, React, Jest, Playwright

## Executive Summary

**Scope:** Epic 3 전체, `FR18-FR21` 및 `FR32`, with explicit responsibility for emitting `pricing.auto_adjust.applied.v1` and preserving the minimal signal payload for later expansion.

Epic 3의 품질 목표는 규칙 저장과 자동 가격조정 실행이 단순히 동작하는 수준을 넘어서, 동일 리스팅에 대한 중복 실행, 하한 위반, stale rule, 재시도, clock skew 상황에서도 가격이 정확히 한 번만 반영되고 변경 사유/이력이 사용자와 후속 시스템 양쪽에서 일치함을 증명하는 것이다. Epic 4는 관측/무결성/경보를 소유하므로, Epic 3 테스트는 producer 책임과 데이터 일관성에 집중한다.

**Risk Summary:**

- Total risks identified: 9
- High-priority risks (score >= 6): 5
- Critical categories: TECH, DATA, BUS, OPS

**Coverage Summary:**

- P0 tests: 7 planned tests, ~12-22 hours
- P1 tests: 10 planned tests, ~10-18 hours
- P2/P3 tests and activities: 8 planned tests/activities, ~8-16 hours
- **Total effort:** ~30-56 hours, 약 1-2 weeks

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| 추천가 수용/수동 확정 플로우 | Epic 2의 책임이다. | Epic 3는 자동 가격조정 입력과 이후 history/signal만 검증한다. |
| KPI/가드레일 운영 화면 | Epic 4 범위다. | Epic 3는 이벤트 발생 책임과 최소 신호 보존까지만 다룬다. |
| Go/Hold/Stop 판정 로직 | Epic 4 운영 정책이다. | Epic 3는 decision state를 생성하지 않는다. |
| 파트너/API 확장 연동 | Deferred-P1.5+다. | MVP pricing adjustment and history path only. |

## Risk Assessment

### High-Priority Risks (Score >= 6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | TECH | 동일 run key 또는 동시 스케줄 실행이 같은 리스팅을 중복 조정한다. | 3 | 3 | 9 | run key/idempotency contract tests and concurrent execution E2E to guarantee single-apply semantics | Dev + QA | Story 3.2 |
| R-002 | DATA | 규칙 입력 검증이 느슨해져 주기/인하율/최저가 하한이 unsafe configuration으로 저장된다. | 3 | 3 | 9 | strict rule validator unit/API tests plus accessibility-safe form validation feedback | Dev | Story 3.1 |
| R-003 | BUS | 하한 위반, stale rule, 또는 부분 실패 재시도 시에도 가격이 변경되어 잘못된 판매 상태가 남는다. | 3 | 2 | 8 | floor-violation skip tests and transaction/state-machine rollback coverage | Dev + QA | Story 3.2 |
| R-004 | TECH | `pricing.auto_adjust.applied.v1` 이벤트가 필수 공통 필드 없이 발행되거나 duplicate eventId를 가진다. | 2 | 3 | 6 | contract tests and producer helper assertions for `eventId`, `occurredAt`, `traceId`, `schemaVersion` | Dev | Story 3.2 |
| R-005 | DATA | 변경 이력과 minimal signal payload가 실제 적용 결과와 어긋나 후속 확장 신호가 신뢰할 수 없게 된다. | 2 | 3 | 6 | history/detail tests tied to applied adjustment record and signal payload snapshot checks | Dev + QA | Story 3.3 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-006 | TECH | pricing API/UI contract drifts from the rule and history schema. | 2 | 2 | 4 | schema-first component/API tests with shared fixtures | Dev |
| R-007 | SEC | another seller's rule or history is visible through missing ownership checks. | 2 | 2 | 4 | ownership and auth checks on config/history routes | Dev + QA |
| R-008 | OPS | clock skew, timezone conversion, or scheduler delay fires on the wrong due date. | 2 | 2 | 4 | injected clock tests and due-time boundary coverage | Dev |
| R-009 | A11Y | rule form and history views are not keyboard-safe or do not surface validation/recovery clearly. | 2 | 2 | 4 | role/label/focus assertions on form and history surfaces | QA + Dev |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| --- | --- | --- | --- | --- | --- | --- |
| R-010 | PERF | batch adjustment smoke degrades page responsiveness on larger listing sets. | 1 | 2 | 2 | keep one nightly perf smoke and cap PR scope |

### Risk Category Legend

- **TECH:** contracts, state-machine, idempotency, integration
- **DATA:** overwrite, stale config, audit/history mismatch
- **BUS:** wrong price, broken seller trust, incorrect adjustment
- **OPS:** scheduler timing, retry, runtime drift
- **SEC:** ownership and access control
- **A11Y:** keyboard, validation, focus, assistive-tech visibility
- **PERF:** batch latency or UI regression

## Entry Criteria

- [ ] Epic 3 story scope is agreed against current `_bmad-output/planning-artifacts/epics.md`.
- [ ] Pricing domain baseline exists in `src/domain/pricing` and shared pricing contract/event files.
- [ ] Scheduler or time-trigger abstraction is injectable for due-time and retry tests.
- [ ] History view and minimal signal persistence surfaces are defined or stubbed for test harnessing.
- [ ] Test selectors or `data-testid` hooks exist for rule form, applied/skip status, and history rows.

## Exit Criteria

- [ ] All P0 tests pass at 100%.
- [ ] P1 pass rate is >= 95% with explicit waiver for any non-blocking failure.
- [ ] No duplicate price adjustment can be produced for the same run key.
- [ ] Every applied adjustment emits exactly one `pricing.auto_adjust.applied.v1` event with required fields.
- [ ] History and minimal signal records match the applied price change and reason code.
- [ ] No P0/P1 coverage gap remains for `FR18-FR21` and `FR32`.

## Test Coverage Plan

P0/P1/P2/P3 are priority and risk levels, not execution timing. Execution timing is defined separately in the Execution Strategy section.

### P0 Critical

**Criteria:** Blocks auto-adjust correctness, auditability, or seller trust; no acceptable workaround.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1-UNIT-001 | Rule validator rejects invalid period, discount, and floor combinations | Unit | R-002 | 5 | Dev | Covers min/max/boundary cases |
| 3.1-E2E-001 | Seller can save a valid auto-adjust rule and see it marked active | E2E | R-002 | 1 | QA | Confirms persisted rule is eligible for later execution |
| 3.2-API-001 | Due rule applies exactly once and emits one applied event with reason and timestamp | API | R-001, R-004 | 2 | Dev | Includes retry and concurrent run-key variants |
| 3.2-API-002 | Floor-violation and stale-rule evaluation skips the adjustment and records skip reason | API | R-003 | 2 | Dev | Verifies no price mutation on skip |
| 3.2-E2E-001 | Concurrent scheduler execution does not double-apply the same listing adjustment | E2E | R-001 | 1 | QA | Primary idempotency proof |
| 3.3-E2E-001 | History view shows before/after price, applied time, and reason | E2E | R-005 | 1 | QA | Confirms seller-facing traceability |
| 3.3-API-001 | Applied adjustment produces minimal signal with updateAt and reason code | API | R-005 | 1 | Dev | Producer-only check for Epic 3 |

**Total P0:** 7 tests, ~12-22 hours

### P1 High

**Criteria:** Core workflow, contract stability, common recovery paths.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1-COMP-001 | Rule form shows validation states, helper text, and keyboard-safe focus order | Component | R-002, R-009 | 2 | Dev + QA | Accessibility and form feedback together |
| 3.1-API-002 | Invalid payload schema is rejected with stable error code and recovery guide | API | R-002, R-006 | 2 | Dev | Contract-first rule save guard |
| 3.2-UNIT-001 | Due-time evaluator handles clock boundaries, timezone offsets, and skip cases | Unit | R-008 | 4 | Dev | Cheap deterministic timing coverage |
| 3.2-COMP-001 | Applied/skip state renders clear reason and timestamp in compact status UI | Component | R-003, R-009 | 2 | Dev | User-visible audit cue |
| 3.2-API-003 | Event schema rejects missing `eventId`, `occurredAt`, `traceId`, or `schemaVersion` | API | R-004 | 2 | Dev | Shared contract drift guard |
| 3.3-COMP-001 | History list supports empty, populated, and repeated-reason states | Component | R-005, R-006 | 2 | Dev | Avoids full E2E duplication |
| 3.3-API-002 | Minimal signal record persists update time and reason without extra mutable fields | API | R-005 | 1 | Dev | Regression guard for future expansion |

**Total P1:** 15 tests, ~10-18 hours

### P2 Medium

**Criteria:** Secondary flows, resilience, and lower-risk edge cases.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.2-E2E-002 | Scheduled batch across multiple listings maintains deterministic order and partial-failure isolation | E2E | R-001, R-008 | 1 | QA | Multi-listing smoke |
| 3.2-UNIT-002 | Retry-after-failure returns same result for the same run key without duplicate application | Unit | R-001 | 2 | Dev | Local race guard |
| 3.3-UNIT-001 | Signal assembler derives minimal payload from the applied adjustment record only | Unit | R-005 | 2 | Dev | Keeps producer logic thin |
| 3.3-E2E-002 | History view and stored signal remain aligned after several consecutive adjustments | E2E | R-005 | 1 | QA | Longitudinal consistency check |
| 3.1-COMP-002 | Rule edit flow preserves previous valid state when validation fails | Component | R-002, R-009 | 1 | Dev | Recovery UX |
| 3.2-API-004 | Adjustment skip reason remains stable for floor-violation, stale rule, and duplicate-run branches | API | R-003, R-004 | 1 | Dev | Avoids reason-code drift |

**Total P2:** 8 tests, ~6-12 hours

### P3 Low

**Criteria:** Exploratory, visualization, and operational confidence checks.

| Test ID | Requirement | Test Level | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 3.X-EXP-001 | Exploratory mobile pass for 320px, 390px, and 767px rule/history layouts | Manual/Visual | 1 session | QA | Capture only anomalies |
| 3.X-PERF-001 | Batch auto-adjust smoke under scheduler load and larger listing counts | E2E/Perf smoke | 1 | QA | Run outside PR if timing is unstable |

**Total P3:** 2 activities, ~2-4 hours

## Execution Strategy

Use the simple PR, Nightly, Weekly model.

| Cadence | Scope | Target |
| --- | --- | --- |
| PR | All unit, component, API contract tests, and P0 E2E if the full set stays under ~15 minutes with Playwright parallelization | Fail fast on invalid rule config, duplicate-run, stale-rule, and history/signal regressions |
| Nightly | Full scheduler/idempotency matrix, timezone and clock-skew variants, batch multi-listing runs, and perf smoke | Catch timing, rollback, and cross-listing drift |
| Weekly | Exploratory mobile review, accessibility pass, and long-running retry/idempotency burn-in | Find flaky boundaries and slow race conditions |

Philosophy: run everything in PRs if it stays under ~15 minutes; defer only expensive, timing-sensitive, or exploratory checks.

## Resource Estimates

| Priority | Count | Effort Range | Notes |
| --- | --- | --- | --- |
| P0 | 7 tests | ~12-22 hours | Requires deterministic clock, idempotency key, and history fixtures |
| P1 | 15 tests | ~10-18 hours | Mostly contract/component/unit coverage with targeted E2E |
| P2 | 8 tests | ~6-12 hours | Scheduler edge behavior and signal consistency |
| P3 | 2 activities | ~2-4 hours | Manual/exploratory and perf smoke |
| **Total** | **32 tests/activities** | **~30-56 hours** | **~1-2 weeks depending on scheduler readiness** |

### Prerequisites

**Test Data:**

- Listing/rule factory with valid listing id, base price, period, discount rate, and floor.
- Deterministic clock fixtures for due-time, skew, and retry boundary conditions.
- Applied/skip event fixtures with reason code and minimal signal payload.
- History rows for before/after price, applied time, and reason.

**Tooling:**

- Existing Jest unit tests for validators, due-time evaluator, and signal assembler.
- Existing Playwright E2E harness in repo-root `tests/e2e`.
- Stable `data-testid` hooks for rule form, apply/skip status, and history list.
- Injectable scheduler/time abstraction so the due-time tests remain deterministic.

**Environment:**

- Stable local or CI server with deterministic mock scheduler behavior.
- Request timeout configurable for fast failure tests.
- Resettable idempotency/run-key store between tests.

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate:** 100%, no exceptions.
- **P1 pass rate:** >= 95%, any failure requires documented waiver.
- **P2/P3 pass rate:** >= 90%, informational unless tied to a high-risk defect.
- **Single-apply mitigation:** 100% complete or explicitly waived by PM/Tech/QA.

### Coverage Targets

- **FR18-FR21 and FR32 acceptance criteria:** 100% mapped to at least one planned test.
- **Auto-adjust single-apply and skip semantics:** 100% automated P0 coverage.
- **Event schema and minimal signal scenarios:** 100% P1 or higher coverage.
- **Business logic and contract coverage:** >= 80%.
- **Accessibility states for rule/history flows:** >= 80% automated plus one exploratory mobile pass.

### Non-Negotiable Requirements

- [ ] No score 9 risk remains open.
- [ ] Same run key cannot double-apply a price change.
- [ ] Late or duplicate scheduler execution never produces duplicate event emission.
- [ ] History and minimal signal output match the applied change and reason.
- [ ] Invalid rule configuration never enters the active schedule set.

## Mitigation Plans

### R-001: duplicate or overlapping schedule execution (Score: 9)

**Mitigation Strategy:**

1. Add run-key/idempotency contract to adjustment execution.
2. Create concurrent execution tests at API/E2E level.
3. Verify duplicate attempt records as skipped, not applied.
4. Gate release on single-apply behavior.

**Owner:** Dev + QA  
**Timeline:** Story 3.2  
**Status:** Planned  
**Verification:** `tests/e2e/*` scheduler concurrency scenario plus API contract checks

### R-002: invalid rule configuration accepted (Score: 9)

**Mitigation Strategy:**

1. Centralize rule validation for period, discount, and floor.
2. Reject invalid payloads before activation.
3. Test form, API, and unit boundaries together.
4. Keep failed edits from clobbering the last valid rule.

**Owner:** Dev  
**Timeline:** Story 3.1  
**Status:** Planned  
**Verification:** unit validator tests and save-rule API/component checks

### R-003: floor-violation or stale rule still mutates price (Score: 8)

**Mitigation Strategy:**

1. Evaluate floor and current rule revision before mutation.
2. Record skip reason without applying a price change.
3. Keep stale rule handling deterministic for retries.
4. Add regression tests for all skip branches.

**Owner:** Dev + QA  
**Timeline:** Story 3.2  
**Status:** Planned  
**Verification:** API skip tests and one E2E floor-violation scenario

### R-004: event emitted without required common fields (Score: 6)

**Mitigation Strategy:**

1. Use schema-first producer helper for `pricing.auto_adjust.applied.v1`.
2. Enforce `eventId`, `occurredAt`, `traceId`, and `schemaVersion`.
3. Add contract rejection tests for missing or duplicate identifiers.
4. Keep Epic 3 responsible for emission only; Epic 4 owns observation.

**Owner:** Dev  
**Timeline:** Story 3.2  
**Status:** Planned  
**Verification:** contract tests with canonical fixture and invalid payload variants

### R-005: history/minimal signal diverges from applied result (Score: 6)

**Mitigation Strategy:**

1. Derive history and signal from the same applied adjustment record.
2. Lock before/after price, reason, and applied time into a single source of truth.
3. Add E2E checks that compare display and stored signal data.
4. Keep the minimal signal payload stable for later expansion.

**Owner:** Dev + QA  
**Timeline:** Story 3.3  
**Status:** Planned  
**Verification:** history view E2E and signal payload API/unit tests

## Assumptions and Dependencies

### Assumptions

1. Epic 3 source of truth is the current `_bmad-output/planning-artifacts/epics.md`; no separate story seed exists yet.
2. The pricing domain and event contract already present in `src/domain/pricing` and `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts` are the correct baseline for the new auto-adjust flow.
3. Scheduler behavior can be made deterministic through an injectable clock or job runner abstraction.
4. Epic 4 will own observability, alerting, and event-quality dashboards; Epic 3 only needs to emit the producer event and durable history/signal records.
5. Browser exploration was skipped because no target URL or running dev server was provided.

### Dependencies

1. Rule configuration form and persistence contract - Required before Story 3.1 automation can pass.
2. Deterministic scheduler/time abstraction - Required for idempotency and due-time tests.
3. `pricing.auto_adjust.applied.v1` producer helper - Required before Story 3.2 contract tests can pass.
4. History and minimal signal storage path - Required before Story 3.3 E2E can pass.

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
| --- | --- | --- |
| Pricing suggestion acceptance flow | Epic 2 supplies the current price baseline that auto-adjust builds on | `tests/e2e/price-suggestion-card-flow.spec.ts`, `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts` |
| Pricing domain helpers | Auto-adjust reuses policy and event conventions from current pricing code | `src/domain/pricing/*.test.ts`, `src/shared/contracts/events/*.test.ts` |
| Listing detail and history surfaces | Adjustment outcomes must match the seller-facing price state | listing detail E2E and history view tests |
| Event pipeline | Epic 3 producer output feeds Epic 4 quality and alerting checks | `pricing.auto_adjust.applied.v1` contract and emitted fixture tests |

## Follow-on Workflows

- Run `bmad-testarch-atdd` for Story 3.1 P0 tests before implementation.
- Run `bmad-testarch-automate` after Story 3.2 implementation exists to expand P1/P2 automation.
- Run `bmad-testarch-trace` before release to verify `FR18-FR21` and `FR32` against implemented tests.

## Approval

**Test Design Approved By:**

- [ ] Product Manager: Unassigned Date: 2026-04-22
- [ ] Tech Lead: Unassigned Date: 2026-04-22
- [ ] QA Lead: Unassigned Date: 2026-04-22

**Comments:**

- Draft generated from current BMAD artifacts and codebase scan.

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification and gate thresholds.
- `probability-impact.md` - Probability x impact scoring.
- `test-levels-framework.md` - Unit/API/component/E2E placement.
- `test-priorities-matrix.md` - P0-P3 classification.
- `playwright-cli.md` - Browser exploration and session cleanup rules.
- `overview.md`, `api-request.md`, `selector-resilience.md` - Playwright utility and selector guidance.

### Related Documents

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Epic: `_bmad-output/planning-artifacts/epics.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Pricing baseline: `src/domain/pricing/pricing-suggestion.ts`
- Pricing event contract: `src/shared/contracts/events/pricing-suggestion-accepted.v1.ts`

### Validation Notes

- Epic-level mode confirmed by explicit user request for Epic 3.
- Required Epic 3 requirements and acceptance criteria are present in the epic doc.
- Existing pricing tests scanned under repo-root `tests/`, `src/`, and `_bmad-output/test-artifacts`.
- No Playwright CLI session was opened; no orphaned browser cleanup required.
- Temp artifacts were not created outside `_bmad-output/test-artifacts`.

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/bmad-testarch-test-design`  
**Version:** 5.0 Step-File Architecture
