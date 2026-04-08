# Story 1.1: Next.js 기반 초기 제품 골격 구축

Status: done

## Story

As a 제품팀,
I want 아키텍처 기준 스타터 템플릿으로 프로젝트를 초기화하고 핵심 경계를 정의하고,
so that 이후 사용자 기능을 일관된 구조에서 안전하게 구현할 수 있다.

## Acceptance Criteria

1. Given 신규 저장소 상태에서, When 지정된 Next.js 초기화 명령으로 프로젝트를 생성하면, Then TypeScript/App Router/src 구조가 생성되어야 한다.
2. feature/domain/infra/shared 경계가 구조에 반영되고 기본 lint/typecheck가 통과해야 한다.
3. 개발자가 첫 사용자 여정(진입 -> 의향 입력 -> 판단 카드)을 바로 구현/검증 가능한 실행 환경이 준비되어야 한다.

## Tasks / Subtasks

- [x] 실행 환경 사전 검증
- [x] Node.js `>= 20.9` 확인 (Next.js 설치 최소 요구사항)
- [x] `pnpm -v` 확인 및 lockfile 생성 도구를 pnpm으로 고정
- [x] 대상 디렉터리 결정: 부모 경로에서 `preproduct` 폴더 생성할지, 현재 폴더를 바로 초기화할지 먼저 확정

- [x] 프로젝트 베이스라인 스캐폴딩
- [x] `pnpm create next-app@latest preproduct --ts --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --no-tailwind` 실행
- [x] 루트/앱 구조를 아키텍처 표준으로 정렬 (`src/app`, `src/domain`, `src/infra`, `src/feature`, `src/shared`)
- [x] 기본 페이지/레이아웃 진입 경로 준비 (`src/app/layout.tsx`, `src/app/(app)` 그룹)

- [x] 경계/규약 가드레일 반영
- [x] 네이밍 규칙 적용: 컴포넌트 `PascalCase`, 파일 `kebab-case.tsx`, 함수/변수 `camelCase`
- [x] API/데이터 포맷 규칙 초안 반영: success `{ data, meta }`, error `{ error: { code, message, details?, requestId } }`
- [x] 케이싱 변환은 `infra/mapper` 경계에서만 수행하도록 기본 유틸 위치 확정

- [x] 품질 게이트 최소선 준비
- [x] `package.json`에 `typecheck` 스크립트(`tsc --noEmit`)를 명시해 lint와 별도 게이트로 고정
- [x] lint/typecheck 스크립트 및 CI baseline 통과 확인
- [x] Story 1.4에서 확장될 계약검증/성능예산 게이트를 고려한 워크플로우 자리 확보 (`.github/workflows`)
- [x] `.env.example`를 계약 파일로 생성하고 부트 시점 검증 전략 명시

- [x] 첫 사용자 여정 착수 가능 상태 검증
- [x] 진입 -> 의향 입력 -> 판단 카드 흐름을 구현할 폴더/라우트 골격만 먼저 준비
- [x] Journey 1 구현 시 필요한 컴포넌트 배치 경로 확정 (`feature/intent`, `feature/decision`)
- [x] 스모크 기준: 앱 실행, 핵심 라우트 진입, lint/typecheck 성공

### Review Findings

- [x] [Review][Decision] `mapKeysSnakeToCamel`의 변환 깊이 계약 불명확 — **결정 완료:** Story 1.1 범위에서는 top-level 전용으로 명시하고 유지. 근거: `preproduct/src/infra/mapper/case-mapper.ts:7`
- [x] [Review][Decision] snake->camel 키 충돌 시 정책 미정의 — **결정 완료:** 충돌 시 예외를 던져 조기 실패 처리. 근거: `preproduct/src/infra/mapper/case-mapper.ts:8`
- [x] [Review][Patch] 필수 환경변수 누락 시 루트 레이아웃 단계에서 앱 부팅이 즉시 실패할 수 있음 [preproduct/src/shared/config/env.ts:1]
- [x] [Review][Patch] Playwright `reuseExistingServer: true`로 인해 포트 3000 기존 프로세스에 잘못 붙는 오탐/누락 위험 [preproduct/playwright.config.ts:13]
- [x] [Review][Patch] Story 1.1 금지사항(UX 상세 컴포넌트 선구현 금지)과 달리 `DecisionCard` UI를 선구현함 [preproduct/src/feature/decision/components/decision-card.tsx:1]

