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
  - "_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/risk-governance.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/probability-impact.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-levels-framework.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/test-priorities-matrix.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/playwright-cli.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/overview.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/api-request.md"
  - "_bmad/tea/agents/bmad-tea/resources/knowledge/selector-resilience.md"
---

# Test Design: Epic 2 - AI 보조 등록 및 실패 복구

**Date:** 2026-04-22  
**Author:** 상재  
**Status:** Draft  
**Mode:** Epic-level test design  
**Detected stack:** Fullstack Next.js App Router, React, Jest, Playwright

## Executive Summary

**Scope:** Epic 2 전체, `FR8-FR15` 및 관련 `NFR1`, `NFR9-NFR11`, `NFR14-NFR15`.

Epic 2의 핵심 품질 목표는 AI 성공 경로 자체보다 실패, 지연, 중복 요청, 낮은 신뢰도 상황에서도 사용자가 수동 입력으로 등록을 완료할 수 있음을 증명하는 것이다. 특히 PRD의 "fallback E2E 통과율 100%" 및 "미달 시 자동 Hold" 규칙 때문에 fallback 완주는 P0 게이트로 취급한다.

**Risk Summary:**

- Total risks identified: 9
- High-priority risks (score >= 6): 5
- Critical categories: BUS, DATA, SEC, TECH

**Coverage Summary:**

- P0 tests: 9 planned tests, ~16-28 hours
- P1 tests: 23 planned tests, ~18-34 hours
- P2/P3 tests and activities: 15 planned tests/activities, ~10-22 hours
- **Total effort:** ~44-84 hours, 약 1.5-3 weeks

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| 실제 외부 AI 벤더 품질 평가 | MVP 문서는 외부 파트너 API 없이 내부 플로우 완결을 우선한다. | AI 응답은 deterministic fixture와 지연/실패 mock으로 검증한다. |
| 구매자 탐색/관심 신호 | Epic 5 Deferred-P2 범위다. | Epic 2 회귀 범위에서는 프리리스팅 등록 완료까지만 확인한다. |
| 자동 가격조정 규칙 실행 | Epic 3 범위다. | Epic 2는 추천가 수용/수동 확정과 확정 방식 기록 가능 상태까지만 다룬다. |
| 운영 KPI/가드레일 화면 | Epic 4 범위다. | Epic 2는 이벤트 중복 방지 식별자와 fallback E2E 신호 생성 가능성만 검증한다. |

## Risk Assessment

### High-Priority Risks (Score >= 6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | BUS | AI 실패/저신뢰 시 1탭 수동 fallback이 동작하지 않아 등록 플로우가 중단된다. | 3 | 3 | 9 | Story 2.1/2.4 P0 E2E로 실패, 타임아웃, 저신뢰, 수동 완주를 고정하고 fallback 실패 시 release fail 처리 | QA + Dev | Epic 2 시작 전 RED, 구현 PR마다 |
| R-002 | DATA | fallback 후 늦게 도착한 AI 응답이 사용자 수동 입력을 덮어쓴다. | 3 | 3 | 9 | request version/cancel token 검증을 API/서비스 단위와 E2E에서 모두 검증 | Dev | Story 2.1 |
| R-003 | DATA | 동일 AI 요청 중복 전송이 중복 초안/이벤트/상태를 만든다. | 3 | 2 | 6 | idempotency key 계약 테스트와 이벤트 단일성 검증 추가 | Dev | Story 2.1 |
| R-004 | SEC | 업로드 검증 부재로 허용되지 않은 파일, 과대 파일, 손상 이미지가 처리 경계에 진입한다. | 2 | 3 | 6 | 파일 type/size/corruption 분기별 API 및 E2E 오류 검증, 사용자 복구 CTA 확인 | Dev + QA | Story 2.1 |
| R-005 | BUS | 상품 핵심 정보 수정 이후 stale 추천가가 그대로 수용되어 잘못된 가격이 확정된다. | 2 | 3 | 6 | pricing suggestion revision mismatch API/component 테스트와 재산출/재확인 UX 검증 | Dev + QA | Story 2.3 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-006 | TECH | AI 초안/신뢰도/추천가 계약이 UI와 API 사이에서 drift되어 잘못된 필드가 표시된다. | 2 | 2 | 4 | `ai-extraction`, `pricing-suggestion` 계약 타입과 API contract tests를 먼저 고정 | Dev |
| R-007 | A11Y | 업로드/요청/오류/fallback 상태가 보조기술 또는 키보드 사용자에게 전달되지 않는다. | 2 | 2 | 4 | role="status", aria-live, focus 이동, 44x44 target E2E assertions | QA + Dev |
| R-008 | PERF | AI 요청 타임아웃 또는 큰 이미지 처리 중 무한 spinner가 발생해 p95 2초 핵심 액션 기준을 훼손한다. | 2 | 2 | 4 | timeout boundary, retry/fallback CTA latency checks, perf budget smoke | Dev |
| R-009 | OPS | 오래된 스토리/경로 문서가 루트 앱 구조와 충돌해 테스트가 잘못된 위치에 작성된다. | 2 | 2 | 4 | 본 계획은 루트 `src/`, `tests/` 구조를 기준으로 경로를 명시하고 nested `preproduct/` 경로를 사용하지 않는다. | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| --- | --- | --- | --- | --- | --- | --- |
| R-010 | BUS | 추천가 보조 카피가 사용자 최종 책임 경계를 충분히 설명하지 못한다. | 1 | 2 | 2 | 정책/신뢰 안내와 UX copy review에서 모니터링 |

