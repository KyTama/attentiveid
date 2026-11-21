# Versioned Media Uploads, JPEG Marker Parsing, and File Input Reset

## Symptoms
- Replacing a psychologist or landing photo succeeds the first time only when switching to a different image extension (e.g. `.webp` → `.jpg`); subsequent replacements to `.jpg` or back to `.webp` keep showing the old photo despite a success notification.
- Re-selecting the same local file path in CMS `<input type="file">` controls does not trigger `onChange`.
- Valid JPEGs containing `0xFF` padding bytes, standalone markers (`0xD0–0xD9`), or non-baseline `SOF` markers fail server-side dimension extraction with HTTP `400`.
- Shared links to `/psychologists/:slug` fall back to the generic Attentive OG logo instead of the practitioner's directory photo.

## Root Cause
1. Upload handlers wrote to deterministic `${safeSlug}.${ext}` paths while `apps/web/Caddyfile` serves `/media/*` with `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`, causing browsers to serve stale cached bytes whenever a replacement reused the same URL.
2. Dashboard `<input type="file">` elements did not reset `e.target.value = ''` after reading `e.target.files?.[0]`.
3. `extractImageDimensions` broke on JPEG `0xFF` padding and standalone markers without payload length.
4. `/api/content/share-html` queried only `share_previews` without consulting `psychologistsRepository.getBySlug`.

## Rule
1. **Versioned upload filenames**: Always generate unique filenames via `buildVersionedMediaFilename(slug, ext)` (`apps/api/src/services/media-storage.ts`) so every upload gets a fresh, cache-safe URL and preserves historical revision immutability.
2. **Reset file inputs**: Clear `e.target.value = ''` immediately after reading `e.target.files?.[0]` in every file input `onChange` handler.
3. **Complete JPEG marker scanning**: Skip `0xFF` fill bytes and standalone markers (`0x00`, `0x01`, `0xD0–0xD9`) before reading 2-byte segment lengths, and support all JPEG SOF markers with bounds checks.
4. **Directory-backed profile share images**: Resolve `/psychologists/:slug` (and `/psychologist/:slug`) thumbnails in `/api/content/share-html` from `psychologistsRepository.getBySlug`.
