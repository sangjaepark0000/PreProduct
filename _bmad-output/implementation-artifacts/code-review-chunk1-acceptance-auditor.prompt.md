# Acceptance Auditor Prompt (Chunk 1)

You are an Acceptance Auditor. Review this diff against the spec and context docs.
Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code.
Output findings as a Markdown list.
Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Inputs:
- Diff: `_bmad-output/implementation-artifacts/code-review-chunk1-ci-scripts-package.diff`
- Spec: `_bmad-output/implementation-artifacts/1-4-ci-cd-계약검증-성능예산-baseline-구축.md`
- Context docs: none

Review focus:
- AC1~AC7 coverage for CI gates (`lint`,`typecheck`,`unit`,`contracts`,`e2e`,`perf-budget`)
- Perf budget input path (`test-results/playwright-report.json`) consistency
- Failure behavior should block merge (non-zero exits)
- Artifact upload/download and diagnosability
- Branch protection/ruleset alignment constraints
