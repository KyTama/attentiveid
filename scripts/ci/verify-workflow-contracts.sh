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
requireValue(value.staging_source_run_verified === true, "successful staging source run must be verified");
requireValue(value.candidate_published_after_healthcheck === true, "candidate must be published after staging healthchecks");
requireValue(value.production_environment_protected === true, "production Environment protection is required");
requireValue(value.digest_preserved === true, "production digests must match staging byte-for-byte");
requireValue(value.rebuild_in_promotion === false, "production promotion must not rebuild images");
requireValue(value.production_rollback_on_failure === true, "production must roll back on deployment failure");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
' "$fixture"
}

if [[ "${1:-}" == "--fixtures-only" ]]; then
    verify_fixture "$root_dir/tests/fixtures/releases/workflow.valid.json"
    for invalid in workflow.unpinned-action.json workflow.altered-digest.json workflow.rebuilds-production.json workflow.unstaged-candidate.json; do
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
grep -q 'workflow_run:' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q "workflow_run.conclusion == 'success'" "$root_dir/.github/workflows/deploy-staging.yml"
grep -q "workflow_run.event == 'push'" "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'cancel-in-progress: false' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'actions/download-artifact@' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'run-id:.*workflow_run.id' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'verify-release-manifest' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'tailscale/github-action@' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'remote-deploy' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'Verify public staging health' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'staging-provenance.env' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'staging-candidate-' "$root_dir/.github/workflows/deploy-staging.yml"
grep -q 'environment: production' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'workflow_dispatch:' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'staging_run_id:' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'cancel-in-progress: false' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'Verify successful staging source run' "$root_dir/.github/workflows/promote-production.yml"
grep -q '.name == "Deploy Staging"' "$root_dir/.github/workflows/promote-production.yml"
grep -q '.conclusion == "success"' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'run-id:.*inputs.staging_run_id' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'staging-provenance.env' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'verify-release-manifest' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'remote-deploy' "$root_dir/.github/workflows/promote-production.yml"
grep -q 'rollback.sh' "$root_dir/.github/workflows/promote-production.yml"
if grep -Eq 'docker/(build-push-action|buildx)|docker build' "$root_dir/.github/workflows/promote-production.yml"; then
    printf 'Production promotion must not rebuild images\n' >&2
    exit 1
fi

grep -q 'StrictHostKeyChecking=yes' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -q 'IdentitiesOnly=yes' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -q 'scp_options=.*-P.*port' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -q 'manifest_bundle_sha=' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -q 'actual_bundle_sha=' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -q 'bootstrap_dir=' "$root_dir/scripts/deploy/remote-deploy.sh"
grep -qx 'deploy/install-manifest.txt' "$root_dir/deploy/install-manifest.txt"

printf 'Workflow contracts passed\n'
