#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fixture_env="$root_dir/tests/fixtures/deploy/compose.env"
compose_file="$root_dir/compose.production.yml"
rendered="$(mktemp)"
trap 'rm -f "$rendered"' EXIT

docker compose --profile maintenance --env-file "$fixture_env" -f "$compose_file" config >"$rendered"

digest_pattern='ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+@sha256:[a-f0-9]{64}'
image_count="$(grep -E "image: $digest_pattern" "$rendered" | sort -u | wc -l | tr -d ' ')"
[[ "$image_count" -eq 2 ]] || { printf 'Compose must render exactly two unique immutable GHCR image digests\n' >&2; exit 1; }

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
for (const [serviceName, command] of Object.entries({
  migrate: ["bun", "run", "dist/migrate.js"],
  "seed-landing": ["bun", "run", "dist/seed-landing.js"],
  "seed-psychologists": ["bun", "run", "dist/seed-psychologists.js"],
})) {
  const service = config.services[serviceName];
  if (!service) throw new Error(`${serviceName} maintenance job is required`);
  if (!service.profiles?.includes("maintenance")) throw new Error(`${serviceName} must stay out of normal service startup`);
  if (JSON.stringify(service.command) !== JSON.stringify(command)) throw new Error(`${serviceName} command must use the packaged API runner`);
  if (Object.keys(service.networks ?? {}).join(",") !== "postgres") throw new Error(`${serviceName} must only use the PostgreSQL network`);
  if (!service.read_only || service.restart !== "no") throw new Error(`${serviceName} must be an ephemeral hardened job`);
}
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
grep -Fq "stat -c '%a'" "$root_dir/scripts/deploy/preflight.sh"
grep -Fq "stat -f '%Lp'" "$root_dir/scripts/deploy/preflight.sh"
grep -Fq '"$env_file" -ef "$candidate_env"' "$root_dir/scripts/deploy/deploy.sh"
grep -Fq 'PREVIEW_HMAC_SECRET' "$root_dir/scripts/deploy/preflight.sh"
grep -Fq -- "-e PREVIEW_HMAC_SECRET=" "$root_dir/scripts/ci/smoke-images.sh"
grep -Eq '^PREVIEW_HMAC_SECRET=.{32,}$' "$root_dir/tests/fixtures/deploy/host-secret.env"
grep -Fq 'src/db/migrate.ts --outfile=dist/migrate.js' "$root_dir/apps/api/Dockerfile"
grep -Fq 'src/db/seed-landing.ts --outfile=dist/seed-landing.js' "$root_dir/apps/api/Dockerfile"
grep -Fq 'src/db/seed-psychologists.ts --outfile=dist/seed-psychologists.js' "$root_dir/apps/api/Dockerfile"
grep -Fq 'COPY --from=build --chown=bun:bun /app/apps/api/drizzle ./drizzle' "$root_dir/apps/api/Dockerfile"
grep -Fq 'ENV MIGRATIONS_DIR=/app/apps/api/drizzle' "$root_dir/apps/api/Dockerfile"
grep -Fq -- '--profile maintenance' "$root_dir/scripts/deploy/deploy.sh"
grep -Fq 'run --rm --no-deps migrate' "$root_dir/scripts/deploy/deploy.sh"
grep -Fq 'run --rm --no-deps seed-landing' "$root_dir/scripts/deploy/deploy.sh"
grep -Fq 'run --rm --no-deps seed-psychologists' "$root_dir/scripts/deploy/deploy.sh"
grep -Fq 'dist/migrate.js dist/seed-landing.js dist/seed-psychologists.js' "$root_dir/scripts/ci/smoke-images.sh"
grep -Fq "API landing content" "$root_dir/scripts/ci/smoke-images.sh"

if grep -RinE 'tencent|cvm|cos\.tencent' "$compose_file" "$root_dir/deploy/Caddyfile" "$root_dir/deploy/ingress" "$root_dir/deploy/env"; then
    printf 'Runtime configuration must remain provider-neutral\n' >&2
    exit 1
fi

printf 'Runtime configuration passed\n'
