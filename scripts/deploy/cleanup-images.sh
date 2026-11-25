#!/usr/bin/env bash
# Removes old Attentive images from the server so deployments do not fill the disk.
#
# Only the two Attentive repositories are touched: the server is shared with other projects.
# Kept: every image named in a current, previous or candidate release manifest (any environment),
# and anything a container is using (docker refuses to remove those without --force, which is never passed).
# A removed release can still be rolled back to, because rollback pulls it again from the registry.
set -euo pipefail

deploy_root="${DEPLOY_ROOT:-/opt/attentive}"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --root) deploy_root="$2"; shift 2 ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

keep=''
for manifest in "$deploy_root"/manifests/*/current.env "$deploy_root"/manifests/*/previous.env "$deploy_root"/manifests/*/candidate.env; do
    [[ -f "$manifest" ]] || continue
    keep+="$(sed -n -E 's/^(WEB_IMAGE|API_IMAGE)=//p' "$manifest" | tr -d "\"'\r")"$'\n'
done

# Without a list of what to keep, remove nothing.
if [[ "$keep" != *'@sha256:'* ]]; then
    printf 'Image cleanup skipped: no release manifest found under %s\n' "$deploy_root"
    exit 0
fi

removed=0
for repository in ghcr.io/kytama/attentiveid-web ghcr.io/kytama/attentiveid-api; do
    images="$(docker image ls --digests --format '{{.Repository}}@{{.Digest}}' "$repository")"
    while IFS= read -r image; do
        [[ "$image" == "$repository@sha256:"* ]] || continue
        grep -Fxq -- "$image" <<<"$keep" && continue
        if docker image rm "$image" >/dev/null 2>&1; then
            removed=$((removed + 1))
        else
            printf 'Image left in place (still in use): %s\n' "$image"
        fi
    done <<<"$images"
done

printf 'Image cleanup removed %s old image(s). Disk space:\n' "$removed"
df -h "$deploy_root" || true
