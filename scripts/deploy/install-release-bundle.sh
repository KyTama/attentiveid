#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
root="/opt/attentive"
bundle=''
checksum_file=''
version=''
fixture=''
dry_run=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --bundle) bundle="$2"; shift 2 ;;
        --checksum) checksum_file="$2"; shift 2 ;;
        --version) version="$2"; shift 2 ;;
        --fixture) fixture="$2"; shift 2 ;;
        --root) root="$2"; shift 2 ;;
        --dry-run) dry_run=true; shift ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

if [[ -n "$fixture" ]]; then
    bun -e '
const value = await Bun.file(process.argv[1]).json();
if (!/^[a-zA-Z0-9._-]+$/.test(value.bundle_version ?? "")) throw new Error("invalid fixture bundle version");
if (!/^sha256:[a-f0-9]{64}$/.test(value.checksum ?? "")) throw new Error("invalid fixture checksum");
' "$fixture"
    printf 'Release bundle fixture passed for root %s\n' "$root"
    exit 0
fi

[[ -f "$bundle" && -f "$checksum_file" && "$version" =~ ^[a-zA-Z0-9._-]+$ ]] || {
    printf 'Bundle, checksum file, and safe version are required\n' >&2
    exit 1
}

expected_checksum="$(awk '{ print $1 }' "$checksum_file")"
actual_checksum="$(shasum -a 256 "$bundle" | awk '{ print $1 }')"
[[ "$expected_checksum" == "$actual_checksum" ]] || { printf 'Release bundle checksum mismatch\n' >&2; exit 1; }

manifest="$repo_root/deploy/install-manifest.txt"
archive_list="$(mktemp)"
tar -tzf "$bundle" | sed 's#^\./##' | sed '/\/$/d' | sort >"$archive_list"
if grep -Eq '(^/|(^|/)\.\.(/|$))' "$archive_list"; then
    printf 'Release bundle contains an unsafe path\n' >&2
    exit 1
fi
diff -u <(sort "$manifest") "$archive_list"

release_dir="$root/releases/$version"
if [[ "$dry_run" == true ]]; then
    printf 'Would install verified bundle at %s\n' "$release_dir"
    exit 0
fi

[[ ! -e "$release_dir" ]] || { printf 'Release already installed: %s\n' "$release_dir"; exit 0; }
install -d -m 0750 "$release_dir"
tar -xzf "$bundle" -C "$release_dir" --no-same-owner --no-same-permissions
chmod -R go-rwx "$release_dir"
ln -sfn "$release_dir" "$root/current"

printf 'Installed release bundle: %s\n' "$release_dir"
