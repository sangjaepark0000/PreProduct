# Story A0: Starter Template 초기화 + CI 품질게이트 baseline

Status: done

## Story

As a 개발팀,  
I want MVP 구현 시작 전에 실행 환경과 필수 품질게이트를 고정하고,  
so that 이후 스토리 구현이 동일 기준에서 안전하게 진행되길 원한다.

## Acceptance Criteria

1. **Given** 프로젝트 기본 실행 환경이 준비되어 있을 때  
   **When** baseline 검증 파이프라인을 실행하면  
   **Then** `pnpm lint`, `pnpm typecheck`, `pnpm test:contracts`가 모두 성공해야 한다.
2. **And** 실패 시 merge가 차단되는 규칙이 문서화되어야 한다.
3. **And** 저장소 표준 Required checks(`lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget`)가 문서와 CI 정의에서 일치해야 한다.
4. **And** `.env.example`의 필수 키와 실행 스크립트가 최신 상태여야 한다.

## Error / Recovery Criteria

- baseline 게이트 실패 시 A1 착수를 차단하고 실패 원인을 우선 복구한다.
- 계약 테스트 실패 시 이벤트/API 계약 문서와 구현 차이를 먼저 해소한다.

## Story DoD

- 기능: 스타터/실행 스크립트/기본 정책 정합성 고정
- 테스트: `lint/typecheck/contracts` baseline 통과
- 계측: A1 이후 이벤트 계측 구현을 위한 계약 검증 경로 확보
- 문서: 개발 시작 가이드와 품질게이트 규칙 업데이트

## Tasks / Subtasks

- [x] 1) Starter 템플릿/런타임 기준선 점검 및 고정 (AC: 1, 3)
- [x] `preproduct/package.json` 스크립트(`lint`, `typecheck`, `test:contracts`)와 의존성 기준선 재검증
- [x] `.env.example` 필수 키 존재 및 README 환경설정 가이드 정합성 확인
- [x] Next.js App Router/TypeScript/ESLint 초기 골격이 현재 아키텍처 문서 경계와 충돌 없는지 확인

- [x] 2) CI baseline 게이트 보장 (AC: 1, 2)
- [x] `preproduct/.github/workflows/ci.yml`에서 `lint`, `typecheck`, `contracts` 게이트 실행 경로 확인
- [x] A0 최소 완료 기준은 `lint/typecheck/contracts` 3게이트로 유지하되, 저장소 Required checks 표준은 `lint/typecheck/unit/contracts/e2e/perf-budget` 6게이트로 문서화
- [x] PR merge 차단 규칙(Required checks: `lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget`) 문서화
- [x] 계약 테스트 실패/타입 오류/린트 오류가 exit code 1로 차단되는지 확인

- [x] 3) 문서 및 실행 가이드 최신화 (AC: 2, 3)
- [x] `preproduct/README.md`에 baseline 게이트 목적/실행 순서/실패 복구 절차 반영
- [x] 로컬 재현 최소 명령(`pnpm lint`, `pnpm typecheck`, `pnpm test:contracts`)을 명확히 유지
- [x] Branch Protection 또는 동등 정책 적용 필요조건을 명시
- [x] Legacy 스토리 표기(예: Story 1.4)와 A0 실행 기준 표기 혼재 여부를 정리

- [x] 4) 검증 증적 확보 (AC: 1~3)
- [x] 로컬에서 `pnpm lint` 실행/성공
- [x] 로컬에서 `pnpm typecheck` 실행/성공
- [x] 로컬에서 `pnpm test:contracts` 실행/성공
- [x] 결과와 차단정책 확인 내용을 스토리 문서 Completion Notes에 기록

### Review Findings

- [x] [Review][Patch] Idempotency lock stale-cleanup가 활성 락을 중간 삭제할 수 있음 [src/domain/intent/idempotency-key-lock.ts:33]
- [x] [Review][Patch] Idempotency lock 대기 제한(5초)로 정상 재시도 요청이 500/503으로 실패할 수 있음 [src/domain/intent/idempotency-key-lock.ts:7]
- [x] [Review][Patch] `trustFreshnessHours` 소수 입력을 `Math.floor`로 절삭해 stale 판정이 누락될 수 있음 [src/domain/decision/decision-card-validator.ts:100]
- [x] [Review][Patch] 신규 결정 카드 환경변수(`ALLOW_DECISION_TRUST_FRESHNESS_OVERRIDE`, `TRUST_FRESHNESS_STALE_HOURS`)가 `.env.example`/README 환경 계약에 반영되지 않음 [README.md:27]

## Dev Notes

### Epic Context

- 본 스토리는 Epic A의 실행 잠금 해제 스토리다. A0 완료 전에는 A1(Listing CRUD) 구현을 시작하지 않는다.
- 현재 스프린트 실행 기준은 `Epic A~C`이며 Legacy Epic 1~7은 참조 전용이다.
- A0의 목적은 기능 추가가 아니라 이후 모든 스토리에 공통 적용될 품질 하한선 고정이다.

### Architecture Compliance (Must Follow)

- 기술 기준선: Next.js + TypeScript + PostgreSQL + Prisma + Redis + Auth.js/NextAuth
- API/이벤트 계약은 버전드 규칙을 유지하고, 계약 실패는 빌드를 차단한다.
- 경계 규칙: `feature -> domain -> infra`, 매핑은 `src/infra/mapper` 전용.
- CI/배포 가드레일: 게이트 실패 시 merge 차단 원칙 유지.
- `.env.example`는 환경 계약 파일로 취급하고 변경 시 문서 동기화 필수.

### Current Codebase Intelligence

