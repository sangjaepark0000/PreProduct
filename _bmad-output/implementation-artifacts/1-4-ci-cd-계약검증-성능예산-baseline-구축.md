# Story 1.4: CI/CD + 계약검증 + 성능예산 Baseline 구축

Status: done (policy decision: AC6 is tracked as pre-production operational blocker)

## Story

As a 개발팀,
I want Greenfield 초기 단계에서 CI/CD 품질 게이트와 계약검증/성능예산 baseline을 구성하고,
so that 이후 스토리 구현이 일관된 품질 기준을 자동으로 충족하도록 보장할 수 있다.

## Acceptance Criteria

1. **Given** 메인 브랜치 대상 Pull Request가 생성되거나 메인 브랜치에 변경이 발생했을 때  
   **When** CI 파이프라인이 실행되면  
   **Then** `lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget` 게이트가 모두 실행되어야 한다.
2. **Given** 계약 테스트 또는 성능예산 검사가 실패했을 때  
   **When** CI가 완료되면  
   **Then** 해당 PR은 merge 가능 상태가 되면 안 되며(필수 체크 실패), 원인 로그를 확인할 수 있어야 한다.
3. 성능예산 게이트는 Playwright JSON 리포트(`test-results/playwright-report.json`)를 입력으로 사용하고, 예산값은 환경변수(`CI_MAX_TEST_DURATION_MS`, `CI_P95_TEST_DURATION_MS`, `CI_TOTAL_DURATION_MS`)로 조정 가능해야 한다.
4. 계약검증은 Story 1.3에서 정의/구현된 의향 저장 계약 테스트(`tests/e2e/intent-record-api.contract.spec.ts`)를 기본 게이트로 포함해야 한다.
5. CI baseline 변경은 기존 진단/의향 저장 핵심 플로우 회귀를 유발하지 않아야 하며, 실패 시 원인 추적이 가능하도록 아티팩트 업로드를 유지해야 한다.
6. GitHub Branch Protection(또는 Rulesets)이 사용 가능한 저장소에서는 `main` 기준으로 `lint`, `typecheck`, `unit`, `contracts`, `e2e`, `perf-budget` 6개 체크를 Required status checks로 강제해야 하며, 누락 시 스토리 완료로 간주하지 않는다.
7. 저장소 플랜 제약으로 Branch Protection이 불가한 경우(예: Private Free), 본 스토리는 기능 구현 완료 + 운영 전환 블로커 상태로 유지하며, 해소 조건(저장소 공개 전환 또는 GitHub Pro/Team 업그레이드)을 스프린트 변경제안서와 백로그 액션 아이템에 명시해야 한다.

Coverage: NFR1, NFR2, NFR11, NFR18, Architecture Quality Gates

## Must-Do Implementation Checklist

- [x] Branch Protection 또는 Rulesets에서 `main` Required status checks 6개(`lint`,`typecheck`,`unit`,`contracts`,`e2e`,`perf-budget`)가 실제로 강제되는지 확인한다. (플랜 미지원 시 블로커로 기록)
- [x] 로컬 재현 전 `pnpm --dir preproduct exec playwright install --with-deps chromium`를 실행해 e2e/contracts 실행 전제를 맞춘다.
- [x] `test-results/playwright-report.json` 산출/업로드/다운로드 경로가 CI와 로컬에서 동일한지 확인한다.
- [x] 계약 실패/성능예산 실패가 exit code 1로 PR merge를 차단하는지 확인한다.
- [x] 실패 분석에 필요한 로그/아티팩트 접근 경로를 README에 명시한다.

## Tasks / Subtasks

- [x] 1) CI 워크플로우 baseline 정렬 및 게이트 명시 (AC: 1,2,5,6,7)
- [x] `preproduct/.github/workflows/ci.yml`에서 6개 게이트(`lint`,`typecheck`,`unit`,`contracts`,`e2e`,`perf-budget`)를 단일 기준으로 유지
- [x] `perf-budget` job은 `needs: e2e` 의존을 유지해 Playwright JSON 리포트 기반 검증 순서를 강제
- [x] Gate 이름은 branch protection에서 그대로 요구 가능하도록 안정된 job name을 유지
- [x] 저장소 설정에서 `main` Branch Protection/Rulesets Required checks에 6개 게이트가 포함되었는지 검증하고 결과를 기록
- [x] 플랜 제약으로 Branch Protection 적용이 불가한 경우 블로커 등록 + 해소 조건(공개 전환 또는 Pro/Team 업그레이드) 문서화