### Risk Category Legend

- **TECH:** architecture, integration, contract, state-machine issues
- **SEC:** upload boundary, privacy, unsafe input, authorization
- **PERF:** SLA, timeout, resource usage
- **DATA:** overwrite, duplication, corruption, stale version
- **BUS:** user journey interruption, wrong price, trust harm
- **OPS:** release, test environment, documentation drift
- **A11Y:** accessibility and assistive technology risk

## Entry Criteria

- [ ] Epic 2 story scope is agreed against current `_bmad-output/planning-artifacts/epics.md`.
- [ ] Test implementation uses repo-root `src/` and `tests/`, not legacy nested `preproduct/` paths.
- [ ] AI extraction and pricing APIs expose stable `{ data, meta }` / `{ error }` response contracts.
- [ ] Deterministic fixtures exist for AI success, low-confidence, timeout, unavailable, corrupted image, and delayed response.
- [ ] Test data factories can create a valid listing draft state with title, category, one or more key specs, and price.

## Exit Criteria

- [ ] All P0 tests pass at 100%.
- [ ] P1 pass rate is >= 95% with explicit waiver for any non-blocking failure.
- [ ] No open high-priority risks (score >= 6) without owner-approved mitigation.
- [ ] Fallback E2E pass rate is 100%.
- [ ] Security and upload validation tests pass 100%.
- [ ] No P0/P1 coverage gap remains for `FR8-FR15`.

## Test Coverage Plan

P0/P1/P2/P3 are priority and risk levels, not execution timing. Execution timing is defined separately in the Execution Strategy section.

### P0 Critical

**Criteria:** Blocks core registration completion, high risk, no acceptable workaround.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1-E2E-001 | Valid photo upload starts AI draft request and exposes upload/request status | E2E | R-006, R-008 | 1 | QA | User-visible proof that PhotoUploader is wired into registration flow |
| 2.1-E2E-002 | AI timeout/unavailable switches to manual fallback in one tap and preserves registration flow | E2E | R-001 | 2 | QA | Covers timeout and service failure variants |
| 2.1-E2E-003 | Late AI response after fallback does not overwrite manual title/category/spec input | E2E | R-002 | 1 | QA | Must use controlled delayed response fixture |
| 2.1-API-001 | Duplicate AI extraction request with same idempotency key returns one consistent result | API | R-003 | 2 | Dev | Includes concurrent and retry-after-timeout cases |
| 2.3-API-001 | Pricing suggestion rejects stale revision after core item info changes | API | R-005 | 1 | Dev | Requires revision or input hash in contract |
| 2.3-E2E-001 | User can accept suggestion or enter manual price and registration uses selected price | E2E | R-005 | 1 | QA | Covers final persisted form state |
| 2.4-E2E-001 | Low-confidence/failure state completes full registration manually | E2E | R-001 | 1 | QA | Gate metric: fallback E2E must be 100% |

