# Task: Dynamic Hero Carousel with Add/Remove Slides Support

> **Status:** COMPLETED  
> **Goal:** 
> 1. Extend shared schema (`HeroSectionSchema`) in `packages/shared/src/content.ts` with dynamic `slides: Type.Optional(Type.Array(LandingMediaSchema, { minItems: 1, maxItems: 10 }))`.
> 2. Update backend persistence (`content-transitions.ts` & `landing-content.repository.ts`) to store and hydrate dynamic hero slide media attachments (`role: 'hero_slide'`).
> 3. Overhaul Hero section editor in `LandingCmsPage.tsx` with dynamic slide management: add new slide, remove slide (enforcing min 1 slide constraint), upload per-slide photo, and live preview simulator.
> 4. Update `HomepageHero.tsx` to dynamically render whichever slides are configured in the CMS (1 slide = clean photo, multiple slides = full interactive carousel).
> 5. Verify all tests (`content.test.ts`, `landing-cms.test.ts`, `test:web`) and production build.

---

## Action Items
- [x] **1. Shared Content Schema Update**:
  - Add optional `slides: Type.Array(LandingMediaSchema, { minItems: 1, maxItems: 10 })` to `HeroSectionSchema`.
  - Update `packages/shared/src/content.ts` and verify with `packages/shared/src/content.test.ts`.
- [x] **2. Backend Storage & Hydration**:
  - In `landing-content.repository.ts`, pass `slides` in `mapLandingSectionMutation` and hydrate `slides` from `hero_slide` media attachments in `mapSectionRow`.
  - In `content-transitions.ts`, persist `hero_slide` attachments for each slide in `mapped.slides`.
- [x] **3. Dynamic Hero Carousel Editor in `LandingCmsPage.tsx`**:
  - Add `slides` to hero section state with minimum 1 slide constraint.
  - Implement "Tambah Foto Slide" and "Hapus Foto Slide" actions with validation.
  - Add upload dropzone and alt text inputs for each slide.
  - Wire live interactive preview to dynamically reflect the current slides array.
- [x] **4. Homepage Hero Dynamic Rendering in `HomepageHero.tsx`**:
  - Render `HeroCarousel` dynamically with all slides present in `managed?.section.slides` (fallback to `section.media` or default photo).
- [x] **5. Verification, Tests & Knowledge Graph Rebuild**:
  - Run `bun test` on shared & API packages.
  - Run `bun run test:web` and `bun run build:web`.
  - Rebuild knowledge graph with `build_or_update_graph_tool`.