- [x] 2) 계약검증/성능예산 스크립트 가드레일 강화 (AC: 2,3,4)
- [x] `preproduct/scripts/run-e2e-ci.mjs`에서 JSON 리포트 출력 환경변수(`PLAYWRIGHT_JSON_OUTPUT_FILE`) 일관성 확인
- [x] `preproduct/scripts/perf-budget-check.mjs`에서 duration 미검출/예산초과 시 명확한 실패 코드(1) 보장
- [x] 계약검증 스크립트(`pnpm test:contracts`)가 API 계약 회귀를 차단하는지 문서/CI 양쪽에서 추적 가능하게 정리

- [x] 3) 테스트/아티팩트 운영성 확보 (AC: 2,5)
- [x] CI에서 `playwright-json-report` 아티팩트 업로드를 `if: always()`로 유지
- [x] 로컬 재현 전제 의존성(`pnpm --dir preproduct exec playwright install --with-deps chromium`)을 README에 명시
- [x] 로컬/CI 동일 커맨드 셋을 README에 명시 (`pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:contracts`, `pnpm test:e2e:ci`, `pnpm ci:perf-budget`)
- [x] 실패 재현을 위한 최소 재실행 순서와 로그/아티팩트 확인 경로를 문서화

- [x] 4) 회귀/완료 검증 (AC: 1~7 중 AC6/7 제외 항목)
- [x] 로컬 검증 전 브라우저 설치: `pnpm --dir preproduct exec playwright install --with-deps chromium`
- [x] 로컬 검증: `pnpm --dir preproduct lint`
- [x] 로컬 검증: `pnpm --dir preproduct typecheck`
- [x] 로컬 검증: `pnpm --dir preproduct test:unit`
- [x] 로컬 검증: `pnpm --dir preproduct test:contracts`
- [x] 로컬 검증: `pnpm --dir preproduct test:e2e:ci`
- [x] 로컬 검증: `pnpm --dir preproduct ci:perf-budget`

### Review Findings

- [x] [Review][Patch] perf-budget CLI 엔트리 가드가 Windows 경로에서 실패해 게이트가 no-op이 되는 문제 [preproduct/scripts/perf-budget-check.mjs:141]
- [x] [Review][Patch] bmad-auto 상태 파서가 주석 포함 `Status:` 값을 지원하지 못해 auto-step이 실패하는 문제 [preproduct/scripts/bmad-auto.ps1:87]
- [x] [Review][Patch] run-e2e-ci wrapper에서 `spawn` 실패 이벤트를 처리하지 않아 실패 원인 노출이 불안정한 문제 [preproduct/scripts/run-e2e-ci.mjs:22]
- [x] [Review][Dismiss] bmad-auto `-FromSpec`가 `_bmad-output` 경로를 저장소 밖으로 해석하는 문제 [preproduct/scripts/bmad-auto.ps1:40] — 경로 해석 실측 결과 재현되지 않음
- [x] [Review][Defer] AC6/AC7 Branch Protection Required checks 강제는 저장소 플랜/정책 제약으로 코드 diff만으로 해결 불가 [preproduct/.github/workflows/ci.yml:1] — deferred, pre-existing
- [x] [Review][Patch] `/api/intents/records` idempotency가 check-then-set 분리로 경쟁 요청에서 중복 처리될 수 있는 문제 [preproduct/src/app/api/intents/records/route.ts:194]
- [x] [Review][Patch] `/api/intents` 진단 idempotency도 동일한 check-then-set 경쟁 조건을 갖는 문제 [preproduct/src/app/api/intents/route.ts:237]
- [x] [Review][Patch] shared `event-envelope` 계약의 `schemaVersion` 타입이 런타임 구현과 불일치하는 문제 [preproduct/src/shared/contracts/event-envelope.ts:5]
- [x] [Review][Defer] 파일락(`.lock`) stale 복구 부재/`os.tmpdir()` 기반 비영속 상태 저장 리스크는 현 Story 1.4 범위를 넘어서는 운영 설계 이슈 [preproduct/src/domain/intent/intent-shared-state.ts:38] — deferred, pre-existing
- [x] [Review][Patch] intent form의 UTC 입력 `pattern` 이스케이프가 잘못되어 브라우저 검증이 깨지는 문제 [preproduct/src/feature/intent/components/intent-form.tsx:323]
- [x] [Review][Patch] 키보드 접근성 e2e가 `focus()` 기반이라 실제 Tab 순회 회귀를 놓칠 수 있는 문제 [preproduct/tests/e2e/core-user-flow.spec.ts:26]
- [x] [Review][Patch] `/api/intents` 계약 테스트가 정상 경로만 검증해 INVALID_INPUT/INVALID_EVENT_ALIAS 분기를 놓치는 문제 [preproduct/tests/e2e/intent-record-api.contract.spec.ts:236]
- [x] [Review][Patch] README가 삭제된 `app/page.tsx` 경로와 현재 루트 기준과 어긋난 `pnpm --dir preproduct` 명령을 안내하는 문제 [preproduct/README.md:30]
- [x] [Review][Dismiss] 모바일 e2e가 요약 카드만 검증하는 지적은 본 스토리 AC 범위 밖 보강 제안으로 triage에서 제외 [preproduct/tests/e2e/core-user-flow.spec.ts:45]

