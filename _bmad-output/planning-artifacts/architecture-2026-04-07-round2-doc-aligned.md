---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/prd.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/ux-design-specification.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/product-brief-preproduct-2026-04-04.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/product-brief-preproduct-experiment-plan-2026-04-04.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/product-brief-preproduct-experiment-tickets-2026-04-04.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/prd-validation-report.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-05.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/brainstorming/index.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate-distillate.md'
  - 'C:/Users/atima/Projects/PreProduct/_bmad-output/brainstorming/brainstorming-session-2026-04-01-075805-distillate-validation-report.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-04-07'
project_name: 'PreProduct'
user_name: '상재'
date: '2026-04-05T19:41:22+09:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Scope Priority Notice (2026-04-07)

- MVP 구현 경계 판단은 `Correct Course Baseline (2026-04-07 revised-minimal)`를 우선 적용한다.
- 확장 경계(Ops/Experiment/Partner)는 설계 유지, 구현은 P1.5+로 연기한다.
- 2026-04-07 승인된 `Analysis Restart Baseline` 이후, 본 문서의 구현 우선순위는 재검증 전까지 제안(Proposed) 상태다.
- Round 2 labeling (4/7 revised-minimal baseline):
  - Active MVP: authoritative current sprint implementation scope
  - Deferred P1.5+: design kept, implementation postponed
  - Legacy Reference: reference-only context; no implementation priority

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
PreProduct는 판단 지원 중심 플랫폼으로, 기능은 (1) 의향/목표 형성, (2) 판단 카드 및 행동 선택, (3) 선의향 공개와 상태 전이, (4) 타이밍 신호/알림, (5) 운영/지원, (6) 계측/실험, (7) 파트너 연동으로 구성된다.
핵심은 구매/판매/보류/대안 선택 시 근거와 확신도를 함께 제공하고, 보류/드랍도 학습 가능한 결정 데이터로 축적하는 것이다.

**Non-Functional Requirements:**
NFR은 성능, 보안/프라이버시, 확장성, 접근성(WCAG AA), 통합(API 버전/오류 규약/쿼터), 신뢰성(RPO/RTO/드리프트 대응)을 동시에 요구한다.

**Scale & Complexity:**
- Primary domain: Full-stack web platform (decision app + analytics + ops + partner API)
- Complexity level: High
- Estimated architectural components: 12-16

### Architectural Boundaries (Required vs Extension)

**Required Boundaries (MVP/P1.5):**
- Identity/Auth
- Intent & Goal Management
- Decision Engine
- Evidence/Explanation
- Asset State & Transition
- Signal/Alert
- Event Ingestion & Quality Control
- KPI Pipeline & Weekly Decision Engine
- Ops Console
- Partner API Gateway (P1.5)
- Policy/Consent
- Audit & Compliance
- Feature/Mode Control

**Extension Boundaries (P2+):**
- Advanced Personalization
- Expanded Partner Programs
- Extended Asset Modes

### Data Contract Requirements

- Event Contract: 이벤트 11종 + 공통 필드 + dedupe/UTC 규칙 버전 관리 (`prd.md`의 "핵심 이벤트 정의 (MVP 11종)"를 canonical source로 사용)
- Partner API Contract: 인증/권한/쿼터/오류 스키마 + 하위호환 정책
- Reporting Contract: KPI/Guardrail/Weekly Decision 리포트 스키마 고정
- Metric Definition Registry: 이벤트/수식 단일 소스

### KPI-to-Architecture Mapping

- 의향 등록률: 입력 플로우 + Intent/Goal + 이벤트 무결성
- 판단 활용률: Decision Engine + Evidence/Explanation + 응답성
- 보류 후 재전환율: Hold/Revisit 루프 + Signal/Alert
- 의사결정 만족도: 설명 품질 + 결과 일관성
- 탐색 시간 절감률: 검색/비교/행동 플로우 최적화 + 성능

### Technical Constraints & Dependencies

