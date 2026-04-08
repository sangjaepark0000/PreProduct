# Edge Case Hunter Prompt

Use skill: `bmad-review-edge-case-hunter`

Inputs:
- Diff: `_bmad-output/implementation-artifacts/review-1-4-uncommitted.diff`
- Project read access: `preproduct/`

Focus:
- Boundary conditions
- Race/concurrency issues
- Invalid input handling
- CI/test flakiness and env edge cases

Output Markdown findings list.
Per finding: title, severity, evidence(file:line), impact, suggested fix.
