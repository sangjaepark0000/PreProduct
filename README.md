# PreProduct Workspace

## Active MVP Baseline

이 저장소는 root-level Next.js App Router 앱 셸과 기존 Playwright 하네스를 함께 유지합니다.

기본 실행:

```bash
pnpm install
pnpm dev
```

차단형 baseline gate:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run unit`
- `pnpm run contract`
- `pnpm run perf-budget`

상세 CI 운영 규칙은 [docs/ci.md](/C:/Users/ok.works/Projects/PreProduct/docs/ci.md)에 정리되어 있습니다.

## BMad Git 자동 관리

개인 프로젝트에서 BMad 진행 중 Git 히스토리를 일관되게 남기기 위한 로컬 자동화 스크립트입니다.

### 범위

- `feat/<slug>` 브랜치 자동 생성 또는 전환
- 단계별 규칙 커밋 메시지 생성: `bmad(<phase>): <slug> [<tag>]`
- 변경사항이 없으면 커밋 생략

### 안전 원칙

- 자동 push 없음
- 히스토리 재작성 없음
- 파괴적 명령(`reset --hard`, `clean -fd`) 없음

### 실행 예시

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bmad-git.ps1 init -Slug "bmad-git-automation" -CreateBaselineCommit
powershell -ExecutionPolicy Bypass -File .\scripts\bmad-git.ps1 commit -Slug "bmad-git-automation" -Phase "step-03" -Tag "auto"
powershell -ExecutionPolicy Bypass -File .\scripts\bmad-git.ps1 self-check
```

### 저장소 탐지

- `-RepositoryPath`를 생략하면 현재 위치/워크스페이스 주변에서 Git 저장소를 자동 탐지합니다.
- 후보 저장소가 2개 이상이면 안전을 위해 실패하며 `-RepositoryPath`를 요구합니다.

### 권장 루틴

1. BMad 작업 시작 시 `init`으로 기준선과 작업 브랜치를 준비한다.
2. 단계 종료마다 `commit`을 호출해 변경 이유를 분리 기록한다.
3. 원격 반영은 필요할 때만 수동으로 수행한다.
