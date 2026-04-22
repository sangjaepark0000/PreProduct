# Story 3.2: 규칙 기반 자동 가격조정 실행 및 사유 기록

Status: done

## Story

As a 시스템 운영 사용자,
I want 저장된 규칙에 따라 자동 가격조정이 실행되길 원한다,
so that 수동 개입 없이 최신 가격 상태를 유지할 수 있다.

**Scope Tag:** Active MVP
**Story Type:** Brownfield enhancement / pricing execution
**FR Trace:** FR19, FR20, FR25

## Acceptance Criteria

1. **Given** 유효한 가격조정 규칙이 존재하고 실행 시점이 도래했을 때  
   **When** 시스템이 조정 작업을 실행하면  
   **Then** 규칙에 맞는 가격조정이 적용된다  
   **And** 변경 사유와 적용 시점이 기록된다.

2. **Given** 자동조정 결과가 최저가 하한을 위반하거나 규칙이 stale/superseded 되었을 때  
   **When** 시스템이 적용 여부를 평가하면  
   **Then** 조정 적용을 건너뛴다  
   **And** skip 사유와 평가 시점이 기록된다.

3. **Given** 동일 리스팅에 대한 동시 실행 충돌 또는 동일 run key 중복 실행이 발생했을 때  
   **When** 시스템이 조정 작업을 처리하면  
   **Then** 단일 처리만 성공한다  
   **And** 나머지 시도는 중복 처리로 기록된다.

4. **Given** 자동 가격조정 작업이 중간 실패 후 재시도될 때  
   **When** 시스템이 동일 run key로 재실행을 판단하면  
   **Then** 가격 적용은 최대 1회만 반영된다  
   **And** 부분 적용 상태는 트랜잭션 경계 또는 상태 머신 규칙으로 복구된다.

5. **Given** 조정이 성공적으로 적용되었을 때  
   **When** 시스템이 후속 계측에 전달하면  
   **Then** `pricing.auto_adjust.applied.v1` 이벤트가 발행된다  
   **And** Epic 3은 producer 책임만 수행하며 관측/무결성/경보 책임은 Epic 4로 위임된다.

## Tasks / Subtasks

- [x] 실행 도메인과 run-key 가드를 추가한다. (AC: 1, 2, 3, 4)
  - [x] `src/domain/pricing/auto-adjust-execution.ts`를 생성하고 due-time 평가, stale rule 감지, floor violation skip, duplicate-run result, recovery 상태를 모델링한다.
  - [x] `src/domain/pricing/auto-adjust-execution.test.ts`에 실행 성공, floor skip, stale skip, 동시성 충돌, retry-after-partial-failure 케이스를 추가한다.
  - [x] 규칙 입력/가격 경계는 Story 3.1의 `autoAdjustRule`와 `listingPricePolicy`를 재사용하고, 규칙 검증 로직을 중복 정의하지 않는다.

- [x] producer event 계약과 발행 헬퍼를 추가한다. (AC: 1, 5)
  - [x] `src/shared/contracts/events/pricing-auto-adjust-applied.v1.ts`를 생성하고 이벤트 envelope, payload, deterministic eventId 규약을 고정한다.
  - [x] `src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts`와 `tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts`에 canonical fixture, required field 검증, invalid payload rejection을 추가한다.
  - [x] 성공 적용 이벤트에는 `eventId`, `occurredAt`, `traceId`, `schemaVersion`와 함께 listing/rule/run identifiers 및 before/after price, reason code를 포함한다.
  - [x] skip 결과는 producer event 대신 execution record에 남기고, Epic 4가 소비할 관측 책임과 섞지 않는다.

- [x] 실행 진입점과 durable guardrail을 연결한다. (AC: 1, 2, 3, 4, 5)
  - [x] `src/app/api/pricing/auto-adjust/route.ts` 또는 동등한 scheduler-facing 진입점을 추가해 injected clock/runner로 실행을 오케스트레이션한다.
  - [x] `src/infra/pricing/auto-adjust-execution.repository.ts` 또는 동등한 infra 저장소를 추가해 run-key idempotency와 applied-result persistence를 담당하게 한다.
  - [x] page/component 계층은 infra를 직접 import하지 않도록 유지하고, mutation logic은 route/service 경계에만 둔다.

