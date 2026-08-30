#!/usr/bin/env bash
set -euo pipefail

host=''
user=''
identity=''
known_hosts=''
bundle=''
checksum=''
manifest=''
environment=''
remote_root='/opt/attentive'

while [[ $# -gt 0 ]]; do
    case "$1" in
        --host) host="$2"; shift 2 ;;
        --user) user="$2"; shift 2 ;;
        --identity) identity="$2"; shift 2 ;;
        --known-hosts) known_hosts="$2"; shift 2 ;;
        --bundle) bundle="$2"; shift 2 ;;
        --checksum) checksum="$2"; shift 2 ;;
        --manifest) manifest="$2"; shift 2 ;;
        --environment) environment="$2"; shift 2 ;;
        --remote-root) remote_root="$2"; shift 2 ;;
        *) printf 'Unknown argument: %s\n' "$1" >&2; exit 1 ;;
    esac
done

[[ -n "$host" && -n "$user" && -f "$identity" && -f "$known_hosts" ]] || { printf 'Strict SSH connection inputs are required\n' >&2; exit 1; }
[[ -f "$bundle" && -f "$checksum" && -f "$manifest" ]] || { printf 'Bundle, checksum, and release manifest are required\n' >&2; exit 1; }
[[ "$environment" =~ ^(staging|production)$ ]] || { printf 'Environment must be staging or production\n' >&2; exit 1; }

ssh_options=(-i "$identity" -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$known_hosts")
remote="$user@$host"
release_name="$(basename "$bundle")"
remote_upload="$remote_root/uploads/$release_name"

ssh "${ssh_options[@]}" "$remote" "install -d -m 0750 '$remote_root/uploads' '$remote_root/manifests/$environment'"
scp "${ssh_options[@]}" "$bundle" "$checksum" "$manifest" "$remote:$remote_root/uploads/"
ssh "${ssh_options[@]}" "$remote" "
set -euo pipefail
bundle='$remote_upload'
checksum='$remote_root/uploads/$(basename "$checksum")'
release_manifest='$remote_root/uploads/$(basename "$manifest")'
bundle_version=\$(sed -n 's/^BUNDLE_VERSION=//p' \"\$release_manifest\")
'$remote_root/current/scripts/deploy/install-release-bundle.sh' --bundle \"\$bundle\" --checksum \"\$checksum\" --version \"\$bundle_version\" --root '$remote_root'
candidate='$remote_root/manifests/$environment/candidate.env'
cat '/etc/attentive/$environment.env' \"\$release_manifest\" >\"\$candidate\"
'$remote_root/current/scripts/deploy/deploy.sh' --env-file \"\$candidate\" --root '$remote_root'
"

printf 'Remote deployment passed: %s\n' "$environment"
