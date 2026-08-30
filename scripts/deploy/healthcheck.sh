#!/usr/bin/env bash
set -euo pipefail

web_url="${PUBLIC_WEB_URL:-}"
api_url="${PUBLIC_API_URL:-}"
attempts="${HEALTHCHECK_ATTEMPTS:-30}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --web-url) web_url="$2"; shift 2 ;;
        --api-url) api_url="$2"; shift 2 ;;
        --attempts) attempts="$2"; shift 2 ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ "$web_url" =~ ^https:// && "$api_url" =~ ^https:// ]] || { printf 'HTTPS web and API URLs are required\n' >&2; exit 1; }

wait_for_url() {
    local label="$1"
    local url="$2"
    for ((attempt = 1; attempt <= attempts; attempt++)); do
        if curl --fail --silent --show-error --max-time 5 "$url" >/dev/null; then
            return 0
        fi
        sleep 2
    done
    printf '%s healthcheck failed: %s\n' "$label" "$url" >&2
    return 1
}

wait_for_url web "$web_url"
wait_for_url api "$api_url"
printf 'Public healthchecks passed\n'