## Dev Notes

### Business and Scope Context

- 이 스토리는 Epic 1의 시작점이며, 이후 Story 1.2/1.3 기능 구현의 구조적 기반을 만든다.
- 릴리즈 맵 기준 Story 1.1의 1차 KPI는 `탐색 시간 절감률(기반), 계측 품질`이다.
- 스코프는 "기능 완성"이 아니라 "안전한 초기 구조 + 게이트 가능한 개발 토대"다.

### Technical Requirements (Must Follow)

- 프레임워크: Next.js(App Router) + TypeScript 조합 유지.
- 런타임 기준: Node.js `>= 20.9` (Next.js 설치 요구사항).
- 구조 경계: feature/domain/infra/shared를 물리 디렉터리로 분리.
- 내부 통신 순서 준수: `contracts -> adapters -> handlers -> UI`.
- 이벤트/계약 확장 대비: 공통 필드(`eventId`, `occurredAt`, `traceId`, `schemaVersion`)를 수용할 위치를 선반영.
- 공유 hot file(`schema`, `contracts`, `env`)는 추후 단일 PR 잠금 정책을 고려해 변경 지점을 최소화.
- `create-next-app` 실행 전 작업 디렉터리를 명확히 고정해 잘못된 중첩 폴더 생성을 방지한다.
- 케이싱 변환 유틸은 `src/infra/mapper` 경계 밖에 생성하지 않는다.

### Architecture Compliance Checklist

- [ ] 아키텍처 디렉터리 구조와 실제 초기 코드 트리가 충돌하지 않는다.
- [ ] 네이밍/포맷/통신 패턴이 코드 컨벤션으로 문서화되어 있다.
- [ ] CI 최소 게이트(lint/type/tests/contracts/perf-budget) 중 Story 1.1 범위인 lint/type 기본선이 활성화되어 있다.
- [ ] Story 1.4에서 품질 게이트를 blocking으로 강화할 수 있도록 워크플로우 파일 위치/명명 규칙이 정합하다.

### File Structure Requirements

- 예상 생성/정렬 파일
- 폴더 생성 규칙
- 신규 폴더 생성 방식인 경우: `preproduct/*` 경로에 생성
- 현재 폴더 직접 초기화 방식인 경우: 루트 경로에서 동일 구조로 생성 (`src/*`, `.github/workflows/*` 등)
- `preproduct/package.json`
- `preproduct/tsconfig.json`
- `preproduct/eslint.config.mjs`
- `preproduct/.env.example`
- `preproduct/.github/workflows/ci.yml` (baseline)
- `preproduct/src/app/layout.tsx`
- `preproduct/src/app/(app)/...`
- `preproduct/src/domain/`
- `preproduct/src/infra/`
- `preproduct/src/feature/`
- `preproduct/src/shared/`

### Testing Requirements

- 최소 통과 조건
- lint 성공
- typecheck 성공
- 앱 실행 스모크 성공
- 핵심 라우트(진입 경로) 로드 성공
- CI baseline(`.github/workflows/ci.yml`)에서 lint/typecheck가 실패 시 차단 동작 확인

- 금지 사항
- 계약/성능예산 게이트를 Story 1.1에서 완성하려고 과도 확장하지 않는다.
- UX 상세 컴포넌트(DecisionCard/FitCriteriaPanel/ActionDecisionBar)까지 미리 구현하지 않는다.

### UX Alignment Notes

- UX 문서 기준 초기 진입 경험은 "부담 없이 탐색 시작"을 지향하므로, 첫 화면 구조는 이후 목적/상품 명확도 진단 플로우(Story 1.2)를 수용 가능해야 한다.
- 컴포넌트 배치 시 `feature/intent`, `feature/decision`의 확장을 가정한 경계 분리를 유지한다.

### Project Context Reference