**Total P0:** 9 tests, ~16-28 hours

### P1 High

**Criteria:** Core journey, medium/high risk, common workflows.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1-API-002 | File validation distinguishes invalid type, oversized file, corrupted image | API | R-004 | 3 | Dev | Error schema includes `error.code`, `requestId`, `details.recoveryGuide` |
| 2.1-E2E-004 | Upload validation errors show distinct messages and immediate retry CTA | E2E | R-004, R-007 | 3 | QA | Verify status is not color-only |
| 2.2-COMP-001 | ExtractionFieldEditor renders AI title/category/spec draft as editable fields | Component | R-006, R-007 | 2 | Dev | Prefer component-level for UI states |
| 2.2-COMP-002 | Confidence label is visible with text/icon and remains associated with edited draft | Component | R-006, R-007 | 2 | Dev | Covers FR13 |
| 2.2-UNIT-001 | Draft merge logic gives user edits priority over AI suggestions | Unit | R-002 | 3 | Dev | Lower-level guard avoids redundant E2E branches |
| 2.3-COMP-001 | PriceSuggestionCard supports accept and manual edit states | Component | R-005 | 2 | Dev | UI branching without full journey overhead |
| 2.3-UNIT-001 | Manual price validation covers min, max, step, and non-numeric input | Unit | R-005 | 4 | Dev | Fast boundary coverage |
| 2.3-API-002 | Auth/session expiry does not record invalid price acceptance event | API | R-005 | 2 | Dev | Covers bad-event prevention |
| 2.3-API-003 | Successful price confirmation emits a single event id | API | R-003, R-005 | 1 | Dev | Aligns with duplicate guardrail |
| 2.4-COMP-001 | Fallback CTA is keyboard reachable, 44x44 minimum, and moves focus to manual fields | Component | R-001, R-007 | 1 | Dev + QA | Accessibility and one-tap readiness |

**Total P1:** 23 tests, ~18-34 hours

### P2 Medium

**Criteria:** Secondary flows, lower risk, edge cases.

| Test ID | Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1-UNIT-001 | Upload state machine transitions idle/uploading/requesting/success/error/fallback | Unit | R-008 | 6 | Dev | State machine is cheaper and more precise at unit level |
| 2.1-API-003 | AI extraction response schema rejects unknown status or missing confidence label | API | R-006 | 2 | Dev | Contract drift guard |
| 2.2-E2E-001 | User edits AI draft then saves listing with edited values | E2E | R-006 | 1 | QA | One representative cross-page happy path |
| 2.3-COMP-002 | PriceSuggestionCard displays recovery guide for invalid manual price | Component | R-005, R-007 | 2 | Dev | Avoid duplicate E2E coverage |
| 2.4-API-001 | Low-confidence AI result explicitly marks fallback recommended state | API | R-001, R-006 | 1 | Dev | Enables UI branching |
| 2.4-E2E-002 | Manual fallback preserves existing uploaded file metadata without requiring re-upload | E2E | R-001 | 1 | QA | Useful edge case if file remains attached |

**Total P2:** 13 tests, ~8-18 hours

### P3 Low

**Criteria:** Exploratory, benchmarks, nice-to-have confidence.

| Test ID | Requirement | Test Level | Test Count | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| 2.X-EXP-001 | Exploratory mobile pass for 320px, 390px, 767px layouts | Manual/Visual | 1 session | QA | Capture screenshots only for anomalies |
| 2.X-PERF-001 | Large allowed image and AI timeout branch under perf budget smoke | E2E/Perf smoke | 1 | QA | Run outside PR if unstable or slow |

**Total P3:** 2 activities, ~2-4 hours

## Execution Strategy

Use the simple PR, Nightly, Weekly model.

| Cadence | Scope | Target |
| --- | --- | --- |
| PR | All unit, component, API contract tests, and P0/P1 E2E if the full set stays under ~15 minutes with Playwright parallelization | Fail fast on fallback, idempotency, stale price, upload validation |
| Nightly | Full E2E matrix, mobile viewport pass, delayed response/timeout variants, perf budget smoke | Catch timing, accessibility, and cross-flow regressions |
| Weekly | Exploratory mobile review, long-running burn-in for fallback and idempotency races, larger file boundary checks | Find flakes and rare race conditions |

