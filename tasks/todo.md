# Task: Fix Landing CMS Publish Error (`publishLandingRevision is not a function`)

> **Status:** COMPLETED  
> **Goal:**
> 1. Fix runtime TypeError: `dependencies.contentTransitions.publishLandingRevision is not a function` in `apps/api/src/routes/landing-cms.ts`.
> 2. Align method signatures in `createContentTransitions` (`content-transitions.ts`) to support `publishLandingDraft(capability, revisionId?)` and alias `publishLandingRevision`.
> 3. Allow `POST /api/admin/landing/publish` to publish active draft or accept current content mutation payload to save & publish atomically.
> 4. Ensure `handlePublish` in `LandingCmsPage.tsx` sends current content so live edits are seamlessly published.
> 5. Verify all tests (`bun test apps/api`, `bun run test --run` in web), build, deploy to VPS, and verify live on staging.

---

## Action Items
- [x] **1. Align Content Transitions Service (`apps/api/src/services/content-transitions.ts`)**:
  - Update `publishLandingDraft` to resolve active draft from aggregate if `revisionId` is omitted.
  - Expose `publishLandingRevision` alias supporting both `(capability)` and `(capability, revisionId)`.
  - Allow saving a draft when an active draft already exists by updating or superseding the active draft instead of throwing.
- [x] **2. Fix Route Handler in `apps/api/src/routes/landing-cms.ts`**:
  - Update `POST /api/admin/landing/publish` to call `publishLandingDraft(adminCap)`.
  - Accept optional `body: t.Optional(LandingContentMutationSchema)` to save & publish in one step if content is provided.
- [x] **3. Update Frontend `LandingCmsPage.tsx`**:
  - Pass current `content` state to `POST /api/admin/landing/publish` so clicking "Terbitkan Live" publishes latest edits.
- [x] **4. Test & Verification**:
  - Run API unit tests (`landing-cms.test.ts`, `content-transitions.test.ts`).
  - Run web Vitest tests.
  - Verify build (`bun run build:api`, `bun run build:web`).
- [x] **5. Deploy to VPS & Live Verification**:
  - Commit, push to `master`, monitor CI/CD deployment to VPS.
  - Verify container status, test publish endpoint live on VPS.
