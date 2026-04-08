# Blind Hunter Prompt

Use skill: `bmad-review-adversarial-general`

Input diff:
- `_bmad-output/implementation-artifacts/review-1-4-uncommitted.diff`

Rules:
- Diff only. No project/spec/context assumptions.
- Output Markdown findings list.
- Per finding: title, severity, evidence(file:line), impact, suggested fix.
