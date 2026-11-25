# Hero Slide 3 Steps Editor Parity & Custom Visual Rendering

- **Symptom:** Editing Hero Highlight Card #3 (`layout: "big10"`) in `LandingCmsPage` updates `tag`, `headline`, `description`, CTAs, and uploads a replacement image (`slide.media`), yet:
  1. The 3 numbered step cards (`01 Take the Big 10`, `02 Get your Attentive Type`, `03 Meet your matched psychologist`) stay frozen on the Big 10 defaults on the live homepage.
  2. The right-side visual continues rendering the hardcoded Big 10 report/avatar collage instead of the newly uploaded custom image.
- **Root Causes:**
  1. `HeroSlideItemSchema` (`packages/shared/src/content.ts`) and `HomepageHero.tsx` (`SlideMiddleDetails`) already support dynamic `steps` (`minItems: 0, maxItems: 5`), and `landing-content.repository.ts` already persists `slideItems[].steps` inside `landing_section_translations.contact`, **but `LandingCmsPage.tsx` had no editor inputs or live simulator preview for `steps`**.
  2. `HeroSlideVisual.tsx` (`slide.layout === 'big10'`) ignored `slide.imageSrc` / custom `slide.media` and unconditionally rendered the hardcoded Big 10 collage.
- **Rules:**
  1. Keep CMS editor fields and Live Simulator preview in parity with every CMS-persisted `HeroSlideItem` field (`steps`, `location`, `note`, `media`, CTAs).
  2. Expose `hasCustomMedia` (plus `imageWidth`/`imageHeight`) on `ResolvedHeroSlide` in `hero-slides.ts`, and when `slide.layout === 'big10'` has `hasCustomMedia === true`, render the custom uploaded `slide.imageSrc` cleanly (`object-contain` on matching warm cream backdrop `#F6F0E6` with explicit `width`/`height` for zero CLS) instead of the hardcoded collage.
