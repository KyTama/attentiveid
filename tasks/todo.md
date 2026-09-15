# Active Task Checklist: Phase 1.15 — Carousel Evolution, Typographic Harmonization & Profile Polish

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.5 (Content Refinement & Psychologist Presentation)  
> **Active Focus:** Transform homepage highlight into a direct swipeable carousel, harmonize typography & section spacing across homepage and profile, correct Nichi's name to Dwi Ningsih, remove redundant profile metadata section, and push atomic commits.

---

## Task Checklist
- [x] **Step 1: Nichi Name Correction**:
  - Replace all occurrences of "Dwi Nichita" with "Dwi Ningsih (Nichi)" across `apps/api/src/db/seed-psychologists.ts`, `apps/web/src/data/psychologists.ts`, and translation files.
  - Re-run local DB seed so postgres fixture is accurate.
- [x] **Step 2: Remove Redundant Profile Metadata Section**:
  - Inspect `PsychologistProfileDetails.tsx` and remove the redundant Experience/Credential/License block under "A clear, human first step".
- [x] **Step 3: Homepage Psychologist Highlight Carousel Transformation**:
  - Inspect `FeaturedPsychologists.tsx`.
  - Transform highlight section into a direct swipeable carousel (touch/drag gestures + navigation arrows/dots) so users can swipe psychologist cards directly without relying on bottom thumbnail row.
- [x] **Step 4: Typographic & Spacing Harmonization**:
  - Audit font weights, letter spacing (`tracking`), line-heights, and vertical padding (`py-20 lg:py-28`, container widths) across sections.
  - Fix inconsistencies where fonts feel either too tight/heavy or sparse/thin to create unified editorial rhythm.
- [x] **Step 5: Verification & Atomic Push**:
  - Run `bun run test:web`, `./scripts/ci/verify-runtime-config.sh`, and `./scripts/ci/verify.sh`.
  - Make atomic git commits and push to `origin/master`.

