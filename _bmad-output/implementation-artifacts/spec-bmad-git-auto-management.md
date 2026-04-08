---
title: 'BMad 진행용 Git 자동 관리 도입'
type: 'feature'
created: '2026-04-06T23:59:00+09:00'
status: 'done'
baseline_commit: '20fab5f4ea8e08f839e37fc0870bd26c77f911fc'
context:
  - '_bmad-output/implementation-artifacts/sprint-status.yaml'
  - '_bmad-output/planning-artifacts/workflow-status.yaml'
  - '_bmad/bmm/config.yaml'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** BMad 기반 작업을 진행할 때 브랜치 생성/전환과 단계별 커밋이 수동으로 흩어져 있어 기록 일관성이 깨지고, 추후 롤백/리뷰 단위가 불명확해진다. 개인 프로젝트에서도 이 상태가 누적되면 변경 이유를 복원하기 어려워진다.

**Approach:** 저장소 루트에서 실행 가능한 Git 자동화 스크립트를 추가해 현재 작업 상태를 기준선으로 고정하고, 지정한 작업 슬러그 기준으로 작업 브랜치를 자동 준비한 뒤, BMad 산출물/코드 변경을 단계 단위 메시지 규칙으로 자동 커밋한다. 위험도가 높은 동작(push/rebase/reset)은 기본 동작에서 제외한다.

## Boundaries & Constraints

**Always:**
- 기존 변경사항을 강제 삭제하거나 reset 하지 않는다.
- 작업 대상 Git 저장소를 자동 탐지하되, 루트 오인 방지를 위해 탐지 결과를 검증하고 실패 시 즉시 종료한다.
- 자동 커밋은 실제 변경 파일이 있을 때만 수행한다.
- 커밋 메시지는 추적 가능한 규칙을 따른다: `bmad(<phase>): <slug> [<tag>]`.
- 브랜치명은 `feat/<slug>`를 기본으로 하며 이미 존재하면 해당 브랜치로 전환한다.
- 기본 동작은 로컬까지만 처리한다(원격 push/PR 미포함).

**Ask First:**
- 기본 브랜치명이 `main`이 아닌 저장소에서 최초 기준선 커밋을 어느 브랜치에 둘지 정책 변경 필요 시.
- 자동 커밋 대상 파일 범위를 BMad 산출물 전용으로 제한할지, 코드 파일 전체로 확대할지 변경 필요 시.
- 기존 훅/스크립트와 충돌하는 Git 명령 순서 변경이 필요할 시.

**Never:**
- `git reset --hard`, `git clean -fd` 같은 파괴적 명령 사용.
- 자동 push/force-push/자동 PR 생성.
- 사용자의 기존 커밋 히스토리를 재작성(rebase --onto, filter-branch 등).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 기준선 고정 + 브랜치 준비 | 현재 브랜치 dirty, 타겟 슬러그 `bmad-git-automation` | 기준선 커밋 1회 생성(옵션), `feat/bmad-git-automation` 브랜치 생성 또는 전환 | 저장소 탐지 실패/커밋 실패 시 즉시 종료, 원인 출력 |
| 단계 커밋 | 변경 파일 존재 + phase=`step-03` + tag=`auto` | 규칙 메시지로 커밋 생성, 변경 없으면 스킵 로그만 출력 | 스테이징 실패 시 종료코드 비0 반환 |
| 브랜치 중복 | `feat/<slug>`가 이미 존재 | 새 브랜치 생성 없이 해당 브랜치 checkout | checkout 실패 시 종료 및 수동 조치 안내 |
| 잘못된 입력 | slug 미입력 또는 phase 형식 불일치 | 실행 거부 + 사용법 출력 | 종료코드 비0 반환 |

</frozen-after-approval>

## Code Map

- `_bmad/bmm/config.yaml` -- BMad 프로젝트 공통 설정 파일. Git 자동화 기본값(브랜치 접두어/메시지 규칙) 참조 지점.
- `preproduct/scripts/bmad-git.ps1` -- 브랜치 준비, 기준선 커밋, 단계 커밋을 수행하는 메인 자동화 스크립트(신규).
- `preproduct/scripts/bmad-git.examples.ps1` -- 실사용 예시 모음(신규).
- `preproduct/README.md` -- 팀/개인 실행 방법 및 안전 범위 문서화.

## Tasks & Acceptance