- [x] 회귀 테스트를 추가해 single-apply semantics를 고정한다. (AC: 1, 2, 3, 4, 5)
  - [x] floor-violation skip, stale rule skip, duplicate run, concurrent run, retry-after-partial-failure, happy-path apply를 각각 고정한다.
  - [x] 라우트/통합 테스트로 producer helper가 기대한 schema를 발행하고, 동일 run key 재호출 시 중복 적용되지 않음을 확인한다.
  - [x] Story 3.3의 history/minimal-signal 저장은 아직 구현하지 않는다.

### Review Findings

- [x] [Review][Patch] Same-listing concurrent runs with different run keys can both apply a discount [src/infra/pricing/auto-adjust-execution.repository.ts] — fixed with listing-level transaction locking, same-rule duplicate detection within the active period, and focused repository regression tests.
- [x] [Review][Patch] Applied partial-failure retries can reapply a discount when `afterPriceKrw` is missing [src/infra/pricing/auto-adjust-execution.repository.ts] — fixed by treating `appliedAt` as the durable single-apply marker, recovering missing after price from the current listing price, and adding focused repository regression coverage.

## Dev Notes

### Story Intent

- Story 3.2는 Epic 3의 실행 책임을 닫는 스토리다. 사용자가 보는 이력/최소 신호 화면은 Story 3.3의 책임이다.
- 이 스토리는 가격조정의 결과를 단일 source of truth로 고정해야 한다. 이후 event payload, history view, minimal signal은 같은 applied adjustment record에서 파생돼야 한다.
- Story 3.1은 규칙 저장과 last-valid-state 보존만 책임진다. 실행 로직에서 규칙 스키마를 다시 만들지 말고 기존 계약을 그대로 재사용한다.

### Scope Boundaries

- 포함:
  - due execution
  - floor violation / stale rule skip
  - idempotent run-key handling
  - duplicate-run detection
  - applied/skip reason recording
  - `pricing.auto_adjust.applied.v1` producer emission
- 제외:
  - 가격 변경 이력 페이지
  - 최소 신호 저장
  - KPI/가드레일 운영 화면
  - Go/Hold/Stop 판정 로직
  - 추천가 수용/수동 확정 흐름
  - 새로운 규칙 설정 UI

### Current Workspace Reality

- `src/domain/pricing/auto-adjust-rule.ts`와 `src/feature/listing/actions/save-auto-adjust-rule.action.ts`가 Story 3.1의 규칙 계약과 마지막 유효 상태 보존 패턴을 이미 제공한다.
- `src/shared/contracts/events/listing-created.v1.ts`와 `src/shared/contracts/events/ai-extraction-reviewed.v1.ts`는 이 repo의 event contract 패턴을 보여준다. strict schema, common envelope, deterministic helper, contract test를 같은 방식으로 맞춰야 한다.
- `tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts`는 pricing event contract 테스트의 현재 기준점이다.
- `src/app/api/ops/listing-observability/route.test.ts`는 route test shape 참고용이지만, Story 3.2는 observability output이 아니라 execution producer path를 만든다.
- `dependency-graph.md`는 Story 3.2를 next ready backlog로 두고, Story 4.1이 `3.2`에 의존한다고 표시한다.

### Recommended Implementation Shape

- `src/domain/pricing/auto-adjust-execution.ts`
- `src/domain/pricing/auto-adjust-execution.test.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts`
- `src/infra/pricing/auto-adjust-execution.repository.ts`
- `src/app/api/pricing/auto-adjust/route.ts`
- `src/app/api/pricing/auto-adjust/route.test.ts`
- `tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts`
- `tests/e2e/auto-adjust-execution-flow.spec.ts` or equivalent scheduler smoke if the entrypoint is exposed directly

### Data Modeling Guidance

