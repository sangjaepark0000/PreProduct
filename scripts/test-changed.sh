#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-${BASE_REF:-origin/main}}"
PLAYWRIGHT_PROJECT="${PLAYWRIGHT_PROJECT:-chromium}"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Base ref '$BASE_REF' was not found. Falling back to HEAD^."
  BASE_REF="HEAD^"
fi

mapfile -t CHANGED_SPECS < <(
  git diff --name-only "$BASE_REF"...HEAD |
    grep -E '^(tests/.*\.spec\.ts|_bmad-output/test-artifacts/red-phase/.*\.spec\.ts)$' ||
    true
)

if [ "${#CHANGED_SPECS[@]}" -eq 0 ]; then
  CHANGED_SPECS=("tests/e2e/framework-smoke.spec.ts")
fi

echo "Running Playwright specs against project '$PLAYWRIGHT_PROJECT':"
printf ' - %s\n' "${CHANGED_SPECS[@]}"

pnpm exec playwright test --project="$PLAYWRIGHT_PROJECT" "${CHANGED_SPECS[@]}"