Philosophy: run everything in PRs if it stays under ~15 minutes; defer only expensive, timing-sensitive, or exploratory checks.

## Resource Estimates

| Priority | Count | Effort Range | Notes |
| --- | --- | --- | --- |
| P0 | 9 tests | ~16-28 hours | Requires fixtures for delayed AI, timeout, idempotency, and stale revision |
| P1 | 23 tests | ~18-34 hours | Mostly contract/component/unit coverage with targeted E2E |
| P2 | 13 tests | ~8-18 hours | State-machine and edge behavior |
| P3 | 2 activities | ~2-4 hours | Manual/exploratory and perf smoke |
| **Total** | **47 tests/activities** | **~44-84 hours** | **~1.5-3 weeks depending on API readiness** |

### Prerequisites

**Test Data:**

- Listing draft factory with valid title, category, key spec, price, and status.
- AI extraction fixtures: success, low-confidence, timeout, unavailable, corrupted image, delayed success.
- Pricing fixtures: current revision, stale revision, accepted suggestion, manual price.

**Tooling:**

- Existing Jest unit tests for pure validators and state machines.
- Existing Playwright E2E harness in repo-root `tests/e2e`.
- Existing `tests/support/helpers/api-client.ts`; optional migration to `@seontechnologies/playwright-utils/api-request` if the dependency is added later.
- Playwright selectors should prefer ARIA roles and explicit `data-testid` on PhotoUploader, ExtractionFieldEditor, PriceSuggestionCard, and fallback CTA.

**Environment:**

- Stable local or CI server with deterministic mock AI behavior.
- Request timeout configurable for fast failure tests.
- Event/idempotency store resettable between tests.

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate:** 100%, no exceptions.
- **P1 pass rate:** >= 95%, any failure requires documented waiver.
- **P2/P3 pass rate:** >= 90%, informational unless tied to a high-risk defect.
- **High-risk mitigations:** 100% complete or explicitly waived by PM/Tech/QA.

### Coverage Targets

- **FR8-FR15 acceptance criteria:** 100% mapped to at least one planned test.
- **Fallback scenarios:** 100% automated P0 coverage.
- **Security/upload validation scenarios:** 100% P1 or higher coverage.
- **Business logic and contract coverage:** >= 80%.
- **Accessibility states for AI/fallback flow:** >= 80% automated plus one exploratory mobile pass.

### Non-Negotiable Requirements

- [ ] No score 9 risk remains open.
- [ ] fallback E2E pass rate remains 100%.
- [ ] Late AI response never overwrites manual input.
- [ ] Duplicate AI/pricing requests do not create duplicate final states or events.
- [ ] Upload rejection paths provide retry CTA and accessible status.

## Mitigation Plans

### R-001: fallback 경로 실패 (Score: 9)

**Mitigation Strategy:**

1. Create RED P0 E2E before implementation for timeout/unavailable/low-confidence fallback.
2. Require fallback CTA to be one user action from error/low-confidence state.
3. Preserve manual completion through final listing save.
4. Gate release on 100% fallback E2E pass.

**Owner:** QA + Dev  
**Timeline:** Story 2.1 and Story 2.4  
**Status:** Planned  
**Verification:** `tests/e2e/ai-assisted-registration-fallback.spec.ts` P0 suite

### R-002: late AI response overwrites manual input (Score: 9)

**Mitigation Strategy:**

1. Add request version or cancel token to AI extraction contract.
2. Add service/unit test for stale response rejection.
3. Add E2E fixture that delays success response until after fallback and manual edits.
4. Assert final visible and persisted data matches manual input.

**Owner:** Dev  
**Timeline:** Story 2.1  
**Status:** Planned  
**Verification:** Unit state-machine test plus P0 E2E late-response scenario

### R-003: duplicate AI request creates duplicate state/event (Score: 6)

**Mitigation Strategy:**

1. Require idempotency key in AI extraction request.
2. Test concurrent duplicate submissions at API level.
3. Assert identical response envelope or stable terminal state.
4. Verify event id uniqueness for extraction/pricing events.

**Owner:** Dev  
**Timeline:** Story 2.1, Story 2.3  
**Status:** Planned  
**Verification:** API contract tests with concurrent duplicate submissions

