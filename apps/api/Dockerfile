FROM oven/bun:1.4.0-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile

COPY apps/api apps/api
RUN bun run build:api

FROM oven/bun:1.4.0-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=bun:bun /app/apps/api/dist/index.js ./index.js

USER bun
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 CMD ["bun", "-e", "const response = await fetch('http://127.0.0.1:3000/ready'); if (!response.ok) process.exit(1)"]
CMD ["bun", "run", "index.js"]
