# Task: Fix Hero Highlight Card Slide 3 (`steps` CMS editor & custom visual rendering)

## Context & Investigation
- Synced non-PII tables and uploaded media from VPS `attentive_staging` (`postgres-shared`) to local DB (`attentiveid`) + seeded local superadmin accounts (`db:seed:users`).
- Inspected VPS DB (`landing_revisions` rev 41 published & rev 43 draft):
  - `hero-slide-3` (`layout: "big10"`) already had updated `tag`, `headline`, `description`, `primaryCta`, `secondaryCta`, and uploaded `media` (`media/landing/hero-slide-3-mwvmzpwx-a3e7a4.png`, 1448×1086).
  - `hero-slide-3.steps` remained stuck at Big 10 defaults (`Ikuti Tes Big 10`, `Dapatkan Tipe Attentive`, `Temui psikolog yang cocok`) because `LandingCmsPage.tsx` lacked form inputs and simulator preview for `steps`.
  - `HeroSlideVisual.tsx` (`layout === 'big10'`) ignored `slide.imageSrc` / custom `slide.media` and always rendered the hardcoded Big 10 collage.

## Action Items
- [x] **1. Expose `hasCustomMedia` and media dimensions in `hero-slides.ts`**: Update `ResolvedHeroSlide` and `resolveHeroSlides` so renderers know when a slide uses a custom CMS-uploaded image and preserve explicit `width`/`height` for zero CLS.
- [x] **2. Render custom uploaded visual for `big10` layout in `HeroSlideVisual.tsx`**: When `slide.layout === 'big10'` and `slide.hasCustomMedia` is true, display the uploaded `slide.imageSrc` cleanly with `object-contain` on matching warm cream backdrop (`#F6F0E6`) instead of the hardcoded Big 10 collage.
- [x] **3. Add bilingual `steps` editor & simulator preview in `LandingCmsPage.tsx`**: Support editing, adding (max 5), and removing `steps` (ID/EN) on Slide 3 (`big10` or any slide with `steps`), and render `steps`, `location`, and `note` in the CMS Live Simulator.
- [x] **4. Add regression tests & verify**: Add unit/component tests in `apps/web/tests/homepage.test.tsx` and `apps/web/tests/landing-cms.test.tsx`; run `bun run verify` and `./scripts/ci/verify-runtime-config.sh`.
- [ ] **5. Update knowledge graph, push branch, PR, review with another model, and merge to `master`**: Rebuild `code-review-graph`, log lesson in `tasks/lessons.md`, push `fix/hero-slide-3-steps-and-visual`, open PR to `master`, run independent review with another model via subagent, and merge.