- Persist one execution result per run key and listing. Do not start with a free-form audit log if a single applied-result record will serve both Story 3.2 and Story 3.3.
- Keep the record serializable and stable enough for Story 3.3 to reuse: `listingId`, `ruleUpdatedAt` or `ruleRevision`, `runKey`, `beforePriceKrw`, `afterPriceKrw`, `reasonCode`, `executedAt`, `appliedAt`, `status`, `skipReason`, `traceId`.
- Treat skip reasons as domain values, not UI text. History or admin surfaces can map them to copy later.
- If a stale worker sees a superseded rule, skip rather than apply. Do not mutate the active rule just because a delayed run wakes up.
- Use transaction boundaries or a state-machine guard so partial application cannot become a double apply on retry.

### Execution Guardrails

- This story does not need a user-facing screen. Any new endpoint is scheduler-facing or API-facing only.
- If a diagnostic route is introduced, return machine-readable skip/apply reasons and stable status codes.
- Do not add an operator retry button unless there is a real operator workflow behind it.

### Architecture Compliance

- Follow `feature -> domain -> infra` only. API/route code may orchestrate but must not reach into Prisma or persistence directly.
- Keep event construction in a shared contract module, not in route handlers or components.
- Reuse the repo’s Zod-first contract style and the existing `traceId` / `occurredAt` envelope pattern.
- Epic 4 owns observation, dashboards, and alerting. Story 3.2 only produces the event and durable execution record.
- Story 3.2 should not implement the history page or minimal signal output. Those belong to Story 3.3.

### Previous Story Intelligence

- Story 3.1 established the rule schema, `useActionState`, and `revalidatePath` patterns for server-side mutation flows.
- The rule page currently lives under `/listings/[listingId]/auto-adjust-rule`; Story 3.2 should not fold execution controls into that screen.
- Story 3.1 intentionally did not emit `pricing.auto_adjust.applied.v1`. This story owns that producer responsibility and the associated contract tests.
- The pricing domain already reuses `listingPricePolicy` from listing pricing. Keep the same bounds source and avoid duplicating constants.

### Testing Requirements

- Unit test due-time evaluation, floor violation skip, stale rule skip, duplicate run key, retry-after-partial-failure, and successful application.
- Contract test the canonical `pricing-auto-adjust-applied.v1` fixture, required common event fields, and invalid payload rejection.
- Route/integration test the scheduler-facing entrypoint or job runner with a deterministic clock/runner.
- Keep one deterministic test around concurrent execution or duplicate run-key handling. Story 3.2’s highest risk is incorrect single-apply semantics.
- Do not add history/minimal-signal tests here. They belong to Story 3.3.

### References

- `_bmad-output/planning-artifacts/epics.md` - Epic 3, Story 3.2, Story 3.3, FR19, FR20, FR25
- `_bmad-output/planning-artifacts/prd.md` - FR19, FR20, FR25, FR32, event quality, auto-adjust failure rate
- `_bmad-output/planning-artifacts/architecture.md` - pricing-adjustment boundaries, `pricing.auto_adjust.applied.v1` producer responsibility, `src/domain/pricing`
- `_bmad-output/planning-artifacts/ux-design-specification.md` - MVP scope override and simplified flow context
- `_bmad-output/test-artifacts/test-design-epic-3.md` - R-001, R-003, R-004, P0/P1 coverage plan, entry/exit criteria
- `_bmad-output/implementation-artifacts/3-1-자동-가격조정-규칙-설정.md` - Story 3.1 implementation and scope boundary
- `_bmad-output/implementation-artifacts/dependency-graph.md` - Story 3.2 ready, Story 4.1 blocked on 3.2
- [src/domain/pricing/auto-adjust-rule.ts](/C:/Users/ok.works/Projects/PreProduct/src/domain/pricing/auto-adjust-rule.ts)
- [src/feature/listing/actions/save-auto-adjust-rule.action.ts](/C:/Users/ok.works/Projects/PreProduct/src/feature/listing/actions/save-auto-adjust-rule.action.ts)
- [src/shared/contracts/events/listing-created.v1.ts](/C:/Users/ok.works/Projects/PreProduct/src/shared/contracts/events/listing-created.v1.ts)
- [src/shared/contracts/events/ai-extraction-reviewed.v1.ts](/C:/Users/ok.works/Projects/PreProduct/src/shared/contracts/events/ai-extraction-reviewed.v1.ts)
- [tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts](/C:/Users/ok.works/Projects/PreProduct/tests/contracts/pricing-suggestion-accepted.v1.contract.test.ts)
- [src/app/api/ops/listing-observability/route.test.ts](/C:/Users/ok.works/Projects/PreProduct/src/app/api/ops/listing-observability/route.test.ts)