- `docs` 경로는 존재하지만 `project-context.md`는 현재 확인되지 않았다.
- 따라서 본 스토리는 planning artifacts(EPIC/PRD/Architecture/UX) 기준으로 작성되었다.

### References

- Epic/Story 정의: `_bmad-output/planning-artifacts/epics.md` (Epic 1, Story 1.1)
- 릴리즈/KPI 맵: `_bmad-output/planning-artifacts/epics.md` (Story Release & KPI Map)
- 아키텍처 패턴/구조/게이트: `_bmad-output/planning-artifacts/architecture.md` (Naming Patterns, Structure Patterns, Complete Project Directory Structure, Development Workflow Integration, Implementation Go Criteria)
- 제품/기술 제약 및 NFR: `_bmad-output/planning-artifacts/prd.md` (Technical Constraints, Web App Specific Requirements, Non-Functional Requirements)
- UX 확장 방향: `_bmad-output/planning-artifacts/ux-design-specification.md` (User Journey Flows, Component Strategy, Implementation Guidelines)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Git 저장소 부재로 커밋 히스토리 분석은 생략됨.
- `pnpm` 미설치 상태를 확인하고 `npm install -g pnpm`으로 복구.
- 샌드박스 네트워크 제한으로 `create-next-app` 실패(EACCES) 후 권한 승격 실행으로 스캐폴딩 완료.
- `.next` 타입 캐시가 삭제된 `src/app/page.tsx`를 참조해 `typecheck` 실패, `next typegen`으로 재생성.
- Google Font fetch 실패를 제거하기 위해 `next/font/google` 의존을 제거.
- `pnpm build`의 샌드박스 `spawn EPERM` 이슈를 권한 승격 실행으로 검증 완료.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Sprint status updated: `epic-1 -> in-progress`, `1-1-next-js-기반-초기-제품-골격-구축 -> ready-for-dev`
- Story 1.1 구현 완료: `preproduct/` 하위 Next.js(App Router + TS + src) 초기화 및 아키텍처 경계 디렉터리 정렬.
- API 응답 규약 타입(`success/error`)과 이벤트 공통 필드 계약 타입을 `src/shared/contracts`에 반영.
- 케이싱 변환 유틸을 `src/infra/mapper/case-mapper.ts`로 고정 배치.
- 첫 사용자 여정 골격 라우트(`/`, `/intent`, `/decision`) 및 `feature/intent`, `feature/decision` 컴포넌트 경로 확정.
- `.env.example` 계약 파일 + `src/shared/config/env.ts` 부트 시점 환경 검증 전략 적용.
- CI baseline 워크플로우(`.github/workflows/ci.yml`) 추가, lint/typecheck 게이트와 Story 1.4 확장 슬롯 확보.
- 검증 완료: `pnpm lint`, `pnpm typecheck`, `pnpm build` 통과.

### File List

- _bmad-output/implementation-artifacts/1-1-next-js-기반-초기-제품-골격-구축.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- preproduct/.env.example
- preproduct/.github/workflows/ci.yml
- preproduct/package.json
- preproduct/src/app/layout.tsx
- preproduct/src/app/globals.css
- preproduct/src/app/(app)/layout.tsx
- preproduct/src/app/(app)/page.tsx
- preproduct/src/app/(app)/intent/page.tsx
- preproduct/src/app/(app)/decision/page.tsx
- preproduct/src/domain/README.md
- preproduct/src/feature/README.md
- preproduct/src/feature/intent/components/intent-form.tsx
- preproduct/src/feature/decision/components/decision-card.tsx
- preproduct/src/infra/README.md
- preproduct/src/infra/mapper/case-mapper.ts
- preproduct/src/shared/README.md
- preproduct/src/shared/config/env.ts
- preproduct/src/shared/contracts/api-response.ts
- preproduct/src/shared/contracts/event-envelope.ts
- preproduct/src/app/page.tsx (deleted)
- preproduct/src/app/page.module.css (deleted)

## Change Log

- 2026-04-06: Story 1.1 구현 완료. Next.js 스캐폴딩, 아키텍처 경계 정렬, 규약/환경/CI baseline 적용, 여정 골격 라우트 및 스모크 검증 반영.
