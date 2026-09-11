FROM oven/bun:1.4.0-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN bun run build:api && \
    cd apps/api && \
    bun build src/db/migrate.ts --outfile=dist/migrate.js --target=bun && \
    bun build src/db/seed-landing.ts --outfile=dist/seed-landing.js --target=bun && \
    bun build src/db/seed-psychologists.ts --outfile=dist/seed-psychologists.js --target=bun && \
    bun build src/db/seed-users.ts --outfile=dist/seed-users.js --target=bun

FROM oven/bun:1.4.0-alpine AS runtime

WORKDIR /app/apps/api
ENV NODE_ENV=production
ENV PORT=3000
ENV MIGRATIONS_DIR=/app/apps/api/drizzle

COPY --from=build --chown=bun:bun /app/apps/api/dist ./dist
COPY --from=build --chown=bun:bun /app/apps/api/drizzle ./drizzle

USER bun
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 CMD ["bun", "-e", "const response = await fetch('http://127.0.0.1:3000/ready'); if (!response.ok) process.exit(1)"]
CMD ["bun", "run", "dist/index.js"]
