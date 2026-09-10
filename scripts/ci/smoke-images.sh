#!/usr/bin/env bash
set -euo pipefail

web_image="${WEB_IMAGE:-attentive-web:test}"
api_image="${API_IMAGE:-attentive-api:test}"
suffix="${RANDOM}-$$"
network="attentive-smoke-$suffix"
web_container="attentive-web-$suffix"
api_container="attentive-api-$suffix"
database_container="attentive-postgres-$suffix"
failed=1

cleanup() {
    if [[ "$failed" -ne 0 ]]; then
        docker logs "$web_container" 2>/dev/null || true
        docker logs "$api_container" 2>/dev/null || true
        docker logs "$database_container" 2>/dev/null || true
    fi
    docker rm -f "$web_container" "$api_container" "$database_container" >/dev/null 2>&1 || true
    docker network rm "$network" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker image inspect "$web_image" >/dev/null 2>&1 || docker pull "$web_image" >/dev/null
docker image inspect "$api_image" >/dev/null 2>&1 || docker pull "$api_image" >/dev/null
docker network create "$network" >/dev/null

docker run -d \
    --name "$database_container" \
    --network "$network" \
    --network-alias postgres \
    -e POSTGRES_DB=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_USER=postgres \
    postgres:16-alpine >/dev/null

for ((attempt = 1; attempt <= 30; attempt++)); do
    if docker exec "$database_container" pg_isready -U postgres -d postgres >/dev/null; then
        break
    fi
    if [[ "$attempt" -eq 30 ]]; then
        printf 'PostgreSQL smoke database did not become ready\n' >&2
        exit 1
    fi
    sleep 1
done

database_url='postgresql://postgres:postgres@postgres:5432/postgres'
for runner in \
    dist/migrate.js \
    dist/seed-landing.js \
    dist/seed-psychologists.js \
    dist/seed-landing.js \
    dist/seed-psychologists.js; do
    docker run --rm \
        --network "$network" \
        --read-only \
        --cap-drop ALL \
        --security-opt no-new-privileges:true \
        --tmpfs /tmp:size=16m,uid=1000,gid=1000,mode=0700 \
        -e DATABASE_URL="$database_url" \
        "$api_image" bun run "$runner"
done

docker run -d \
    --name "$api_container" \
    --network "$network" \
    -e DATABASE_URL="$database_url" \
    -e FRONTEND_URL='http://localhost:5173' \
    -e PREVIEW_HMAC_SECRET='image-smoke-preview-secret-2026-ABCDEFG' \
    -p 127.0.0.1::3000 \
    "$api_image" >/dev/null

docker run -d \
    --name "$web_container" \
    --network "$network" \
    --read-only \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    --tmpfs /config:size=16m,uid=10001,gid=10001,mode=0700 \
    --tmpfs /data:size=16m,uid=10001,gid=10001,mode=0700 \
    -p 127.0.0.1::8080 \
    "$web_image" >/dev/null

if docker exec "$web_container" grep -R -q 'http://localhost:3000' /srv; then
    printf 'Web image contains a localhost API fallback\n' >&2
    exit 1
fi

web_port="$(docker port "$web_container" 8080/tcp | awk -F: 'NR == 1 { print $NF }')"
api_port="$(docker port "$api_container" 3000/tcp | awk -F: 'NR == 1 { print $NF }')"

wait_for_url() {
    local name="$1"
    local url="$2"
    local attempts=30
    for ((attempt = 1; attempt <= attempts; attempt++)); do
        if curl --fail --silent --show-error --max-time 2 "$url" >/dev/null; then
            return 0
        fi
        sleep 1
    done
    printf '%s did not become ready: %s\n' "$name" "$url" >&2
    return 1
}

wait_for_url 'Web image' "http://127.0.0.1:$web_port/healthz"
wait_for_url 'Web root' "http://127.0.0.1:$web_port/"
wait_for_url 'Web client route' "http://127.0.0.1:$web_port/future-interactive-route"
wait_for_url 'Psychologist directory route' "http://127.0.0.1:$web_port/psychologists"
wait_for_url 'Psychologist profile route' "http://127.0.0.1:$web_port/psychologists/syazka"
wait_for_url 'API readiness' "http://127.0.0.1:$api_port/ready"
wait_for_url 'API landing content' "http://127.0.0.1:$api_port/api/content/landing"

wait_for_health() {
    local name="$1"
    local container="$2"
    local attempts=30
    local status='starting'
    for ((attempt = 1; attempt <= attempts; attempt++)); do
        status="$(docker inspect --format '{{.State.Health.Status}}' "$container")"
        if [[ "$status" == 'healthy' ]]; then
            return 0
        fi
        if [[ "$status" == 'unhealthy' ]]; then
            break
        fi
        sleep 1
    done
    printf '%s container is not healthy: %s\n' "$name" "$status" >&2
    return 1
}

wait_for_health 'Web' "$web_container"
wait_for_health 'API' "$api_container"

web_status="$(docker inspect --format '{{.State.Health.Status}}' "$web_container")"
api_status="$(docker inspect --format '{{.State.Health.Status}}' "$api_container")"
[[ "$web_status" == 'healthy' ]] || { printf 'Web container is not healthy: %s\n' "$web_status" >&2; exit 1; }
[[ "$api_status" == 'healthy' ]] || { printf 'API container is not healthy: %s\n' "$api_status" >&2; exit 1; }

failed=0
printf 'Image smoke tests passed\n'