### Review Findings (Swarm 2026-04-06)

- [x] [Review][Patch] bmad-auto 상태 정규화 정규식이 `_` 포함 토큰을 잘라 오작동할 수 있는 문제 [preproduct/scripts/bmad-auto.ps1:87]
- [x] [Review][Patch] shared `event-envelope` 계약의 `schemaVersion` 숫자 타입 변경이 기존 문자열 소비자와 호환성 충돌을 일으킬 수 있는 문제 [preproduct/src/shared/contracts/event-envelope.ts:5]
- [x] [Review][Defer] idempotency key lock이 프로세스 로컬 메모리라 멀티 인스턴스 환경에서 동일 키 경합을 완전히 막지 못하는 운영 리스크 [preproduct/src/domain/intent/idempotency-key-lock.ts:1] — deferred, pre-existing

### Review Findings (Swarm 2026-04-06 Follow-up)

- [x] [Review][Patch] 키보드 접근성 e2e가 Tab 이동 횟수 고정에 의존해 UI 포커스 가능 요소 변경 시 flaky 실패를 유발할 수 있는 문제 [preproduct/tests/e2e/core-user-flow.spec.ts:35]
- [x] [Review][Patch] idempotency key lock 도입 이후 동일 키 동시 요청 경합(특히 병렬 호출) 회귀를 검증하는 계약 테스트가 없는 문제 [preproduct/tests/e2e/intent-record-api.contract.spec.ts:65]

## Dev Notes

### Epic Context

- Epic 1의 목적은 "목적 형성과 선의향 등록 시작"이지만, Story 1.4는 이후 모든 구현(2.x 이후 포함)의 품질 하한을 자동화하는 운영 기반 스토리다.
- Story 1.3에서 도입한 계약/이벤트/idempotency 규칙을 CI 게이트에 고정하지 않으면 후속 스토리에서 회귀 위험이 크다.
- 본 스토리는 사용자 기능 추가보다 "품질 손상 방지 장치" 구축이 핵심 산출물이다.

### Previous Story Intelligence (Story 1.3)

- Story 1.3에서 `/api/intents`와 `/api/intents/records` 분리, 계약 테스트, e2e 경로가 이미 구현되어 있어 계약검증 게이트는 해당 테스트를 반드시 재사용해야 한다.
- Review 패치에서 드러난 주요 리스크는 idempotency 일관성, 이벤트 기록 누락, CI 환경 불일치(브라우저 채널/아티팩트)였다.
- 따라서 Story 1.4는 새 테스트 체계를 만들기보다 기존 `tests/e2e/intent-record-api.contract.spec.ts`와 `scripts/perf-budget-check.mjs`를 기준선으로 잠금(lock)해야 한다.

### Git Intelligence Summary

