# Lowercase Static Media Paths and DB Seed References

**Symptoms:**
- Static image requests (e.g. `/media/psychologists/syazka.webp`) return 404 or trigger Caddy SPA fallback serving `index.html` (text/html) instead of an image binary, causing broken image icons on Linux containers (staging/prod).
- Images load locally on macOS (APFS case-insensitive) but fail on Linux (ext4 case-sensitive).

**Root Cause:**
- Database seeds reference lowercase slugs (`media/psychologists/syazka.webp`), while public assets are placed under a different directory or with capitalized filenames (`images/psychologists/Syazka.webp`).

**Rule:**
- Static assets in `apps/web/public/` must match exact database seed reference paths and case-sensitive filenames (`public/media/psychologists/<lowercase-slug>.webp`).
- Always verify static asset existence via unit tests (`shared-content-psychologist-adapter.test.ts`).
