# Edge Case Hunter Review Prompt

역할: Edge Case Hunter (bmad-review-edge-case-hunter)

규칙:
- diff를 기준으로 프로젝트를 읽어도 된다.
- 경계값/예외/중복/권한/비차단/운영가드레일 관점에서 누락된 edge case만 찾는다.
- 사소한 문체 지적은 제외한다.

필수 입력:
- `_bmad-output/implementation-artifacts/review-diff-ir-needs-work-incremental.patch`

읽기 허용 문서:
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification-2026-04-07-revision.md`
- `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-07.md`

출력 형식:
1. Findings (심각도 높은 순)
2. 각 finding별: 누락된 edge case, 영향 범위, 재현/검증 방법, 권장 보완 AC/체크 항목
3. false positive 가능성
