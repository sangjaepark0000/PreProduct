---
storyId: "1.2"
storyKey: "1-2-prelisting-status-and-edit"
storyTitle: "프리리스팅 상태 저장 및 수정"
storyFile: "_bmad-output/implementation-artifacts/1-2-프리리스팅-상태-저장-및-수정.md"
generatedTestFiles:
  - "_bmad-output/test-artifacts/red-phase/1-2-prelisting-status-and-edit/prelisting-status.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/1-2-prelisting-status-and-edit/create-listing-status.red.test.ts"
  - "_bmad-output/test-artifacts/red-phase/1-2-prelisting-status-and-edit/prelisting-status-detail.red.spec.ts"
---

# Story 1.2 ATDD Checklist

## Scope

- 생성 시 `판매중` 또는 `프리리스팅` 상태를 선택할 수 있어야 한다.
- 저장 후 상세 화면에서 현재 상태를 보고 수정할 수 있어야 한다.
- 상태 변경 시 `updatedAt`이 최신 시각으로 갱신되어야 한다.

## Red-Phase Scaffolds

1. Domain/schema red tests
- canonical 상태값이 `판매중`, `프리리스팅` 두 개로 고정되는지 검증
- 생성 입력과 저장된 Listing shape가 상태 필드를 포함하는지 검증

2. Server action red tests
- 생성 액션이 선택한 상태를 도메인 경계로 전달하는지 검증
- 허용되지 않은 상태값이 들어오면 recoverable validation state로 내려오는지 검증

3. Browser acceptance red tests
- `/listings/new`에서 상태를 선택하고 저장하면 상세 화면에 상태가 보이는지 검증
- 상세 화면에서 상태를 바꾸면 상태 텍스트와 수정 시각이 함께 갱신되는지 검증

## Step 3 Blockers

- `src/domain/prelisting-status/prelisting-status.ts`가 아직 placeholder 상태값을 사용한다.
- `src/domain/listing/` 및 `src/infra/listing/`에 상태 영속화/수정 경계가 없다.
- 생성 액션과 상세 화면에 상태 입력/표시/수정 UI가 아직 없다.