## Dev Agent Record

### Implementation Plan

- Story 3.1의 `autoAdjustRuleSchema`와 `listingPricePolicy`를 재사용해 실행 도메인의 가격 계산, due-time, stale rule, floor skip, duplicate/retry 결과를 순수 함수로 고정했다.
- `pricing.auto_adjust.applied.v1`는 shared contract module에서 Zod schema와 deterministic eventId builder로 생성하고, skip 결과는 execution record에만 남기도록 분리했다.
- scheduler-facing `POST /api/pricing/auto-adjust`는 feature runner를 통해 실행 repository를 호출하고, repository는 `listingId + runKey` unique guard와 transaction boundary에서 listing price mutation, execution result, producer event payload를 함께 저장한다.

### Debug Log

- `pnpm install --frozen-lockfile` 실행 시 Node engine warning 발생: repo는 `>=24.14.1 <25`, 현재 shell은 `v22.18.0`. 의존성 설치와 테스트 실행은 계속 가능했다.
- Prisma client generation은 로컬 `DATABASE_URL`이 필요해 dummy `postgresql://user:pass@localhost:5432/preproduct` 값으로 `pnpm prisma generate`를 실행했다.
- Red-phase contract artifact는 구현 후 타입체크 대상이 되어 `reasonCode` literal type과 deterministic fixture id를 현재 contract builder와 맞췄다.

### Completion Notes

- 자동 가격조정 실행 도메인, applied event contract, scheduler route, runner, durable repository guard를 추가했다.
- floor violation/stale/missing/disabled/not-due skip은 event를 발행하지 않고 execution result로만 기록한다.
- 동일 run key는 unique guard로 duplicate count를 증가시키고 duplicate result를 반환하며, partial-failure 재시도는 `retry-recovered` applied result로 수렴한다.
- Story 3.3 범위인 history page/minimal signal UI는 구현하지 않았다.

### Checks

- `pnpm unit --runTestsByPath src/domain/pricing/auto-adjust-execution.test.ts src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts src/infra/pricing/auto-adjust-execution.repository.test.ts src/app/api/pricing/auto-adjust/route.test.ts` - passed, 4 suites / 16 tests.
- `pnpm contract` - passed, 5 suites / 18 tests.
- `pnpm typecheck` - passed.
- `pnpm lint` - passed.

### File List

- `_bmad-output/implementation-artifacts/3-2-auto-price-adjustment-execution-reason-log.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/test-artifacts/red-phase/story-3-2/tests/contracts/pricing-auto-adjust-applied.v1.contract.red.test.ts`
- `package.json`
- `prisma/schema.prisma`
- `src/app/api/pricing/auto-adjust/route.test.ts`
- `src/app/api/pricing/auto-adjust/route.ts`
- `src/domain/pricing/auto-adjust-execution.test.ts`
- `src/domain/pricing/auto-adjust-execution.ts`
- `src/feature/pricing/auto-adjust-execution.runner.ts`
- `src/infra/pricing/auto-adjust-execution.repository.test.ts`
- `src/infra/pricing/auto-adjust-execution.repository.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.test.ts`
- `src/shared/contracts/events/pricing-auto-adjust-applied.v1.ts`
- `tests/contracts/fixtures/pricing.auto-adjust.applied.v1.json`
- `tests/contracts/pricing-auto-adjust-applied.v1.contract.test.ts`

### Change Log

- 2026-04-22: Implemented Story 3.2 rule-based auto price adjustment execution, reason recording, idempotent durable guard, scheduler route, and applied event contract.
