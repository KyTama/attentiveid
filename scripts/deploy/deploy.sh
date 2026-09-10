#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file=''
fixture=false
dry_run=false
deploy_root="${DEPLOY_ROOT:-/opt/attentive}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --env-file) env_file="$2"; shift 2 ;;
        --fixture) env_file="$2"; fixture=true; shift 2 ;;
        --root) deploy_root="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

preflight_args=(--env-file "$env_file")
[[ "$fixture" == false ]] || preflight_args=(--fixture "$env_file")
[[ "$dry_run" == false ]] || preflight_args+=(--dry-run)
"$root_dir/scripts/deploy/preflight.sh" "${preflight_args[@]}"

set -a
source "$env_file"
set +a

if [[ "$dry_run" == true ]]; then
    printf 'Would acquire environment lock: %s/locks/%s.lock\n' "$deploy_root" "$ENVIRONMENT"
    printf 'Would deploy exact images: %s and %s\n' "$WEB_IMAGE" "$API_IMAGE"
    exit 0
fi

lock_dir="$deploy_root/locks/$ENVIRONMENT.lock"
mkdir "$lock_dir" 2>/dev/null || { printf 'Deployment already running for %s\n' "$ENVIRONMENT" >&2; exit 1; }
trap 'rmdir "$lock_dir" 2>/dev/null || true' EXIT

manifest_dir="$deploy_root/manifests/$ENVIRONMENT"
install -d -m 0750 "$manifest_dir"
[[ ! -f "$manifest_dir/current.env" ]] || cp -p "$manifest_dir/current.env" "$manifest_dir/previous.env"
candidate_env="$manifest_dir/candidate.env"
if [[ "$env_file" -ef "$candidate_env" ]]; then
    chmod 0600 "$candidate_env"
else
    install -m 0600 "$env_file" "$candidate_env"
fi
env_file="$candidate_env"

docker compose --profile maintenance --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" pull
docker compose --profile maintenance --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" run --rm --no-deps migrate
docker compose --profile maintenance --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" run --rm --no-deps seed-landing
docker compose --profile maintenance --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" run --rm --no-deps seed-psychologists
docker compose --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" up -d --remove-orphans --wait
"$deploy_root/current/scripts/deploy/healthcheck.sh" --web-url "$PUBLIC_WEB_URL" --api-url "$PUBLIC_API_URL"
mv "$candidate_env" "$manifest_dir/current.env"

printf 'Deployment passed: %s\n' "$ENVIRONMENT"
