# Task: Hero Carousel v3 (5-Slide Editorial Architecture) — Local First

> **Status:** DONE (LOCAL ONLY — READY FOR PREVIEW)
> **Rule:** STRICTLY LOCAL ONLY. DO NOT PUSH TO GITHUB OR DEPLOY.
> **Reference:** `/Users/kytama/Projects/Neo-Attentive/attentiveid-updates/Mid Nov 2026/attentive_hero_v3`

---

## Action Items
- [x] **1. Extract static hero-v3 media assets & update shared `HeroSlideItemSchema` (`packages/shared/src/content.ts`)**:
  - Store all 15 optimized media images under `apps/web/public/images/hero-v3/`.
  - Extend `HeroSlideItemSchema` to support `visible`, `layout` (`practice` | `pet-garden` | `big10` | `scientific-brief` | `wisdom-ella`), `tabLabel`, `note`, `steps`, `chips`, and empty URLs (`maxLength: 2048` without `minLength: 1`) so Slide 03 `"Take the Big 10"` can start unlinked and be filled in CMS later.
- [x] **2. Extract & share canonical 5-slide default configuration + bilingual copy (`apps/web/src/features/content/hero-slides.ts`, `en.json`, `id.json`)**:
  - Define the 5 bilingual (`en` & `id`) slides matching `attentive_hero_v3`:
    - Slide 01: `Our practice` — Clinical Psychology Bureau & Professional Counseling (`https://booking.attentiveid.com/`, `/psychologists`).
    - Slide 02: `Pet garden` — Home · Pet garden (`#locations`, `https://booking.attentiveid.com/`).
    - Slide 03: `Free Big 10 + session` — Big 10 + First Session (Primary URL `""` unlinked for now, Secondary URL `https://free-session.attentiveid.com`).
    - Slide 04: `Scientific brief` — Monthly Scientific Brief (`/articles`, `/articles`).
    - Slide 05: `Meet Ella` — Wisdom · Principal Psychologist (`/psychologists/gisella`, `https://booking.attentiveid.com/`).
- [x] **3. Redesign `HomepageHero.tsx` to match `attentive_hero_v3`**:
  - Warm `#F5EFE5` editorial stage (`role="region" aria-roledescription="carousel"`), top eyebar (`THE LATEST AT ATTENTIVE`), 45%/55% desktop split layout with arched right visual column, mobile visual-first stack.
  - Render custom visual showcase compositions per slide layout (`practice` arch photo + `SIP RESMI` sticker + `COME AS YOU ARE` card; `pet-garden` 3-photo cat collage + round cat overlay + `MEET THE RESIDENTS`; `big10` gradient showcase + norm & 4-letter type excerpts + matched psychologist avatar card; `scientific-brief` 3 brief sheets + dark `1 in 5` stat card + `New every month` pill; `wisdom-ella` portrait + quote card + `SHE OFTEN WORKS WITH` card + `Practicing since 2010` pill).
  - Autoplay 7s progress bar tabs (`01 Our practice` .. `05 Meet Ella`) with pause on hover/focus/reduced-motion, previous/next circular controls, keyboard ArrowLeft/Right, pointer swipe, and polite screen-reader announcement.
  - Graceful CTA rendering when URL is empty (`""`): muted non-navigating pill ("Soon" / "Segera") with zero links to `assessment.attentiveid.com`.
- [x] **4. Upgrade `LandingCmsPage.tsx` Highlight Card Editor & Live Simulator**:
  - Expand `getHeroSlideItem` / `handleSlidePhotoUpload` / `handleResetSlidePhoto` / Hero Simulator & Form to support all 5 slides dynamically (per-slide hide/show toggle, tab label, tag, headline with `**gold**`, body, note/meta, CTA labels + destination URLs including blank URL support, and photo upload/reset).
- [x] **5. Verify locally & sync knowledge graph (no git push!)**:
  - Updated tests in `apps/web/tests/homepage.test.tsx` and `apps/api/src/repositories/repositories.test.ts`.
  - Verified shared tests (30 pass), API tests (126 pass, 5 live-PG skipped), web tests (75 pass), web production build (`tsc -b && vite build`), lint (`0 errors`), and `build_or_update_graph_tool`.
