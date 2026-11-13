# CMS Publish Validation, PostgreSQL Timestamp Verification & StrictMode Preview

## Symptoms
1. **Silent stale publish (`POST /api/admin/landing/publish`)**: Sending an invalid or wrapped payload (e.g. `TestimonialsCmsPage` sending `{ content: { sections: ... } }` or clearing an optional field) silently fell through to `publishLandingDraft(adminCap)` and returned `200 { status: 'success' }`, publishing old draft revisions without saving the editor's changes.
2. **Broken draft preview (`Preview Draft ↗`)**:
   - `LandingCmsPage` linked directly to `/preview/landing` without obtaining a signed capability token (`POST /api/admin/landing/preview`).
   - `preview-capability.ts` compared Postgres `timestamptz` strings (`"2026-11-13 19:27:20+07"`) via strict string inequality (`!==`) against `.toISOString()` (`"2026-11-13T12:27:20.000Z"`), causing 100% failure against real PostgreSQL even though in-memory unit tests passed.
   - React `<StrictMode>` double-invoked `loadPreviewLandingContent()`, so the first mount consumed the one-shot `#capability=...` while the second mount skipped session exchange and raced `GET /api/preview/landing` into `403 Invalid preview session`.
   - `Set-Cookie: ...; Secure` prevented local `http://` dev preview session cookies in strict browsers.

## Root Fixes
- **Reject invalid non-empty publish payloads explicitly**: Added `getLandingContentMutationErrors` in `@attentiveid/shared` and fail with HTTP `400` (`errors: string[]`) when a non-empty payload fails validation instead of falling back to an old draft.
- **Unwrap Testimonials CMS payload**: `TestimonialsCmsPage.tsx` now sends `LandingContentMutation` directly (`{ sections, ... }`) rather than `{ content: ... }`, and adds explicit `Simpan Draft`.
- **End-to-end preview flow**: Added `POST /api/admin/landing/preview` returning signed capability tokens, compared PostgreSQL timestamps numerically via `Date.parse`, set `Secure` conditionally on HTTPS, coalesced concurrent `loadPreviewLandingContent()` in-flight promises in `apps/web/src/features/content/service.ts` for `<StrictMode>`, and normalized empty optional slide localized fields before saving.
- **Prevent `duplicate key` & schema `id`/`key` publish errors**: Lock `landing_aggregates` with `.for('update')` inside `createDrizzleContentTransitionDatabase`, publish via atomic single-transaction `saveAndPublishLandingContent` in `content-transitions.ts` (mapping Postgres `23505` to HTTP `409`), lock all Landing CMS action buttons via unified `isMutating`, and run shared `normalizeLandingContentMutation` + `getLandingContentMutationErrors` pre-flight checks in both `LandingCmsPage` and `TestimonialsCmsPage` (repairing duplicate/invalid IDs, re-indexing `position`, filling 1-sided localized fallbacks, and stripping extra properties).