**Execution:**
- [x] `_bmad/bmm/config.yaml` -- Git 자동화 관련 기본 키(브랜치 prefix, 커밋 메시지 패턴, auto-push 비활성)를 추가한다 -- 프로젝트 정책을 코드화해 스크립트와 문서가 같은 기준을 사용하게 한다.
- [x] `preproduct/scripts/bmad-git.ps1` -- `init`/`commit` 모드를 구현한다: 저장소 탐지, 슬러그 검증, 브랜치 생성·전환, 변경분 감지 후 조건부 커밋 -- 수동 Git 반복 작업을 제거하고 히스토리 일관성을 강제한다.
- [x] `preproduct/scripts/bmad-git.examples.ps1` -- 대표 실행 시나리오(기준선+브랜치 준비, step 커밋)를 제공한다 -- 사용자가 즉시 복붙 실행 가능하도록 진입 장벽을 낮춘다.
- [x] `preproduct/README.md` -- 자동화 동작 범위/금지사항/권장 루틴을 문서화한다 -- 개인 프로젝트에서도 의도치 않은 원격 반영 없이 안전하게 운영하도록 한다.
- [x] `preproduct/scripts/bmad-git.ps1` -- I/O 매트릭스의 입력 검증과 브랜치 중복/변경 없음 케이스를 검증하는 자체 체크 명령을 제공한다 -- 실패를 조기 감지해 잘못된 커밋 누적을 방지한다.

**Acceptance Criteria:**
- Given 로컬 저장소에 변경사항이 있고 slug를 지정했을 때, when `init` 모드를 실행하면, then `feat/<slug>` 브랜치가 준비되고 선택적으로 기준선 커밋이 생성된다.
- Given 단계 작업 후 변경파일이 있을 때, when `commit` 모드를 실행하면, then `bmad(<phase>): <slug> [<tag>]` 규칙의 커밋이 생성된다.
- Given 변경파일이 없을 때, when `commit` 모드를 실행하면, then 커밋 없이 성공적으로 종료되고 스킵 이유가 출력된다.
- Given slug 또는 phase가 유효하지 않을 때, when 스크립트를 실행하면, then 명확한 오류 메시지와 비0 종료코드를 반환한다.
- Given 사용자가 기본 루틴대로 사용했을 때, when BMad 작업을 여러 단계 진행하면, then 브랜치/커밋 히스토리만으로 작업 단계를 복원할 수 있다.

## Spec Change Log

## Verification

**Commands:**
- `powershell -ExecutionPolicy Bypass -File preproduct/scripts/bmad-git.ps1 init -Slug "bmad-git-automation" -CreateBaselineCommit` -- expected: `feat/bmad-git-automation` 준비 + 기준선 커밋 1건(변경 존재 시).
- `powershell -ExecutionPolicy Bypass -File preproduct/scripts/bmad-git.ps1 commit -Slug "bmad-git-automation" -Phase "step-03" -Tag "auto"` -- expected: 변경 존재 시 규칙 커밋 생성, 없으면 스킵 로그 출력.
- `powershell -ExecutionPolicy Bypass -File preproduct/scripts/bmad-git.ps1 commit -Slug "invalid_slug" -Phase "step-03"` -- expected: 입력 검증 오류 + 비0 종료.

## Suggested Review Order

**브랜치/커밋 강제 경로**

- 커밋 전 대상 브랜치로 고정해 오커밋을 차단합니다.
  [`bmad-git.ps1:240`](../../preproduct/scripts/bmad-git.ps1#L240)

- 브랜치 생성/전환 공통 로직으로 일관 동작을 보장합니다.
  [`bmad-git.ps1:162`](../../preproduct/scripts/bmad-git.ps1#L162)

**저장소 탐지 안전성**

- 다중 저장소 탐지 시 명시 경로를 강제해 루트 오인을 막습니다.
  [`bmad-git.ps1:115`](../../preproduct/scripts/bmad-git.ps1#L115)

- 잘못된 경로를 예외 스택 대신 명확한 에러로 통일합니다.
  [`bmad-git.ps1:102`](../../preproduct/scripts/bmad-git.ps1#L102)

**설정-코드 동기화**

- config 기반 기본값 로딩으로 문서/스크립트 정책을 일치시킵니다.
  [`bmad-git.ps1:40`](../../preproduct/scripts/bmad-git.ps1#L40)

- bmad_git 키가 실제 런타임 기본 동작을 정의합니다.
  [`config.yaml:19`](../../_bmad/bmm/config.yaml#L19)

**검증 및 사용성**

- self-check가 브랜치 중복/클린 리포 경로까지 점검합니다.
  [`bmad-git.ps1:258`](../../scripts/bmad-git.ps1#L258)

- 실행 문서가 자동 탐지와 안전 실패 조건을 명확히 설명합니다.
  [`README.md:24`](../../preproduct/README.md#L37)

- 예시 스크립트가 저장소 경로 하드코딩 없이 바로 실행됩니다.
  [`bmad-git.examples.ps1:1`](../../preproduct/scripts/bmad-git.examples.ps1#L1)