- `preproduct` git 로그는 현재 초기 커밋 1건(`20fab5f`)만 존재해 커밋 패턴 기반 학습은 제한적이다.
- 실질 패턴 소스는 구현 아티팩트(Story 1.1~1.3)와 현재 워크트리 파일(특히 `ci.yml`, `scripts/*`, `tests/*`)이다.

### Technical Requirements (Must Follow)

- CI/품질 게이트의 기준은 AC 1~7을 단일 소스로 따른다.
- 계약검증 대상은 Story 1.3 의향 저장 API 계약 테스트(`tests/e2e/intent-record-api.contract.spec.ts`)를 baseline으로 유지한다.
- 성능예산은 max/p95/total 3지표를 모두 검사하고 초과 시 실패(exit code 1)해야 한다.
- e2e 단계에서 JSON 리포트를 산출/업로드하고, perf-budget 단계에서 동일 경로 산출물을 소비해야 한다.
- 계약 위반/성능예산 초과는 경고가 아닌 merge 차단으로 동작해야 하며, Branch Protection/Rulesets Required checks와 일치해야 한다.

### Architecture Compliance Checklist

- [x] `.github/workflows/ci.yml`에 품질 게이트 6종이 명시되어 있다.
- [!] GitHub `main` Branch Protection/Rulesets Required checks에 품질 게이트 6종이 등록되어 있다. (플랜 제약으로 현재 미적용)
- [x] `contracts`와 `perf-budget` 실패가 실제로 exit code 1로 종료되어 CI를 실패시킨다.
- [x] `perf-budget`는 e2e 산출물(JSON report)에 의존한다.
- [x] 테스트/스크립트 변경이 Story 1.2/1.3 API 계약 회귀를 유발하지 않는다.
- [x] README 또는 운영 문서에 로컬 재현 명령(브라우저 설치 포함)과 실패 분석 경로가 최신 상태로 유지된다.

### File Structure Requirements

- 핵심 수정 대상(우선):
- `preproduct/.github/workflows/ci.yml`
- `preproduct/scripts/run-e2e-ci.mjs`
- `preproduct/scripts/perf-budget-check.mjs`
- `preproduct/package.json`

- 검증/보조 대상:
- `preproduct/tests/e2e/intent-record-api.contract.spec.ts`
- `preproduct/tests/unit/perf-budget-check.test.mjs`
- `preproduct/README.md`

### Testing Requirements

- CI 동등 로컬 검증 6종을 모두 통과해야 한다.
- 계약검증 실패 시나리오(스키마 위반/상태코드/오류 스키마 불일치) 최소 1개 이상 유지.
- 성능예산 실패 시나리오(최대/95p/총합 중 1개 초과) 테스트 커버 유지.
- 산출물 경로(`test-results/playwright-report.json`)는 CI와 로컬에서 동일해야 한다.

### Library / Framework Requirements (Latest Check: 2026-04-06)

- 현재 코드베이스 기준선:
  - `next@16.2.2`
  - `react@19.2.4`
  - `@playwright/test@1.59.1`
- 최신 공식 문서 확인 결과:
  - Next.js 16.2 릴리즈는 2026-03-18 공개되었고 dev/rendering 성능 개선이 포함됨.
  - Playwright JSON reporter는 `PLAYWRIGHT_JSON_OUTPUT_FILE` 또는 `PLAYWRIGHT_JSON_OUTPUT_NAME` 환경변수를 공식 지원함.
  - `actions/setup-node`는 v6가 최신이지만, 본 스토리는 baseline 안정화 목적이므로 즉시 액션 메이저 업그레이드보다 기존 v4 체계의 게이트 신뢰성 확보를 우선한다(업그레이드는 별도 변경 스토리로 분리 권장).

### Project Context Reference

- `project-context.md`는 현재 워크스페이스에서 발견되지 않았다.
- 본 스토리는 `prd.md`, `epics.md`, `architecture.md`, `ux-design-specification.md`, Story 1.3 산출물을 기준으로 작성했다.

### References

