#!/usr/bin/env bash
set -euo pipefail

manifest="${1:-}"
[[ -f "$manifest" ]] || { printf 'Release manifest is required\n' >&2; exit 1; }

set -a
source "$manifest"
set +a

[[ "${COMMIT_SHA:-}" =~ ^[a-f0-9]{40}$ ]] || { printf 'Manifest requires a full commit SHA\n' >&2; exit 1; }
[[ "${WEB_IMAGE:-}" =~ ^ghcr\.io/kytama/attentiveid-web@sha256:[a-f0-9]{64}$ ]] || { printf 'Manifest web image is invalid\n' >&2; exit 1; }
[[ "${API_IMAGE:-}" =~ ^ghcr\.io/kytama/attentiveid-api@sha256:[a-f0-9]{64}$ ]] || { printf 'Manifest API image is invalid\n' >&2; exit 1; }
[[ "${BUNDLE_VERSION:-}" =~ ^[a-zA-Z0-9._-]+$ ]] || { printf 'Manifest bundle version is invalid\n' >&2; exit 1; }
[[ "${BUNDLE_SHA256:-}" =~ ^[a-f0-9]{64}$ ]] || { printf 'Manifest bundle checksum is invalid\n' >&2; exit 1; }

if grep -Eiq '(password|secret|private[_-]?key|token)=' "$manifest"; then
    printf 'Release manifest must not contain secrets\n' >&2
    exit 1
fi

printf 'Release manifest passed: %s\n' "$manifest"