- 앱 저장소는 `preproduct/` 하위에 존재하며, 현재 `package.json` 스크립트에 baseline 3종 게이트가 이미 정의되어 있다.
- `preproduct/.github/workflows/ci.yml`는 `lint`, `typecheck`, `contracts`를 포함한 CI job을 구성한다.
- 최근 커밋은 CI baseline 보강(`a936819`)과 초기 앱 생성(`20fab5f`)으로, A0 목적과 직접 일치한다.

### Technical Requirements

- A0 최소 완료 기준(스토리 수준)은 `pnpm lint`, `pnpm typecheck`, `pnpm test:contracts` 3종으로 정의한다.
- 저장소 머지 차단 기준(브랜치 보호 수준)은 `lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget` 6게이트를 기본으로 한다.
- 실패는 "경고"가 아니라 merge 차단 조건으로 운영한다.
- 계약 테스트는 `tests/e2e/*.contract.spec.ts` 패턴을 기본 포함해야 한다.
- `.env.example` 변경 시 README 환경설정 섹션과 동시 업데이트한다.

### File Structure Requirements

- 우선 확인/수정 대상:
- `preproduct/package.json`
- `preproduct/.github/workflows/ci.yml`
- `preproduct/README.md`
- `preproduct/.env.example`
- `preproduct/scripts/run-e2e-ci.mjs` (계약 테스트 실행 경로 영향 시)

- 산출물 위치:
- `_bmad-output/implementation-artifacts/a0-starter-template-ci-baseline.md`

### Testing Requirements

- A0 완료 검증(필수 3종): `pnpm lint`, `pnpm typecheck`, `pnpm test:contracts`
- 저장소 게이트 정합성 검증(필수): CI job/Required checks가 `lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget`로 일치하는지 확인
- 실패 시 CI 상태가 failed로 표시되고 merge가 차단되는지 확인
- 계약 테스트가 실제 계약 스펙 파일을 대상으로 실행되는지 확인

### Latest Technical Information (Project-Verified)

- 아키텍처 기준선(타깃, 2026-04-07 재검증):
  - Next.js 16.x 라인
  - Prisma 7.x 라인
  - Redis 8.x 라인
  - PostgreSQL 18 라인
- 현재 저장소 설치 의존성(`preproduct/package.json` 기준):
  - `next@16.2.2`
  - `react@19.2.4`
  - `@playwright/test@1.59.1`
- 주의: Prisma/Redis/PostgreSQL 런타임 도입은 후속 스토리에서 반영되며, 본 A0는 CI/품질게이트 기준선 고정 범위에 집중한다.

### Project Context Reference

- `project-context.md`는 현재 워크스페이스에서 발견되지 않았다.
- 본 스토리는 `epics.md`, `architecture.md`, `prd.md`, `ux-design-specification.md` 기준으로 작성했다.

### References

- `_bmad-output/planning-artifacts/epics.md` (Correct Course Addendum, Epic A, Story A0)
- `_bmad-output/planning-artifacts/architecture.md` (Core Architectural Decisions, Quality Gates, Correct Course Delta)
- `_bmad-output/planning-artifacts/prd.md` (MVP scope, FR27, NFR18)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (MVP UX scope override, Interaction Rules)
- `preproduct/package.json`
- `preproduct/.github/workflows/ci.yml`
- `preproduct/README.md`

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `_bmad/bmm/config.yaml` 로드: 언어 설정(한국어) 및 artifact 경로 확인
- `sprint-status.yaml` 전체 로드: 첫 ready-for-dev 스토리 `a0-starter-template-ci-baseline` 확인 후 `in-progress` 반영
- planning artifacts 로드:
  - `epics.md`
  - `architecture.md`
  - `prd.md`
  - `ux-design-specification.md`
- implementation artifacts 패턴 비교:
  - `1-4-ci-cd-계약검증-성능예산-baseline-구축.md`
  - `2-1-선택지-산출-api와-설명-가능한-판단-데이터-계약.md`
- git 로그 확인(`preproduct/`):
  - `a936819` feat(ci): baseline quality gates and perf budget guardrails
  - `20fab5f` Initial commit from Create Next App
- 검증 실행:
  - `pnpm lint` 성공
  - `pnpm typecheck` 성공
  - `pnpm test:contracts` 성공 (14 passed)
  - `pnpm test:unit` 성공
  - `pnpm test:e2e:ci` 성공 (40 passed)
  - `pnpm ci:perf-budget` 성공 (`count=40 max=1465ms p95=1175ms total=11533ms`)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Epic A Story A0에 필요한 baseline 게이트/문서/환경 계약 고정 지침을 스토리 문서로 작성했다.
- 실행 기준이 Legacy가 아닌 Epic A~C임을 스토리 가드레일에 반영했다.
- CI baseline과 로컬 실행 경로의 차단 조건을 구현 태스크와 검증 태스크로 분리했다.
- `preproduct/README.md`에 Required checks 6종, Legacy 표기 정리, 실패 시 non-zero 종료(merge 차단) 규칙을 명시했다.
- A0 필수 게이트(`lint`, `typecheck`, `test:contracts`)와 전체 회귀 게이트(`unit`, `e2e`, `perf-budget`)를 모두 실행하여 통과를 확인했다.

### File List

- _bmad-output/implementation-artifacts/a0-starter-template-ci-baseline.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- preproduct/README.md

## Change Log

- 2026-04-07: Story A0 컨텍스트 문서 생성 및 sprint-status 상태 전환 준비 완료.
- 2026-04-07: Story A0 구현 완료. CI/문서 기준선 검증 및 로컬 게이트 실행 증적 반영, 상태 `review`로 전환.
