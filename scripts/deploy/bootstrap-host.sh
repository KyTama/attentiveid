#!/usr/bin/env bash
set -euo pipefail

root="/opt/attentive"
deploy_user="${SUDO_USER:-${USER:-}}"
dry_run=false
ingress_network="${INGRESS_NETWORK:-shared-ingress}"
postgres_network="${POSTGRES_NETWORK:-shared-postgres}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --root) root="$2"; shift 2 ;;
        --deploy-user) deploy_user="$2"; shift 2 ;;
        --ingress-network) ingress_network="$2"; shift 2 ;;
        --postgres-network) postgres_network="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ "$(uname -s)" == "Linux" ]] || { printf 'A Linux host is required\n' >&2; exit 1; }
case "$(uname -m)" in
    x86_64|aarch64|arm64) ;;
    *) printf 'Unsupported architecture: %s\n' "$(uname -m)" >&2; exit 1 ;;
esac

command -v docker >/dev/null || { printf 'Docker must be installed by the owner\n' >&2; exit 1; }
docker compose version >/dev/null || { printf 'Docker Compose plugin is required\n' >&2; exit 1; }
docker info >/dev/null || { printf 'Deploy user cannot access Docker\n' >&2; exit 1; }

memory_mb="$(awk '/MemTotal/ { print int($2 / 1024) }' /proc/meminfo)"
[[ "$memory_mb" -ge 1024 ]] || { printf 'At least 1 GiB RAM is required\n' >&2; exit 1; }

if [[ "$dry_run" == true ]]; then
    printf 'Would prepare %s for user %s\n' "$root" "$deploy_user"
    printf 'Would ensure external networks: %s, %s\n' "$ingress_network" "$postgres_network"
    exit 0
fi

[[ -n "$deploy_user" ]] || { printf 'Deploy user is required\n' >&2; exit 1; }
install -d -m 0750 -o "$deploy_user" -g "$deploy_user" "$root" "$root/releases" "$root/manifests" "$root/locks" "$root/forensics"

for network in "$ingress_network" "$postgres_network"; do
    docker network inspect "$network" >/dev/null 2>&1 || docker network create "$network" >/dev/null
done

printf 'Host bootstrap passed: %s\n' "$root"
