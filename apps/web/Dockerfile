FROM oven/bun:1.4.0-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
COPY apps/web apps/web
RUN bun run build:web

FROM caddy:2.10.2-alpine AS runtime

RUN setcap -r /usr/bin/caddy && \
    addgroup -S -g 10001 app && adduser -S -D -H -u 10001 -G app app && \
    chown -R app:app /config /data /etc/caddy

COPY --chown=app:app apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=app:app /app/apps/web/dist /srv

USER app
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1:8080/healthz"]