- 하이브리드 웹(SEO 페이지 + 앱 셸 SPA)에서 도메인 로직 중복 금지
- Decision Engine 출력은 versioned + replayable
- 실험군 할당 일관성, 주간 판정 엔진 재현성 필요
- fallback 모드 전환 및 드리프트 대응 절차 내장
- 파트너 온보딩: 계약 -> 보안검토 -> 샌드박스 -> 운영승인

### Cross-Cutting Concerns

- Authentication/Authorization
- Observability and data quality
- Explainability and traceability
- Privacy/compliance operations
- Experimentation governance
- Reliability/continuity
- Accessibility and UX consistency
- Cost observability and control

### Quality Gates (Acceptance Criteria Seeds)

- Event dedupe rate `< 1%`
- Experiment assignment consistency `>= 99.5%`
- Decision card generation failure rate `<= 1%`
- Alert delivery SLA `95% within 5 min`
- Keyboard-only critical journeys pass rate `100%`
- Sample-size guardrail: `n < 100` 시 판정 신뢰도 하향 + quality freeze
- Perf+Cost dual gate: 성능 통과여도 비용 급증 시 실패
- Story Traceability: Epic 1 Story 1.4에서 CI/CD + Contract + Perf gate를 필수 선행으로 추적

### Governance and Operations Additions

- Weekly Decision Engine: 계산/제안 자동, 최종 확정은 Ops 승인
- High-risk change release: canary -> staged rollout -> full rollout
- 2인 승인(제품+기술), 롤백 체크리스트, 배포 전후 자동 비교 게이트
- Boundary ownership: Primary/Backup Owner + DAI 지정
- On-call/escalation chain + runbook 링크 필수

### Security, Compliance, and Lifecycle Additions

- 월간 감사 증빙 패키지(접근로그/권한변경/DSAR/이벤트 품질)
- RBAC 매트릭스 자동 테스트 + 금지 동작 회귀 테스트
- Data retention/deletion lifecycle 표준 + 삭제 전파 추적 + idempotent 처리
- 월간 분쟁 리허설 + Decision Evidence Snapshot + 증빙 추출 SLA

### Resilience and Drift Additions

- 복구 리허설 3종: 이벤트 유실, 알림 지연, 판단엔진 롤백
- fallback 진입/해제 수치 규칙
- 드리프트 대응 자동 체인: 경고 -> 제한 -> 롤백 후보
- SLI/SLO + error budget + RCA/후속조치 추적
## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SEO + app shell) based on project requirements analysis.

### Starter Options Considered

1. Next.js (create-next-app)
- App Router, SSR/SEO 친화, API 계층 포함, 하이브리드 웹 요구에 적합

2. Create T3 App
- TypeScript 생산성 우수, 다만 초기 운영 경계/규칙 결정 부담 증가

3. Vite + React
- 프론트 단독 출발은 빠르지만 SEO/SSR/운영 통합 요구 대응에 추가 조립 필요

4. NestJS Starter
- 백엔드 단독 스타터로는 유효하지만 현재 프로젝트의 앱+SEO 출발점으로는 단독 부적합

### Selected Starter: Next.js (create-next-app)

**Rationale for Selection:**
PreProduct는 SEO 페이지 + 앱 셸을 병행해야 하고, 판단 지원 UX/계측/운영 기능을 단계적으로 확장해야 한다.
Next.js는 초기 구조를 단순하게 유지하면서도 SSR, App Router, API 계층을 함께 가져갈 수 있어 요구 적합도가 가장 높다.

**Initialization Command:**

