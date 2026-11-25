#!/usr/bin/env bash
# Runs the server image cleanup against a stand-in "docker" and checks what it would remove.
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

digest() { printf 'sha256:%064d' "$1"; }
web=ghcr.io/kytama/attentiveid-web
api=ghcr.io/kytama/attentiveid-api

mkdir -p "$work/bin" "$work/root/manifests/staging"
# 1 = current, 2 = previous, 3 = old and unused, 4 = old but still used by a container.
printf 'WEB_IMAGE=%s\nAPI_IMAGE=%s\n' "$web@$(digest 1)" "$api@$(digest 1)" >"$work/root/manifests/staging/current.env"
printf 'WEB_IMAGE=%s\r\nAPI_IMAGE=%s\r\n' "$web@$(digest 2)" "$api@$(digest 2)" >"$work/root/manifests/staging/previous.env"

cat >"$work/bin/docker" <<EOF
#!/usr/bin/env bash
if [[ "\$1 \$2" == 'image ls' ]]; then
    repository="\${@: -1}"
    for n in 1 2 3 4; do printf '%s@sha256:%064d\n' "\$repository" "\$n"; done
    printf '%s@<none>\n' "\$repository"
elif [[ "\$1 \$2" == 'image rm' ]]; then
    [[ "\$3" != *0004 ]] || exit 1
    printf '%s\n' "\$3" >>"$work/removed"
else
    printf 'unexpected docker command: %s\n' "\$*" >&2
    exit 1
fi
EOF
chmod +x "$work/bin/docker"

PATH="$work/bin:$PATH" bash "$root_dir/scripts/deploy/cleanup-images.sh" --root "$work/root" >/dev/null
diff <(sort "$work/removed") <(printf '%s\n' "$api@$(digest 3)" "$web@$(digest 3)")

# With no manifest at all, nothing may be removed.
rm -f "$work/removed"
mkdir -p "$work/empty"
PATH="$work/bin:$PATH" bash "$root_dir/scripts/deploy/cleanup-images.sh" --root "$work/empty" >/dev/null
[[ ! -e "$work/removed" ]]

grep -qx 'scripts/deploy/cleanup-images.sh' "$root_dir/deploy/install-manifest.txt"
printf 'Image cleanup checks passed\n'