- `_bmad-output/planning-artifacts/epics.md` (Epic 1 / Story 1.4)
- `_bmad-output/planning-artifacts/prd.md` (NFR1, NFR2, NFR11, NFR18)
- `_bmad-output/planning-artifacts/architecture.md` (Quality Gates, CI/CD, contract-first)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (접근성/회귀 관점)
- `_bmad-output/implementation-artifacts/1-3-자산-단위-선의향-등록-및-제약조건-편집.md` (이전 스토리 인텔리전스)
- https://nextjs.org/blog/next-16-2 (Next.js 16.2 릴리즈)
- https://playwright.dev/docs/test-reporters (JSON reporter 환경변수)
- https://github.com/actions/setup-node (GitHub Action setup-node)
- https://github.com/pnpm/action-setup (pnpm/action-setup)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- sprint-status에서 첫 backlog 스토리 자동 선택: `1-4-ci-cd-계약검증-성능예산-baseline-구축`
- project-context 탐색 결과: 파일 미존재
- git 로그(`preproduct`): 초기 커밋 1건
- 최신 기술 검증(웹): Next.js/Playwright/GitHub Actions/pnpm 공식 문서 확인
- 로컬 검증 실행:
  - `pnpm --dir preproduct exec playwright install --with-deps chromium` (권한 상승 후 성공)
  - `pnpm --dir preproduct lint` 통과
  - `pnpm --dir preproduct typecheck` 통과
  - `pnpm --dir preproduct test:unit` 통과
  - `pnpm --dir preproduct test:contracts` 통과 (7/7)
  - `pnpm --dir preproduct test:e2e:ci` 통과 (24/24)
  - `pnpm --dir preproduct ci:perf-budget` 통과
- Branch Protection 검증 시도:
  - `git -C preproduct remote -v` 결과 원격 저장소 미설정
  - `gh auth status` 결과 토큰 invalid로 GitHub 설정 조회 불가
  - `git -C preproduct push -u origin master:main` 성공 (`a936819` -> `main`)
  - `gh api -X PUT repos/sangjaepark0000/intent-decision-lab/branches/main/protection` 호출 시 403
    - 메시지: `Upgrade to GitHub Pro or make this repository public to enable this feature.`
- 로컬 재검증(2026-04-06):
  - `pnpm --dir preproduct exec playwright install --with-deps chromium` 통과
  - `pnpm --dir preproduct lint` 통과
  - `pnpm --dir preproduct typecheck` 통과
  - `pnpm --dir preproduct test:unit` 통과
  - `pnpm --dir preproduct test:contracts` 통과 (7/7)
  - `pnpm --dir preproduct test:e2e:ci` 통과 (24/24)
  - `pnpm --dir preproduct ci:perf-budget` 통과
- 재검증 중 `tests/e2e/core-user-flow.spec.ts`의 의향 저장 케이스 2건 실패 재현:
  - 상태 텍스트가 `아직 저장 전`에 고정되어 제출 미발생 확인
  - 원인: `intent-form.tsx`의 UTC `pattern` 문자열 해석 문제로 브라우저 유효성 검사 차단
- 수정 반영:
  - `preproduct/src/feature/intent/components/intent-form.tsx`에 `UTC_ISO_8601_PATTERN` 상수 도입
  - 정규식을 백슬래시 없는 `[0-9]` 기반 패턴으로 교체해 폼 제출 차단 제거
- 수정 후 검증(2026-04-06):
  - 타깃 검증: `pnpm --dir preproduct exec playwright test tests/e2e/core-user-flow.spec.ts --grep "의향 입력 저장 후 동일 요청 재전송 시 중복 생성되지 않는다"` 통과 (2/2)
  - 전체 게이트: `pnpm --dir preproduct lint`, `pnpm --dir preproduct typecheck`, `pnpm --dir preproduct test:unit`, `pnpm --dir preproduct test:contracts`(9/9), `pnpm --dir preproduct test:e2e:ci`(28/28), `pnpm --dir preproduct ci:perf-budget` 통과
- 최종 회귀 검증(2026-04-06):
  - `pnpm --dir preproduct lint` 통과
  - `pnpm --dir preproduct typecheck` 통과
  - `pnpm --dir preproduct test:unit` 통과
  - `pnpm --dir preproduct test:contracts`는 sandbox에서 `spawn EPERM` 발생 후 권한 상승 재실행으로 통과 (9/9)
  - `pnpm test:e2e:ci`(workdir=`preproduct`) 통과 (28/28)
  - `pnpm --dir preproduct ci:perf-budget` 통과