### R-004: unsafe/invalid file crosses upload boundary (Score: 6)

**Mitigation Strategy:**

1. Validate file type, size, and corruption separately in domain validator.
2. Expose distinct error codes and recovery guides.
3. Assert UI shows retry CTA and accessible status for each error.
4. Keep rejected files out of AI request execution.

**Owner:** Dev + QA  
**Timeline:** Story 2.1  
**Status:** Planned  
**Verification:** API error contract tests plus E2E upload error flow

### R-005: stale 추천가 accepted after item revision change (Score: 6)

**Mitigation Strategy:**

1. Include revision or input hash in pricing suggestion request/response.
2. Reject acceptance when title/category/spec revision differs.
3. Offer regenerate or explicit reconfirm path.
4. Verify no invalid price acceptance event is emitted on rejection.

**Owner:** Dev + QA  
**Timeline:** Story 2.3  
**Status:** Planned  
**Verification:** API revision mismatch test and one E2E stale-price scenario

## Assumptions and Dependencies

### Assumptions

1. Epic 2 source of truth is the current `_bmad-output/planning-artifacts/epics.md`; `_bmad-output/implementation-artifacts/sprint-status.yaml` is stale for Epic 2 naming and was not edited.
2. Generated tests should target repo-root `src/` and `tests/` because `preproduct/package.json` does not exist in the current workspace.
3. Browser exploration was skipped because no target URL or running dev server was provided; this plan is based on code and documentation analysis.
4. AI service behavior can be controlled through test fixtures or route mocks.
5. Price suggestion implementation will expose a deterministic revision or input hash for stale acceptance checks.

### Dependencies

1. AI extraction API contract - Required before Story 2.1 automation can pass.
2. PhotoUploader test selectors and accessible labels - Required before E2E selector stabilization.
3. Price suggestion contract and revision model - Required before Story 2.3 P0/P1 tests.
4. Resettable idempotency/event store - Required for reliable duplicate request tests.

### Risks to Plan

- **Risk:** External AI integration is introduced later without deterministic test mode.
  - **Impact:** P0 fallback and late-response tests become flaky.
  - **Contingency:** Keep provider boundary mocked in PR tests; run provider-backed tests only nightly or weekly.
- **Risk:** Event instrumentation is deferred to Epic 4.
  - **Impact:** Epic 2 cannot fully verify event duplicate guardrails.
  - **Contingency:** Verify event-ready envelope/idempotency at API boundary and hand off remaining observability checks to Epic 4.

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
| --- | --- | --- |
| Listing registration form | Epic 2 writes AI draft and price into the same final listing fields | Existing `tests/e2e/listing-registration.spec.ts`, listing domain unit tests |
| Listing repository/persistence | Manual fallback and AI-assisted data must persist the same canonical fields | `src/domain/listing/*.test.ts`, `src/infra/listing/listing.repository.test.ts` |
| Event contracts | Pricing/extraction acceptance should not duplicate IDs or drift schema versions | Existing `listing.created.v1` contract plus new AI/pricing event contract tests |
| Observability/perf budget | Timeout/fallback must avoid infinite spinner and protect p95 core actions | `src/domain/measurement/perf-budget.test.ts`, nightly perf smoke |

## Follow-on Workflows

- Run `bmad-testarch-atdd` for Story 2.1 P0 tests before implementation.
- Run `bmad-testarch-automate` after Story 2.1 implementation exists to expand P1/P2 automation.
- Run `bmad-testarch-trace` before release to verify `FR8-FR15` against implemented tests.

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
- Story seed: `_bmad-output/implementation-artifacts/2-1-photouploader-기반-이미지-업로드와-ai-초안-요청.md`

### Validation Notes

- Epic-level mode confirmed by explicit user request for Epic 2.
- Required Epic 2 requirements and acceptance criteria are present.
- Existing tests scanned under repo-root `tests/`, `src/`, and `_bmad-output/test-artifacts`.
- No Playwright CLI session was opened; no orphaned browser cleanup required.
- Temp artifacts were not created outside `_bmad-output/test-artifacts`.

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `_bmad/tea/testarch/bmad-testarch-test-design`  
**Version:** 5.0 Step-File Architecture
