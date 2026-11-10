# Task: Fix EROFS Read-Only File System Error on Photo/Media Uploads

> **Status:** COMPLETED  
> **Goal:**
> 1. Eliminate the `EROFS: read-only file system, mkdir '/app/apps/web'` error when uploading psychologist photos or landing page media on VPS.
> 2. Implement centralized, robust media storage service (`media-storage.ts`) supporting `MEDIA_DIR` env, monorepo dev fallback, and directory initialization.
> 3. Provide native Bun static media file serving in API (`/media/*` and `/api/media/*`) for high-performance direct asset access.
> 4. Update Dockerfiles and `compose.production.yml` with a shared persistent volume (`attentive_media`) between `api` (read-write) and `web` (read-only), ensuring zero data loss and persistent assets across deploys.
> 5. Verify build, tests, and knowledge graph sync.

---

## Action Items
- [x] **1. Create Centralized Media Storage Service (`apps/api/src/services/media-storage.ts`)**:
  - Implement `saveMediaFile` and `getMediaStorageDir` with `MEDIA_DIR` env support and safe fallbacks.
  - Update `apps/api/src/config/env.ts` to include optional `MEDIA_DIR`.
- [x] **2. Refactor Upload Routes to Use Media Storage Service**:
  - Update `apps/api/src/routes/psychologists-cms.ts` to use `saveMediaFile`.
  - Update `apps/api/src/routes/landing-cms.ts` to use `saveMediaFile`.
- [x] **3. Serve Static Media from Elysia API (`apps/api/src/app.ts`)**:
  - Add `/media/*` and `/api/media/*` endpoints using native `Bun.file()` with directory traversal safeguards.
- [x] **4. Configure Docker & Compose Persistent Shared Media Volume**:
  - Update `apps/api/Dockerfile` with `uploads/media` directory, seed media copying, and `bun:bun` ownership.
  - Update `compose.production.yml` with `attentive_media` volume mounted to `api` (rw) and `web` (ro), and set `MEDIA_DIR`.
  - Update `apps/web/Caddyfile` with `/media/*` cache control headers.
- [x] **5. Verification, Tests & Knowledge Graph Sync**:
  - Run API & web tests (`bun test apps/api`, `bun run test --run` in web).
  - Run production build checks (`bun run build:api`, `bun run build:web`).
  - Update knowledge graph with `build_or_update_graph_tool`.