### Completion Notes List

- Story 1.4 컨텍스트 문서를 생성했다.
- Epic/PRD/Architecture/UX/Story 1.3 정보를 통합해 구현 가드레일을 정리했다.
- 최신 기술 문서 기준으로 CI/리포터 설정의 유효성을 교차검증했다.
- 스프린트 상태는 `1-4-ci-cd-계약검증-성능예산-baseline-구축 -> in-progress`로 반영했다.
- `perf-budget-check.mjs`에 예산 환경변수 유효성 검사(양수/숫자)와 준비 실패 시 명시적 종료 코드(1) 처리를 추가했다.
- 단위 테스트에 잘못된 예산 환경변수 실패 케이스를 추가해 가드레일을 회귀 방지로 고정했다.
- README에 루트 기준 재현 명령(`pnpm --dir preproduct ...`)과 실패 재실행 순서를 명확히 정리했다.
- AC6는 코드/테스트 이슈가 아닌 저장소 플랜 제약 이슈로 분류했다.
- Private repo 플랜 제한으로 Branch Protection 적용은 현재 미완료이며, 운영 전 필수 해소 블로커로 유지한다.
- 해소 조건은 두 가지다: (1) 저장소를 Public으로 전환하거나 (2) GitHub Pro/Team으로 업그레이드 후 `main` Required checks 6종을 강제한다.
- 재검증 실행 기준으로 Must-Do checklist 및 Task 1 미완료 항목을 모두 증적 기반으로 완료 처리했다.
- Story 상태를 `review`로 전환했고, AC6는 외부 블로커로 유지했다.
- e2e 회귀에서 드러난 UTC 입력 패턴 브라우저 유효성 이슈를 수정해 `/intent` 폼 제출이 정상 동작하도록 복구했다.
- 수정 후 계약/e2e/성능예산 포함 6개 CI 동등 게이트를 다시 통과시켰다.
- 최종 회귀 검증 6개 게이트를 재실행해 모두 통과했고, 스토리/스프린트 상태를 `review`로 동기화했다.

### AC6 Blocker Resolution Plan

1. 저장소 정책 결정: Public 전환 또는 Pro/Team 업그레이드 중 하나를 선택한다.
2. `main` Branch Protection/Rulesets에서 Required checks 6종(`lint`,`typecheck`,`unit`,`contracts`,`e2e`,`perf-budget`)을 등록한다.
3. 테스트 PR 1건으로 Required checks 강제 동작을 캡처하고, 증적(스크린샷/설정 로그)을 본 문서에 첨부한다.
4. 위 증적 확인 후 Story 1.4 상태를 `done`으로 전환한다.

### File List

- _bmad-output/implementation-artifacts/1-4-ci-cd-계약검증-성능예산-baseline-구축.md
- preproduct/scripts/perf-budget-check.mjs
- preproduct/tests/unit/run-unit-tests.mjs
- preproduct/README.md
- preproduct/src/feature/intent/components/intent-form.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-04-06: Story 1.4 context 문서 생성 및 sprint-status 연동 준비 완료.
- 2026-04-06: perf-budget 환경변수 유효성 가드레일 및 실패 처리 강화, 단위 테스트/README 재현 가이드 업데이트.
- 2026-04-06: AC6를 외부 저장소 플랜 블로커로 재분류하고 해소 조건(공개 전환 또는 Pro/Team 업그레이드) 및 완료 절차를 명시.
- 2026-04-06: 6개 게이트 재실행 통과로 미완료 체크리스트를 정리하고 Story 상태를 `review`로 전환.
- 2026-04-06: `/intent` 폼 UTC pattern 유효성 이슈를 수정해 e2e 회귀(2건) 해결 후 lint/typecheck/unit/contracts/e2e/perf-budget 전체 재검증 통과.
- 2026-04-06: dev-story 워크플로우 Step 6~9 재검증을 완료하고 `contracts` EPERM 이슈를 권한 상승 재실행으로 확인한 뒤 상태 정합을 `review`로 확정.
- 2026-04-06: 정책 결정(옵션 2)에 따라 AC6를 운영 전환 블로커로 분리하고 Story 1.4 완료 기준에서 제외하여 상태를 `done`으로 전환.
