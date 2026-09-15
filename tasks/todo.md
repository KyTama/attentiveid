# Active Task Checklist: Phase 1.18 — Legibility & Typographic Substance Enhancement

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.8 (Typography & Reading Experience Optimization)  
> **Active Focus:** Solve thin/faint typography across the psychologist profile and the entire website by switching font-display to swap, increasing baseline body weight to 450 on Montserrat variable font, replacing washed-out opacity modifiers (text-secondary/70-85) with solid high-contrast text-secondary and font-[450], verifying all 56 tests, and pushing atomic commits.

---

## Task Checklist
- [x] **Step 1: Global Font Engine & Base Weight Upgrade**:
  - In `apps/web/src/index.css`: Update `@font-face` definitions to use `font-display: swap;`.
  - Set `font-weight: 450;` on `body` in `@layer base` to eliminate spindly glyph strokes on Montserrat variable font.
- [x] **Step 2: Psychologist Profile Story & Hero Typographic Enhancement**:
  - In `PsychologistProfileDetails.tsx`: Upgrade biography/letter paragraphs to `text-base sm:text-lg sm:leading-8 font-[450] text-secondary` with `max-w-prose` optimal measure.
  - In `PsychologistProfileHero.tsx`: Upgrade `shortBio` to `text-base sm:text-lg font-[450] text-secondary sm:leading-8` and sharpen trust badge contrast.
  - In `PsychologistProfileDetails.tsx`: Strengthen First Steps descriptions and booking reassurance text.
- [x] **Step 3: Site-wide Text Legibility & Contrast Audit**:
  - Eliminate washed-out `text-secondary/70` through `text-secondary/85` across landing components (`HomepageHero`, `SupportExplorer`, `FeaturedPsychologists`, `CareJourney`, `ClientStories`, `OurLocations`, `FrequentlyAskedQuestions`, `ClosingInvitation`, `ConsultationReassurance`).
  - Upgrade psychologist directory, card, reassurance, footer, and intake modal texts to `font-[450] text-secondary` with generous line-height for effortless reading.
- [x] **Step 4: Verification & Atomic Push**:
  - Run `apps/web` linter (0 errors) and full vitest suite (56 tests passed).
  - Run `./scripts/ci/verify-runtime-config.sh` and `./scripts/ci/verify.sh && DATABASE_ADMIN_URL=... bun run verify:shared-content` (all passed).
  - Make atomic git commits and push to `origin/master`.

---

## Review & Audit
- **Montserrat Variable Font Stem Density**:
  - Replaced `font-display: optional;` with `font-display: swap;` so glyphs do not silently drop back to razor-thin system fonts.
  - Baseline `body` weight elevated to `font-weight: 450`, giving body text substance without making it chunky like 500.
- **Reading Measure & Leading**:
  - Added `sm:leading-8` (32px line height) to biography paragraphs and section leads for optimal vertical rhythm.
- **Contrast Ratios**:
  - Switched body text from opacity-reduced navy (`text-secondary/70` = ~4.2:1 contrast) to full high-contrast dark navy (`text-secondary` = ~9.8:1 contrast), easily exceeding WCAG AAA standards on cream/off-white backgrounds.






