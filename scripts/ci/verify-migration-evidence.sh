#!/usr/bin/env bash
set -euo pipefail

evidence="${1:-}"

if [[ -z "$evidence" || ! -f "$evidence" ]]; then
    printf 'Usage: %s <provider-migration-evidence.json>\n' "$0" >&2
    exit 1
fi

bun -e '
const path = process.argv[1];
const evidence = await Bun.file(path).json();
const digest = /^ghcr\.io\/[a-z0-9_.-]+\/[a-z0-9_.-]+@sha256:[a-f0-9]{64}$/;
const checksum = /^sha256:[a-f0-9]{64}$/;
const required = [
  [evidence.clean_host === true, "clean_host must be true"],
  [typeof evidence.provider === "string" && evidence.provider.length > 1, "provider is required"],
  [checksum.test(evidence.restored_backup_checksum ?? ""), "restored_backup_checksum must be sha256"],
  [digest.test(evidence.web_image ?? ""), "web_image must be an immutable GHCR digest"],
  [digest.test(evidence.api_image ?? ""), "api_image must be an immutable GHCR digest"],
  [evidence.https?.web === true && evidence.https?.api === true, "HTTPS web and API checks must pass"],
  [evidence.rollback?.passed === true, "rollback evidence must pass"],
  [evidence.tencent_specific_changes === false, "Tencent-specific application changes are forbidden"],
];
const failures = required.filter(([ok]) => !ok).map(([, message]) => message);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
' "$evidence"

printf 'Migration evidence passed: %s\n' "$evidence"
