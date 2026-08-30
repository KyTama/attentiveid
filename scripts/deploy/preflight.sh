#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file=''
fixture=false
dry_run=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --env-file) env_file="$2"; shift 2 ;;
        --fixture) env_file="$2"; fixture=true; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ -f "$env_file" ]] || { printf 'Environment file is required\n' >&2; exit 1; }
set -a
source "$env_file"
set +a

digest_pattern='^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$'
[[ "${WEB_IMAGE:-}" =~ $digest_pattern ]] || { printf 'WEB_IMAGE must be an immutable GHCR digest\n' >&2; exit 1; }
[[ "${API_IMAGE:-}" =~ $digest_pattern ]] || { printf 'API_IMAGE must be an immutable GHCR digest\n' >&2; exit 1; }
[[ "${ENVIRONMENT:-}" == 'staging' || "${ENVIRONMENT:-}" == 'production' ]] || { printf 'ENVIRONMENT must be staging or production\n' >&2; exit 1; }
[[ "${INGRESS_OWNER:-}" =~ ^(caddy|nginx|traefik)$ ]] || { printf 'Exactly one supported ingress owner is required\n' >&2; exit 1; }
[[ -n "${INGRESS_NETWORK:-}" && -n "${POSTGRES_NETWORK:-}" ]] || { printf 'Shared network names are required\n' >&2; exit 1; }
[[ -n "${DATABASE_NAME:-}" && -n "${DATABASE_ROLE:-}" ]] || { printf 'Dedicated database identity is required\n' >&2; exit 1; }
[[ "$DATABASE_NAME" != 'n8n' && "$DATABASE_ROLE" != 'n8n' ]] || { printf 'n8n database identity cannot be reused\n' >&2; exit 1; }
[[ -n "${PUBLIC_WEB_URL:-}" && -n "${PUBLIC_API_URL:-}" ]] || { printf 'Public health URLs are required\n' >&2; exit 1; }

if [[ "$ENVIRONMENT" == 'production' && -z "${PRODUCTION_APPROVAL_ATTESTATION:-}" ]]; then
    printf 'Production approval attestation is required\n' >&2
    exit 1
fi

if [[ "$fixture" == false ]]; then
    [[ -f "${HOST_SECRET_FILE:-}" ]] || { printf 'Host-local secret file is required\n' >&2; exit 1; }
    secret_mode="$(stat -f '%Lp' "$HOST_SECRET_FILE" 2>/dev/null || stat -c '%a' "$HOST_SECRET_FILE")"
    [[ "$secret_mode" == '600' || "$secret_mode" == '400' ]] || { printf 'Host-local secret file must use mode 0600 or 0400\n' >&2; exit 1; }
    docker network inspect "$INGRESS_NETWORK" >/dev/null
    docker network inspect "$POSTGRES_NETWORK" >/dev/null
fi

compose_env="$(mktemp)"
cat >"$compose_env" <<EOF
COMPOSE_PROJECT_NAME=attentive-${ENVIRONMENT}
WEB_IMAGE=${WEB_IMAGE}
API_IMAGE=${API_IMAGE}
DOMAIN=${PUBLIC_WEB_URL#https://}
INGRESS_NETWORK=${INGRESS_NETWORK}
POSTGRES_NETWORK=${POSTGRES_NETWORK}
HOST_SECRET_FILE=${HOST_SECRET_FILE:-$root_dir/tests/fixtures/deploy/host-secret.env}
FRONTEND_URL=${PUBLIC_WEB_URL}
EOF
docker compose --env-file "$compose_env" -f "$root_dir/compose.production.yml" config --quiet

if [[ "$dry_run" == true ]]; then
    printf 'Preflight dry run passed: %s\n' "$ENVIRONMENT"
    exit 0
fi

printf 'Preflight passed: %s\n' "$ENVIRONMENT"
