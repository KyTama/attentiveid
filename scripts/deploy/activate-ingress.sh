#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ "${1:-}" == "--fixtures-only" ]]; then
    grep -q 'reverse_proxy attentive-api:3000' "$root_dir/deploy/Caddyfile"
    grep -q 'reverse_proxy attentive-web:8080' "$root_dir/deploy/Caddyfile"
    grep -q 'attentive-api:3000' "$root_dir/deploy/ingress/nginx.conf"
    grep -q 'attentive-web:8080' "$root_dir/deploy/ingress/nginx.conf"
    grep -q 'exposedByDefault: false' "$root_dir/deploy/ingress/traefik.yml"
    printf 'Ingress activation fixtures passed\n'
    exit 0
fi

owner=''
source_file=''
target_file=''
reload_command=''
dry_run=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --owner) owner="$2"; shift 2 ;;
        --source) source_file="$2"; shift 2 ;;
        --target) target_file="$2"; shift 2 ;;
        --reload-command) reload_command="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

case "$owner" in
    caddy|nginx|traefik) ;;
    *) printf 'Ingress owner must be caddy, nginx, or traefik\n' >&2; exit 1 ;;
esac
[[ -f "$source_file" && -n "$target_file" && -n "$reload_command" ]] || { printf 'Source, target, and reload command are required\n' >&2; exit 1; }

if [[ "$dry_run" == true ]]; then
    printf 'Would activate %s ingress from %s at %s\n' "$owner" "$source_file" "$target_file"
    exit 0
fi

backup_file="${target_file}.previous"
[[ ! -f "$target_file" ]] || cp -p "$target_file" "$backup_file"
install -m 0644 "$source_file" "$target_file"

if ! bash -lc "$reload_command"; then
    [[ ! -f "$backup_file" ]] || install -m 0644 "$backup_file" "$target_file"
    bash -lc "$reload_command" || true
    printf 'Ingress reload failed; previous configuration restored\n' >&2
    exit 1
fi

printf 'Ingress activated: %s\n' "$owner"
