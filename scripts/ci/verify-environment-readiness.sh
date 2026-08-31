#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

verify_evidence() {
    local evidence="$1"
    bun -e '
const path = process.argv[1];
const value = await Bun.file(path).json();
const allowedIngress = new Set(["caddy", "nginx", "traefik"]);
const failures = [];
const requireValue = (condition, message) => { if (!condition) failures.push(message); };
requireValue(["staging", "production"].includes(value.environment), "environment must be staging or production");
requireValue(value.github?.environment === true, "GitHub Environment is required");
requireValue(value.github?.environment_name === value.environment, "GitHub Environment name must match");
requireValue(value.github?.restricted_refs === true, "deployment refs must be restricted");
if (value.environment === "production") {
  requireValue(value.github?.required_reviewer === true, "production required reviewer protection is required");
  requireValue(value.github?.prevent_self_review === true, "production prevent self-review must be enabled");
}
requireValue(value.ssh?.transport === "tailscale", "Tailscale SSH transport is required");
requireValue(Boolean(value.ssh?.host), "deployment SSH host is required");
requireValue(Number.isInteger(value.ssh?.port) && value.ssh.port >= 1 && value.ssh.port <= 65535, "valid SSH port is required");
requireValue(value.ssh?.deploy_key_configured === true, "deploy SSH key is required");
requireValue(/^SHA256:[A-Za-z0-9+/=._-]{8,}$/.test(value.ssh?.host_key ?? ""), "trusted SSH host key is required");
requireValue(["public", "private"].includes(value.registry?.visibility), "GHCR visibility is required");
requireValue(value.registry?.pull_access === true, "GHCR pull access is required");
requireValue(allowedIngress.has(value.runtime?.ingress_owner), "exactly one supported ingress owner is required");
requireValue(Boolean(value.runtime?.ingress_network), "ingress network is required");
requireValue(Boolean(value.runtime?.postgres_network), "PostgreSQL network is required");
requireValue(Boolean(value.database?.host), "database host is required");
requireValue(Boolean(value.database?.database), "dedicated database is required");
requireValue(Boolean(value.database?.role), "dedicated database role is required");
requireValue(value.database?.database !== "n8n" && value.database?.role !== "n8n", "n8n database identity cannot be reused");
requireValue(value.dns?.configured === true && Boolean(value.dns?.hostname), "configured DNS hostname is required");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
' "$evidence"
}

if [[ "${1:-}" == "--fixtures-only" ]]; then
    verify_evidence "$root_dir/tests/fixtures/deploy/readiness.valid.json"
    for invalid in readiness.missing-reviewer.json readiness.missing-host-key.json readiness.missing-ingress.json; do
        if verify_evidence "$root_dir/tests/fixtures/deploy/$invalid" >/dev/null 2>&1; then
            printf 'Negative readiness fixture unexpectedly passed: %s\n' "$invalid" >&2
            exit 1
        fi
    done
    printf 'Environment readiness fixtures passed\n'
    exit 0
fi

if [[ "${1:-}" != "--evidence" || -z "${2:-}" || ! -f "$2" ]]; then
    printf 'Usage: %s --evidence <readiness.json> | --fixtures-only\n' "$0" >&2
    exit 1
fi

verify_evidence "$2"
printf 'Environment readiness passed: %s\n' "$2"
