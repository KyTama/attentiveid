#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file=''
fixture=false
dry_run=false
deploy_root="${DEPLOY_ROOT:-/opt/attentive}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --manifest) env_file="$2"; shift 2 ;;
        --fixture) env_file="$2"; fixture=true; shift 2 ;;
        --root) deploy_root="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ -f "$env_file" ]] || { printf 'Explicit rollback manifest is required\n' >&2; exit 1; }
set -a
source "$env_file"
set +a

if [[ "$fixture" == true ]]; then
    [[ "${WEB_IMAGE:-}" =~ @sha256:[a-f0-9]{64}$ && "${API_IMAGE:-}" =~ @sha256:[a-f0-9]{64}$ ]] || {
        printf 'Rollback fixture requires immutable image digests\n' >&2
        exit 1
    }
fi

if [[ "$dry_run" == true ]]; then
    printf 'Would roll back to exact images: %s and %s\n' "$WEB_IMAGE" "$API_IMAGE"
    printf 'Database migrations are never reversed automatically\n'
    exit 0
fi

environment="${ENVIRONMENT:?ENVIRONMENT is required}"
lock_dir="$deploy_root/locks/$environment.lock"
mkdir "$lock_dir" 2>/dev/null || { printf 'Deployment already running for %s\n' "$environment" >&2; exit 1; }
trap 'rmdir "$lock_dir" 2>/dev/null || true' EXIT

forensics="$deploy_root/forensics/$environment-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 0750 "$forensics"
docker compose --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" pull
docker compose --env-file "$env_file" -f "$deploy_root/current/compose.production.yml" up -d --remove-orphans --wait
"$deploy_root/current/scripts/deploy/healthcheck.sh" --web-url "$PUBLIC_WEB_URL" --api-url "$PUBLIC_API_URL"

printf 'Rollback passed: %s\n' "$environment"