```bash
pnpm create next-app@latest preproduct --ts --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --no-tailwind
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript 기본
- Node.js 기반 Next.js 런타임

**Styling Solution:**
- Tailwind 미사용으로 시작
- 이후 MUI 중심 디자인 시스템 명시 적용

**Build Tooling:**
- Next.js 표준 빌드/번들링 경로

**Testing Framework:**
- 스타터 기본 테스트 러너 강제 없음
- 아키텍처 결정 단계에서 단위/통합/계약 테스트 체계 별도 고정 필요

**Code Organization:**
- `src/` 기반 App Router 구조

**Development Experience:**
- TypeScript + ESLint + CLI 초기화 기반 개발 경험

### Alternative Path (Deferred)

- Rails 경로는 참고 옵션으로 유지하되 현재 단계에서는 미채택
- 백오피스 성격 기능은 우선 동일 코드베이스 운영 모듈로 처리
- API 경계 복잡도가 임계치를 초과하면 성장 단계에서 `Next.js + dedicated backend` 분리 검토

**Note:** Project initialization using this command should be the first implementation story.
## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Runtime/Framework: Next.js + TypeScript
- Data Core: PostgreSQL + Prisma + Redis
- Auth Core: NextAuth/Auth.js (stable line)
- API Contracts: REST + OpenAPI + Event Contract
- Release Safety: canary -> staged -> full + auto-gates

**Important Decisions (Shape Architecture):**
- Metric Definition Registry as KPI source-of-truth
- Weekly Decision Engine: 계산/제안 자동, 최종 확정은 Ops 승인
- Default-deny access, reason code mandatory, audit-first
- Portability guardrail (90일 내 대체 배포 가능성)
- Perf+Cost dual gates and quality freeze rules

**Deferred Decisions (Post-MVP):**
- Rails path (reference only)
- Multi-DB/Multi-queue
- Dedicated backend split (trigger-based)

### Data Architecture

- Primary DB: PostgreSQL 18
- ORM: Prisma 7
- Cache/Queue: Redis 8.6 (single instance policy in MVP)
- Validation: Zod schema-first
- Migration: Prisma migration + pipeline verification
- Reprocessing/Backfill: 보관 정책 + 실행/검증 절차 고정

### Authentication & Security

- Auth: NextAuth/Auth.js stable line (v5 stable + migration guide 검증 시 재평가)
- Authorization: RBAC (`user` / `ops` / `partner`)
- Access Model: default deny + least privilege + TTL elevation
- Audit: 민감 접근 100% 로그, weekly sampling
- Policy: reason code 누락 시 조회 차단

### API & Communication Patterns

- External/Internal API: REST + OpenAPI
- Event Contract: 버전드 이벤트 네이밍/페이로드/호환 정책 + PRD canonical event 11종 매핑 유지
- Errors: 표준 코드 + 복구 가이드
- Rate limit: partner tier policy
- Contract tests: consumer-driven + OpenAPI conformance

### Frontend Architecture

- Next App Router + Server Components 우선
- Server Actions 우선, client state 최소화
- 핵심 여정 성능/접근성 게이트 고정
- Backoffice-like 운영 기능은 동일 코드베이스 모듈로 시작

### Infrastructure & Deployment

- Deployment strategy: canary -> staged -> full
- Gates: perf, cost, error-rate, allocation-consistency, alert-noise
- Rollback: auto-stop + stable candidate restore
- Portability: vendor-lock 제한 + quarterly portable deploy drill
- On-call: ownership/backup/DAI + runbook mandatory

### Governance, Reliability, and Experimentation

- SLO/Error budget + RCA follow-up tracking
- Recovery drills: 이벤트 유실 / 알림 지연 / 판단엔진 롤백
- Experiment contamination prevention: user-sticky allocation
- Allocation mismatch below threshold => experiment aggregation stop
- Feature-flag change-rate cap within decision window

### Cost and Quality Controls

- Unit cost metrics: decision card / alert / partner API
- Perf+Cost dual gate: 성능 통과라도 비용 급증 시 실패
- PR lightweight performance budgets + temporary exception expiry
- Invalid alert rate KPI + P1/P2/P3 severity and suppression windows

### Decision Record Table

| Decision | Version/Policy | Rationale | Impacted Components | Revisit Trigger |
|---|---|---|---|---|
| Next.js app starter | create-next-app latest | Hybrid SEO+app shell fit | FE, API edge, ops modules | Backend split trigger hit |
| PostgreSQL | 18 | Reliability + ecosystem | Core data, analytics base | scale/latency threshold |
| Prisma | 7 | TS integration + migration flow | data access layer | ORM limits on scale |
| Redis | 8.6 | cache/queue simplicity | alerts, caching, jobs | queue complexity threshold |
| Auth.js/NextAuth | stable line | stability-first | auth, RBAC, ops access | v5 stable + migration validated |
| API style | REST + OpenAPI + events | clear contracts | app API, partner API, pipelines | domain complexity shift |

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Next.js baseline
2. Define contracts (API/Event/Metric)
3. Set data/auth foundations
4. Implement quality gates + observability
5. Add ops/partner paths under guardrails

**Cross-Component Dependencies:**
- Metric Definition Registry drives dashboards, weekly engine, and quality freeze
- Auth/RBAC gates all ops and partner capabilities
- Event contract consistency is prerequisite for KPI trust
- Release gates bind platform, experimentation, and rollback safety
## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
10+ areas where AI agents could diverge and cause integration conflicts

### Naming Patterns

**Database Naming Conventions:**
- tables: `snake_case` plural
- columns: `snake_case`
- foreign keys: `<ref>_id`
- indexes: `idx_<table>_<columns>`

**API Naming Conventions:**
- endpoints: plural REST nouns
- external JSON/query: `camelCase`
- DB/internal persistence: `snake_case`

**Code Naming Conventions:**
- components: `PascalCase`
- component files: `kebab-case.tsx`
- functions/vars: `camelCase`
- env/constants: `UPPER_SNAKE_CASE`

### Structure Patterns

**Project Organization:**
- feature-first under `src/feature`
- shared utilities in `src/shared`
- domain logic in `src/domain`
- infra adapters/mappers in `src/infra`

**File Structure Patterns:**
- tests co-located (`*.test.ts`, `*.spec.ts`)
- contract tests: `tests/contracts`
- ops docs/runbooks: `docs/ops`

**Write Scope & Merge Order:**
- story-level write scope is mandatory
- shared hot files (`schema`, `contracts`, `env`) single-PR lock policy
- merge order: `contracts -> adapters -> handlers -> UI`

### Format Patterns

**API Response Formats:**
- success: `{ data, meta }`
- error: `{ error: { code, message, details?, requestId } }`
- datetime: ISO-8601 UTC string only

**Data Mapping Rule:**
- all casing translation via `infra/mapper`
- no ad-hoc casing conversion inside handlers/components

### Communication Patterns

**Event System Patterns:**
- naming: `domain.entity.action.vN`
- payload includes: `eventId`, `occurredAt`, `traceId`, `schemaVersion`
- version compatibility window must be declared

**State Management Patterns:**
- server state: fetch/cache layer
- client state: UI-local only
- immutable updates only

### Process Patterns

**Error Handling Patterns:**
- typed domain errors -> standardized API errors
- user-safe message and internal diagnostics separated
- retries only for idempotent operations

**Loading State Patterns:**
- `idle | loading | success | error`
- skeleton-first on primary views
- no infinite spinner without timeout/fallback

### Observability & Logging Patterns

- required log fields: `traceId`, `userId(hash)`, `eventId`, `component`, `severity`
- log schema single source: `docs/ops/log-schema.md`
- API `requestId` must correlate with log `traceId`

### Environment & Config Patterns

- env schema validation required at boot (fail-fast)
- `.env.example` treated as contract file
- env differences managed by explicit allowlist only

### Migration Patterns

- database changes follow `expand -> backfill -> contract`
- destructive changes require two-phase rollout
- daily integrated migration replay validation
- migration template must include purpose/rollback/affected tables

### UI Component Consistency Patterns

- shared UI components require contract template (props/state variants/a11y rules)
- domain component path: `feature/<domain>/components`
- shared component path: `shared/ui`
- shared component direct edits require owner approval
- shared component changes require visual + a11y smoke checks

### API Version Lifecycle Patterns

- lifecycle states: `active -> deprecated -> sunset`
- version doc template: changes/impact/migration
- compatibility tests maintained during deprecated
- pre-sunset simulated disable drill required

### Enforcement Guidelines

**All AI Agents MUST:**
- follow contract-first updates (API/Event/Metric)
- pass lint/type/tests/contract gates before merge
- follow write scope and naming/format patterns

**Pattern Exceptions:**
- allowed only with ADR link + owner + expiry date

**Pattern Enforcement:**
- PR checklist contains pattern gates
- violations tracked as architecture debt
- recurring violations trigger pattern revision ADR

### Pattern Examples

**Good Examples:**
- `decision.card.generated.v1` event with versioned payload
- `GET /decision-cards?userId=...` -> `{ data, meta }`
- DB table `user_intents`, column `intent_maturity`

**Anti-Patterns:**
- non-versioned event payload changes
- endpoint-specific custom error shapes
- mixed casing without mapper boundary
- edits outside declared write scope
## Project Structure & Boundaries

### Complete Project Directory Structure

preproduct/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .env.example
├── .env.local
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── contract-check.yml
│       └── perf-budget.yml
├── docs/
│   ├── architecture/
│   │   ├── adr/
│   │   ├── boundary-catalog.md
│   │   └── glossary.md
│   └── ops/
│       ├── index.md
│       ├── runbooks/
│       ├── log-schema.md
│       ├── incident-templates.md
│       └── asset-registry.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── contracts/
│   │   ├── partner-v1/
│   │   └── internal-events/
│   ├── integration/
│   │   ├── migrations/
│   │   ├── policy-ops/
│   │   └── policy-partner/
│   ├── e2e/
│   └── fixtures/
├── public/
│   └── assets/
│       ├── brand/
│       ├── icons/
│       └── images/
└── src/
    ├── app/
    │   ├── (marketing)/
    │   ├── (app)/
    │   ├── api/
    │   │   ├── intents/route.ts
    │   │   ├── decision-cards/route.ts
    │   │   ├── events/route.ts
    │   │   ├── ops/kpi/route.ts
    │   │   └── partner/v1/signals/route.ts
    │   ├── layout.tsx
    │   └── globals.css
    ├── domain/
    │   ├── intent/
    │   ├── decision/
    │   ├── hold-revisit/
    │   ├── experiment/
    │   └── partner/
    ├── infra/
    │   ├── db/
    │   ├── cache/
    │   ├── mapper/
    │   ├── metrics/
    │   │   └── pipeline/
    │   ├── events/
    │   └── auth/
    │       └── policies/
    │           ├── ops.ts
    │           └── partner.ts
    ├── feature/
    │   ├── intent/components/
    │   ├── decision/components/
    │   ├── hold/components/
    │   ├── ops/components/
    │   └── partner/components/
    ├── shared/
    │   ├── ui/
    │   ├── contracts/
    │   ├── errors/
    │   ├── observability/
    │   ├── config/
    │   └── assets/
    └── middleware.ts

### Architectural Boundaries

- API 경계: `/api/ops/*` 와 `/api/partner/v1/*`는 별도 policy middleware 체인
- 레이어 경계: `feature -> domain -> infra`만 허용, `feature -> infra` 직접 import 금지
- 매핑 경계: DTO/Domain/DB 변환은 `src/infra/mapper` 전용
- 지표 경계: 집계 실행은 `src/infra/metrics/pipeline/*`, 조회는 `src/app/api/ops/kpi/*`

### Requirements to Structure Mapping

- Intent/Goal: `feature/intent`, `domain/intent`, `/api/intents`
- Decision: `feature/decision`, `domain/decision`, `/api/decision-cards`
- Hold/Revisit: `feature/hold`, `domain/hold-revisit`
- Ops/Guardrail: `feature/ops`, `/api/ops/*`, `infra/metrics`
- Partner: `feature/partner`, `/api/partner/v1/*`, `domain/partner`

### Integration Points

- 내부 통신 순서: `contracts -> adapters -> handlers -> UI`
- 이벤트 규약: `domain.entity.action.vN`
- 데이터 흐름: UI -> API -> domain -> infra -> DB/Cache/Event

### File Organization Patterns

- env 계약: `.env.example`
- 운영 문서 허브: `docs/ops/index.md`
- 자산 참조: `@/shared/assets/*` 래퍼 경유

### Development Workflow Integration

- CI 게이트: lint/type/tests/contracts/perf-budget
- 배포: canary -> staged -> full
- 롤백: gate 기반 auto-stop + stable restore 후보
## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Next.js + TypeScript + Prisma + PostgreSQL + Redis 조합은 충돌 없이 정합
- Auth/RBAC/Policy 분리와 API 경계(`/ops`, `/partner`) 일관
- release gates/quality freeze/fallback/portability 규칙 상호 모순 없음

**Pattern Consistency:**
- naming/format/structure 규칙이 DB/API/code/event 전반에 일관 적용 가능
- mapper 경계, write scope, contract-first merge order로 병렬 충돌 방지 가능

**Structure Alignment:**
- 프로젝트 트리가 domain/infra/feature/shared 경계를 물리적으로 반영
- metrics pipeline/policy/contracts/test 분리로 운영 경계 충족

### Requirements Coverage Validation ✅

**Functional Coverage:**
- Intent/Decision/Hold/Ops/Partner FR 카테고리 모두 대응 모듈/엔드포인트 매핑 완료

**Non-Functional Coverage:**
- 성능: p95/PR budget/rollout gates 반영
- 보안: default deny/RBAC/audit/reason code/TTL elevation 반영
- 신뢰성: drill/RPO-RTO/fallback/rollback 반영
- 접근성: 핵심 여정 게이트 반영
- 실험 신뢰성/비용 가드레일 반영

### Implementation Readiness Validation ✅

**Decision Completeness:**
- 핵심 결정/버전/재검토 트리거 문서화 완료

**Structure Completeness:**
- 실행 가능한 디렉토리/테스트 구조 구체화 완료

**Pattern Completeness:**
- conflict 포인트 및 강제 규칙/예외 규칙(ADR+owner+expiry) 포함

### Gap Analysis Results

**Critical Gaps:** 없음

**Important Gaps:**
- 일부 임계치(알람 suppression window, perf budget 수치)는 초기 운영 데이터 기반 캘리브레이션 필요

**Nice-to-Have Gaps:**
- Boundary catalog와 code-owner 자동화 연계 시 운영 효율 추가 개선 가능

### Validation Issues Addressed

- ops/partner 정책 경계 분리 반영
- import boundary/merge order/write scope 반영
- migration/contract/env/logging drift 방지 규칙 반영
- 문서-코드 동기화 규칙(릴리즈 영향 업데이트/핵심파일군 링크 갱신) 반영

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analyzed
- [x] Scale/complexity assessed
- [x] Constraints and cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented
- [x] Tech stack and boundaries specified
- [x] Integration and rollout safety defined

**✅ Implementation Patterns**
- [x] Naming/structure/format/communication rules defined
- [x] Process and enforcement rules documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Requirements mapped to concrete locations
- [x] Integration points and boundaries defined

### Implementation Go Criteria

- Contract tests baseline pass
- Boundary lint rules pass
- Initial thresholds configured for performance/cost/allocation consistency
- Epic 1 Story 1.4 baseline gate(lint/typecheck/unit/contract/perf-budget) configured and blocking

### Residual Risk

- 초기 임계치 값은 1~2주 실측 기반 재조정 필요

### Architecture Readiness Assessment

**Overall Status:** READY (Go with monitored thresholds)

**Confidence Level:** High

### Implementation Handoff

**AI Agent Guidelines:**
- 문서의 경계/패턴/게이트를 우선 규칙으로 적용
- contract-first 변경 순서 준수
- 예외는 ADR+owner+expiry 없이 금지

**First Implementation Priority:**
- `pnpm create next-app@latest preproduct --ts --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --no-tailwind`

## Round 2 Label Harmonization (2026-04-07)

### Active MVP

- In this document, Active MVP means the authoritative implementation scope for the current sprint.

### Deferred P1.5+

- In this document, Deferred P1.5+ means design is retained, but implementation is postponed.

### Legacy Reference

- Existing extended or historical narratives are treated as Legacy Reference.
- If any conflict exists, Active MVP and Deferred P1.5+ take precedence.

## Correct Course Baseline (2026-04-07 revised-minimal)

### Trigger and Scope Decision

- Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-07-needs-work.md`
- Approved pivot: "복합 판단 플랫폼 MVP" -> "단순 중고거래 + AI 보조 3기능 MVP"
- Principle: 기존 아키텍처 자산은 유지, MVP 구현 경계만 축소

### Technology Version Re-Verification (2026-04-07)

- Next.js: 16.x 라인 기준 (Next.js 16.2 공지 반영)
- PostgreSQL: 18 메이저 라인 유지
- Prisma: 7.x 라인 유지 (7.x 릴리즈 라인 확인)
- Redis: 8.x 라인 유지
- Auth: NextAuth/Auth.js는 stable line 우선 (beta는 P1.5+ 재평가)

### Revised MVP Architectural Boundaries

**Active in MVP (Now):**
- Listing Service (상품 등록/조회/수정)
- Image Analysis Adapter (이미지 -> 제목/카테고리/핵심정보 자동추출)
- Pricing Engine (초기 추천가 + 시간기반 자동가격조정 규칙)
- Basic Auth + Ownership Policy (판매자 본인 리스팅 관리)
- Minimal Event Tracking (핵심 3~4개 이벤트)

**Deferred to P1.5+ (Design Kept, Implementation Disabled):**
- 고급 Signal/Alert 운영 체계
- 실험/드리프트 자동 판정 체계
- 운영 콘솔 고도화
- 파트너 API/연동 게이트웨이
- 고급 Guardrail 및 자동 품질 Freeze

### Decision Deltas

### API and Contract Delta

- MVP API는 Listing/AI-Assist/Pricing-Adjust 중심으로 최소화
- Event contract는 MVP 최소 이벤트로 축소:
  - `listing.created.v1`
  - `ai.extraction.reviewed.v1`
  - `pricing.suggestion.accepted.v1`
  - `pricing.auto_adjust.applied.v1`
- 기존 광범위 이벤트/리포팅 계약은 P1.5+에서 단계적 재도입

### Data and Domain Delta

- 도메인 우선순위를 `listing`, `ai-extraction`, `pricing-adjustment`로 재정렬
- 실험/운영/파트너 관련 스키마는 즉시 구현하지 않고 placeholder 경계만 유지
- 가격조정 규칙은 정책 파라미터화:
  - `N일 주기`, `인하율(%)`, `최저가 하한`

### Structure Delta

- MVP 우선 경로:
  - `src/domain/listing`
  - `src/domain/ai-extraction`
  - `src/domain/pricing`
  - `src/app/api/listings/*`
  - `src/app/api/ai/*`
  - `src/app/api/pricing/*`
- Ops/Partner/Experiment 경로는 폴더/계약 스켈레톤만 유지하고 feature flag off

### Updated MVP Quality Gates

- 등록 완료율(태스크 테스트): `>= 70%`
- AI 제안 수용률: `>= 50%`
- 필수 필드 판독 정확도: `>= 85%`
- 자동 가격조정 실패율: `< 1%`
- 판독 실패시 수동입력 fallback E2E 통과율: `100%`

### Re-Baselined Implementation Priority

1. Listing 기본 CRUD + 소유권 정책
2. 이미지 판독 어댑터 + 검토/수정 UI
3. 추천가 제안 + 자동 가격조정 스케줄러
4. MVP 최소 이벤트 계측/대시보드
5. P1.5+ 경계(Ops/Experiment/Partner) 재도입 로드맵 확정

## Analysis Restart Baseline (2026-04-07 approved)

- 승인 문서: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-04-07-analysis-restart.md`
- 아키텍처 결정 상태:
  - `implemented baseline` -> `proposed baseline`
- 재검증 항목:
  - 기술 스택 유지/변경 필요성
  - MVP 경계의 복잡도/운영비용 정합성
  - 이벤트/계약 최소셋 재정의 적합성
- 재개 규칙:
  - 분석 재시작 선행 단계 완료 및 `[IR]` 승인 전에는 구현 강제 문구를 실행 기준으로 사용하지 않는다.

