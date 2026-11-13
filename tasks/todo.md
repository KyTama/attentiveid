# Task: Fix & End-to-End Test CMS Update Dashboard (Local Commit Only)

> **Status:** DONE (LOCAL COMMIT ONLY — NOT PUSHED)
> **Rule:** DO NOT PUSH THIS FIX TO GITHUB. Local commit only (`git commit` without `git push`).

---

## Action Items
- [x] **1. Reproduce & audit real CMS failure modes against live local Postgres + `createApp`**:
  - Audited `landing-cms.ts`, `public-content.ts`, `preview-capability.ts`, `LandingCmsPage.tsx`, `TestimonialsCmsPage.tsx`, `content.ts`, `service.ts` against real Postgres and headless Chrome.
- [x] **2. Fix uncovered CMS backend (`landing-cms.ts` / `public-content.ts` / `preview-capability.ts` / `app.ts` / `shared`) and frontend (`LandingCmsPage.tsx` / `TestimonialsCmsPage.tsx` / `service.ts`) bugs**:
  - Eliminated silent fallback on invalid `POST /api/admin/landing/publish` payloads (`400` + `getLandingContentMutationErrors` field diagnostics).
  - Unwrapped `TestimonialsCmsPage.tsx` `{ content: ... }` publish bug + added `Simpan Draft` + max-8 bound enforcement.
  - Added `POST /api/admin/landing/preview`, fixed `Date.parse` Postgres timestamp comparison in `preview-capability.ts`, conditional `Secure` cookie for local HTTP vs HTTPS, and React `<StrictMode>` in-flight promise coalescing in `loadPreviewLandingContent()`.
  - Normalized empty optional slide localized fields & fixed Slide 1 photo reset in `LandingCmsPage.tsx`.
- [x] **3. Run real end-to-end CMS update & publish verification against live local API + Web dev servers**:
  - Verified live HTTP roundtrips + real headless Chromium CDP flow (`LandingCmsPage` Save Draft -> `Preview Draft ↗` rendering draft live -> `TestimonialsCmsPage` Save Draft & Publish -> homepage live update) + restored clean pre-test Postgres revisions.
- [x] **4. Add automated API & Web regression tests for the real failure modes**:
  - Added tests in `apps/api/src/routes/landing-cms.test.ts`, `apps/api/src/security/preview-capability.test.ts`, `apps/web/tests/landing-cms.test.tsx`, `apps/web/tests/shared-content-preview.test.tsx`.
- [x] **5. Full verification (`bun test`, `build:web`, `lint`), knowledge graph sync, harvest `.docs/` lesson, and local-only `git commit` (NO `git push`)**.
