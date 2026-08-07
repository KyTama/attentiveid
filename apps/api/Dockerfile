FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
RUN bun install
COPY apps/api/ apps/api/
EXPOSE 3000
CMD ["bun", "run", "start"]
