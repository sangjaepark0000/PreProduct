#!/usr/bin/env bash
set -euo pipefail

ITERATIONS="${1:-10}"
BASE_REF="${2:-${BASE_REF:-origin/main}}"

for ITERATION in $(seq 1 "$ITERATIONS"); do
  echo "Burn-in iteration ${ITERATION}/${ITERATIONS}"
  bash scripts/test-changed.sh "$BASE_REF"
done
