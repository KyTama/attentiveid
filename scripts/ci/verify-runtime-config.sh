#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_env="$root_dir/tests/fixtures/deploy/compose.env"
compose_file="$root_dir/compose.production.yml"
rendered="$(mktemp)"
trap 'rm -f "$rendered"' EXIT

docker compose --env-file "$fixture_env" -f "$compose_file" config >"$rendered"

digest_pattern='ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}'
image_count="$(grep -Ec "image: $digest_pattern" "$rendered")"
[[ "$image_count" -eq 2 ]] || { printf 'Compose must render exactly two immutable GHCR image digests\n' >&2; exit 1; }

if grep -Eq '^[[:space:]]+ports:' "$rendered"; then
    printf 'Application services must not publish public ports\n' >&2
    exit 1
fi

healthcheck_count="$(grep -Ec '^[[:space:]]+healthcheck:' "$rendered")"
[[ "$healthcheck_count" -eq 2 ]] || { printf 'Both application services require healthchecks\n' >&2; exit 1; }

bun -e '
import { load } from "js-yaml";
const config = load(await Bun.file(process.argv[1]).text());
const traefik = load(await Bun.file(process.argv[2]).text());
const webNetworks = Object.keys(config.services.web.networks ?? {});
const apiNetworks = Object.keys(config.services.api.networks ?? {});
if (webNetworks.length !== 1 || webNetworks[0] !== "ingress") throw new Error("web must only use ingress network");
if (!apiNetworks.includes("ingress") || !apiNetworks.includes("postgres") || apiNetworks.length !== 2) throw new Error("api must use ingress and postgres networks only");
if (config.networks.ingress.external !== true || config.networks.postgres.external !== true) throw new Error("shared networks must be external");
if (traefik.entryPoints?.websecure?.address !== ":443") throw new Error("Traefik must use the existing websecure entrypoint");
if (traefik.providers?.docker?.exposedByDefault !== false) throw new Error("Traefik must deny unlabeled containers");
' "$rendered" "$root_dir/deploy/ingress/traefik.yml"

grep -q 'handle /api/\*' "$root_dir/deploy/Caddyfile"
grep -q 'reverse_proxy attentive-api:3000' "$root_dir/deploy/Caddyfile"
grep -q 'reverse_proxy attentive-web:8080' "$root_dir/deploy/Caddyfile"
grep -q 'location /api/' "$root_dir/deploy/ingress/nginx.conf"
grep -q 'attentive-api:3000' "$root_dir/deploy/ingress/nginx.conf"
grep -q 'attentive-web:8080' "$root_dir/deploy/ingress/nginx.conf"
grep -q 'PathPrefix(`/api`)' "$compose_file"

read_value() {
    local file="$1"
    local key="$2"
    sed -n "s/^${key}=//p" "$file" | tail -1
}

staging="$root_dir/deploy/env/staging.example"
production="$root_dir/deploy/env/production.example"
[[ "$(read_value "$staging" COMPOSE_PROJECT_NAME)" != "$(read_value "$production" COMPOSE_PROJECT_NAME)" ]]
[[ "$(read_value "$staging" DATABASE_NAME)" != "$(read_value "$production" DATABASE_NAME)" ]]
[[ "$(read_value "$staging" DATABASE_ROLE)" != "$(read_value "$production" DATABASE_ROLE)" ]]
[[ "$(read_value "$staging" HOST_SECRET_FILE)" == '/etc/attentive/staging.secret.env' ]]
[[ "$(read_value "$production" HOST_SECRET_FILE)" == '/etc/attentive/production.secret.env' ]]
grep -Fq '/etc/attentive/$environment.deploy.env' "$root_dir/scripts/deploy/remote-deploy.sh"

if grep -RinE 'tencent|cvm|cos\.tencent' "$compose_file" "$root_dir/deploy/Caddyfile" "$root_dir/deploy/ingress" "$root_dir/deploy/env"; then
    printf 'Runtime configuration must remain provider-neutral\n' >&2
    exit 1
fi

printf 'Runtime configuration passed\n'
