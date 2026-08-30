#!/usr/bin/env bash
set -euo pipefail

commit_sha=''
web_image=''
api_image=''
bundle_version=''
bundle_sha256=''
output=''

while [[ $# -gt 0 ]]; do
    case "$1" in
        --commit) commit_sha="$2"; shift 2 ;;
        --web-image) web_image="$2"; shift 2 ;;
        --api-image) api_image="$2"; shift 2 ;;
        --bundle-version) bundle_version="$2"; shift 2 ;;
        --bundle-sha256) bundle_sha256="$2"; shift 2 ;;
        --output) output="$2"; shift 2 ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ "$commit_sha" =~ ^[a-f0-9]{40}$ ]] || { printf 'Full commit SHA is required\n' >&2; exit 1; }
[[ "$web_image" =~ ^ghcr\.io/kytama/attentiveid-web@sha256:[a-f0-9]{64}$ ]] || { printf 'Invalid web image identity\n' >&2; exit 1; }
[[ "$api_image" =~ ^ghcr\.io/kytama/attentiveid-api@sha256:[a-f0-9]{64}$ ]] || { printf 'Invalid API image identity\n' >&2; exit 1; }
[[ "$bundle_version" =~ ^[a-zA-Z0-9._-]+$ ]] || { printf 'Safe bundle version is required\n' >&2; exit 1; }
[[ "$bundle_sha256" =~ ^[a-f0-9]{64}$ ]] || { printf 'Bundle SHA-256 is required\n' >&2; exit 1; }
[[ -n "$output" ]] || { printf 'Output path is required\n' >&2; exit 1; }

umask 077
cat >"$output" <<EOF
COMMIT_SHA=$commit_sha
WEB_IMAGE=$web_image
API_IMAGE=$api_image
BUNDLE_VERSION=$bundle_version
BUNDLE_SHA256=$bundle_sha256
EOF

printf 'Release manifest created: %s\n' "$output"
