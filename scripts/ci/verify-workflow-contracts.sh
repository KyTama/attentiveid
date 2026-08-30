#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

verify_fixture() {
    local fixture="$1"
    bun -e '
const path = process.argv[1];
const value = await Bun.file(path).json();
const failures = [];
const requireValue = (condition, message) => { if (!condition) failures.push(message); };
requireValue(value.actions_pinned_to_full_sha === true, "actions must be pinned to full commit SHAs");
requireValue(value.strict_ssh_host_checking === true, "strict SSH host checking is required");
requireValue(value.staging_provenance_verified === true, "staging provenance must be verified");
requireValue(value.production_environment_protected === true, "production Environment protection is required");
requireValue(value.digest_preserved === true, "production digests must match staging byte-for-byte");
requireValue(value.rebuild_in_promotion === false, "production promotion must not rebuild images");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
' "$fixture"
}

if [[ "${1:-}" == "--fixtures-only" ]]; then
    verify_fixture "$root_dir/tests/fixtures/releases/workflow.valid.json"
    for invalid in workflow.unpinned-action.json workflow.altered-digest.json workflow.rebuilds-production.json; do
        if verify_fixture "$root_dir/tests/fixtures/releases/$invalid" >/dev/null 2>&1; then
            printf 'Negative workflow fixture unexpectedly passed: %s\n' "$invalid" >&2
            exit 1
        fi
    done
    printf 'Workflow contract fixtures passed\n'
    exit 0
fi

required_workflows=(ci.yml build-images.yml deploy-staging.yml promote-production.yml)
for workflow in "${required_workflows[@]}"; do
    path="$root_dir/.github/workflows/$workflow"
    [[ -f "$path" ]] || { printf 'Missing workflow: %s\n' "$path" >&2; exit 1; }
    if grep -Eq 'uses:[[:space:]]+[^[:space:]]+@(main|master|v[0-9]+([.][0-9]+)*)[[:space:]]*$' "$path"; then
        printf 'Workflow action is not pinned to a full SHA: %s\n' "$path" >&2
        exit 1
    fi
done

grep -q 'environment: staging' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'environment: production' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'verify-release-manifest' "$root_dir/.github/workflows/promote-production.yml"
if grep -Eq 'docker/(build-push-action|buildx)|docker build' "$root_dir/.github/workflows/promote-production.yml"; then
    printf 'Production promotion must not rebuild images\n' >&2
    exit 1
fi

printf 'Workflow contracts passed\n'
