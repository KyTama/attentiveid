#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

run_gate() {
    local name="$1"
    shift
    printf '\n==> %s\n' "$name"
    "$@"
}

run_gate 'Frozen dependency install' bun install --frozen-lockfile
run_gate 'Workspace lint' bun run lint
run_gate 'Production build' bun run build
run_gate 'Repository tests' bun run test

printf '\nRepository verification passed\n'
