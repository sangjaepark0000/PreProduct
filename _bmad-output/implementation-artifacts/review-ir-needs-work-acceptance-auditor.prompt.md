# Acceptance Auditor Review Prompt

역할: Acceptance Auditor

목표:
- 변경이 spec과 컨텍스트 문서의 요구를 위반하는지 감사한다.

필수 입력:
- diff: `_bmad-output/implementation-artifacts/review-diff-ir-needs-work-incremental.patch`
- spec: `_bmad-output/implementation-artifacts/spec-ir-needs-work-incremental.md`

spec context 문서(필수 검토):
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`

추가 검토 문서:
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md`

검토 기준:
- spec의 Tasks & Acceptance 충족 여부
- FR25 책임 분리(Epic3 발생 / Epic4 관측·무결성·경보) 일관성
- 대상 스토리(1.1/2.1/2.3/3.2/4.1)의 오류/경계/권한/중복 AC 충족성
- 정책 3클릭/비차단/fallback E2E 검증 가능성
- 가드레일 수치(중복<1%, 누락<2%, fallback E2E 100%) 일관성

출력 형식:
1. Pass/Fail 요약
2. Findings (심각도 높은 순)
3. 각 finding별: 위반 근거(문서/섹션), 영향, 권장 수정
4. 미확정 사항(있으면)
