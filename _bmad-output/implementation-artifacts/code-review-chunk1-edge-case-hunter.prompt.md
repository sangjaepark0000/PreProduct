# Edge Case Hunter Prompt (Chunk 1)

Use skill: `bmad-review-edge-case-hunter`.

Inputs:
- Diff: `_bmad-output/implementation-artifacts/code-review-chunk1-ci-scripts-package.diff`
- Repository read access allowed.

Task:
- Walk every branch/boundary condition in changed CI/scripts/package config.
- Focus on edge cases in env vars, missing artifacts, non-determinism, platform differences (Windows/Linux), and failure-mode handling.
- Output only actionable findings with severity and exact file/line evidence.
- If no findings, output `No findings` plus remaining blind spots.
