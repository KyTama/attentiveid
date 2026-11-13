# Task: Editable/Hideable/Deletable Featured Campaigns, Assessment Removal & VPS DB Sync

> **Status:** COMPLETED
> **Goal:** Make Featured Campaigns & Portals editable, adjustable, hideable, and deletable; remove `assessment.attentiveid.com` links from the landing page; sync local Postgres & repo seed data with live VPS DB (`attentive_staging`) before committing and pushing.

---

## Action Items
- [x] **1. Extend shared schema & hero persistence (`packages/shared`, `apps/api`)**:
  - Extended `HeroCampaignItemSchema` (`visible`, `theme`, `icon`), `HeroCampaignsSchema` (`visible`, `showFloatingDock`, `minItems: 0`, `maxItems: 6`), and `HeroSlideItemSchema` (`location`).
  - Exported and wired `encodeHeroExtraPayload` / `decodeHeroExtraPayload` in `apps/api/src/repositories/landing-content.repository.ts`.
- [x] **2. Update landing UI & remove `assessment.attentiveid.com` portals (`apps/web`)**:
  - Updated `HomepageHero.tsx`, `CampaignFloatingDock.tsx`, `CampaignSection.tsx`, and `en.json` / `id.json` so portals are dynamic, toggleable/hideable/deletable, and exclude `assessment.attentiveid.com`.
- [x] **3. Add full CMS portal controls (`apps/web/src/pages/dashboard/LandingCmsPage.tsx`)**:
  - Added section/dock toggles, `+ Tambah Kartu`, `Reset Default`, Move Up/Down, Theme & Icon pickers, Hide/Show card, Delete card, and live Hero Simulator preview.
- [x] **4. Sync local Postgres DB & repo seed with VPS `attentive_staging` (non-PII only)**:
  - Restored 17 public content/media tables from `attentive_staging` into local `attentiveid` DB, re-seeded local dev users (`db:seed:users`), and aligned `apps/api/src/db/seed-landing.ts` + `seed-landing.test.ts` + `shared-content.integration.test.ts` with published Revision 2.
- [x] **5. Harvest lesson learned & verify tests/build/graph**:
  - Added `.docs/common-issues/hero-campaigns-envelope-persistence-and-vps-seed-sync.md` + updated `.docs/common-issues/README.md`.
  - Run `apps/api` tests, `apps/web` Vitest + TypeScript/Vite build, and sync `code-review-graph`.
- [x] **6. Commit & push clean changes to `origin/master`**.
