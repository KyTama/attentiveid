#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
output=''

while [[ $# -gt 0 ]]; do
    case "$1" in
        --output) output="$2"; shift 2 ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ -n "$output" ]] || { printf 'Output prefix is required\n' >&2; exit 1; }
archive="${output}.tar.gz"
checksum_file="${archive}.sha256"
manifest="$root_dir/deploy/install-manifest.txt"

while IFS= read -r path; do
    [[ -n "$path" ]] || continue
    [[ -f "$root_dir/$path" ]] || { printf 'Bundle allowlist entry is missing: %s\n' "$path" >&2; exit 1; }
done <"$manifest"

mkdir -p "$(dirname "$output")"
COPYFILE_DISABLE=1 tar -cf - -C "$root_dir" -T "$manifest" | gzip -n >"$archive"
checksum="$(shasum -a 256 "$archive" | awk '{ print $1 }')"
printf '%s  %s\n' "$checksum" "$(basename "$archive")" >"$checksum_file"

printf 'BUNDLE_ARCHIVE=%s\n' "$archive"
printf 'BUNDLE_SHA256=%s\n' "$checksum"
