#!/usr/bin/env bash
set -euo pipefail

corepack enable
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run unit
pnpm run contract
pnpm exec playwright install chromium
pnpm run perf-budget
CI=true pnpm run test:e2e:smoke
