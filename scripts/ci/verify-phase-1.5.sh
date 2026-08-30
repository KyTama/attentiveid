#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

required_scripts=(
    scripts/ci/verify-docs-secrets.sh
    scripts/ci/verify-migration-evidence.sh
    scripts/ci/verify-workflow-contracts.sh
    scripts/ci/verify-environment-readiness.sh
    scripts/ci/verify-runtime-config.sh
    scripts/ci/verify-release-manifest.sh
    scripts/ci/verify.sh
    scripts/ci/smoke-images.sh
)

for script in "${required_scripts[@]}"; do
    [[ -x "$root_dir/$script" ]] || { printf 'Required executable is missing: %s\n' "$script" >&2; exit 1; }
done

required_evidence=(
    deploy/readiness/staging.json
    deploy/readiness/production.json
    deploy/evidence/backup-restore.json
    deploy/evidence/provider-migration.json
)

for evidence in "${required_evidence[@]}"; do
    [[ -f "$root_dir/$evidence" ]] || { printf 'Operational evidence is missing: %s\n' "$evidence" >&2; exit 1; }
done

"$root_dir/scripts/ci/verify.sh"
"$root_dir/scripts/ci/verify-runtime-config.sh"
"$root_dir/scripts/ci/verify-workflow-contracts.sh"
"$root_dir/scripts/ci/verify-environment-readiness.sh" --evidence "$root_dir/deploy/readiness/staging.json"
"$root_dir/scripts/ci/verify-environment-readiness.sh" --evidence "$root_dir/deploy/readiness/production.json"
"$root_dir/scripts/ci/verify-migration-evidence.sh" "$root_dir/deploy/evidence/provider-migration.json"
"$root_dir/scripts/ci/verify-docs-secrets.sh" "$root_dir/docs/deployment"

printf 'Phase 1.5 verification passed\n'
