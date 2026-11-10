# Containerized Media Uploads in Hardened Read-Only Filesystems

## Symptoms
- When submitting photos or files in a deployed Docker container, backend throws:
  `EROFS: read-only file system, mkdir '/app/apps/web'` or similar unhandled 500 error.
- Uploads appear to work locally on dev machines (where the filesystem is read-write and the monorepo structure exists), but immediately crash when deployed to production.

## Root Cause
- Hardened production containers (e.g. `read_only: true`, `cap_drop: ALL`, non-root user `bun`) enforce a Linux read-only mount namespace on the container root filesystem.
- Relative paths attempting to write into sibling project folders (like `../web/public/media`) fail because:
  1. The sibling folder does not exist inside the isolated backend container image.
  2. Creating missing directories on the root filesystem `/app` is rejected by the Linux kernel with `EROFS`.
  3. Ephemeral container filesystems cannot be read by separate frontend reverse proxy containers (e.g. Caddy).

## Rule
1. **Configurable Storage Path**: Always resolve upload paths using an environment variable (`MEDIA_DIR`), falling back to local monorepo web directories only in local development.
2. **Shared Named Volumes**: Mount a shared named volume (`attentive_media`) between the API container (`rw`) and the web/proxy container (`ro`).
3. **Pre-populate Seed Assets**: Pre-seed default static media during Docker build so new named volumes initialize with baseline assets.
4. **Resilient Fallback**: Catch `EROFS` errors and redirect writes to `/tmp/uploads` so the HTTP pipeline never crashes.
