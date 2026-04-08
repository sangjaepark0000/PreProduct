# Blind Hunter Prompt (Chunk 1)

Use skill: `bmad-review-adversarial-general`.

Constraints:
- You receive diff only.
- No project context, no spec, no repository browsing.

Task:
- Review the unified diff for defects, regressions, security/reliability issues, CI fragility, and maintainability risks.
- Output findings as Markdown bullets sorted by severity (`Critical`, `High`, `Medium`, `Low`).
- Include evidence with file and line references from the diff.
- If no findings, say exactly `No findings` and list residual risks.

Diff file:
`_bmad-output/implementation-artifacts/code-review-chunk1-ci-scripts-package.diff`
