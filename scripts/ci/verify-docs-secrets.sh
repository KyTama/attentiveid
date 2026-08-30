#!/usr/bin/env bash
set -euo pipefail

target="${1:-docs/deployment}"

if [[ ! -e "$target" ]]; then
    printf 'Documentation path does not exist: %s\n' "$target" >&2
    exit 1
fi

secret_pattern='(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKID[A-Z0-9]{12,}|github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|password[[:space:]]*[:=][[:space:]]*[^${<[:space:]][^[:space:]]{7,}|secret[[:space:]]*[:=][[:space:]]*[^${<[:space:]][^[:space:]]{7,}|token[[:space:]]*[:=][[:space:]]*[^${<[:space:]][^[:space:]]{15,})'

if LC_ALL=C grep -RInE --exclude='*.example' --exclude='*.example.*' "$secret_pattern" "$target"; then
    printf 'Potential secret found under %s\n' "$target" >&2
    exit 1
fi

printf 'Documentation secret scan passed: %s\n' "$target"
