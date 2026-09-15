# Active Task Checklist: Phase 1.16 — Navigation Redesign & Profile Hero Refinement

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.6 (Navigation Experience & Profile Action Streamlining)  
> **Active Focus:** Prune redundant WhatsApp button from psychologist profile hero, rename ambiguous "Support" navigation item to "Services / Layanan", redesign desktop & mobile header with premium clinical aesthetics and spring physics, verify all tests, and push atomic commits to master.

---

## Task Checklist
- [x] **Step 1: Prune WhatsApp Button in PsychologistProfileHero**:
  - Remove redundant `Ask about {{name}} on WhatsApp` button from `PsychologistProfileHero.tsx`.
  - Elevate `Plan a Consultation Session` (`openIntake`) as primary CTA with spring physics.
  - Retain `Kenali {{name}} Lebih Dekat ↓` (`#profile-story`) as secondary smooth-scroll anchor.
- [x] **Step 2: Update Profile Route Tests**:
  - Update `apps/web/tests/app-routes.test.tsx` to assert the dedicated booking link in `#profile-booking` (`/continue on whatsapp/i`).
  - Verify route test suite passes (`bun run --cwd apps/web test tests/app-routes.test.tsx`).
- [x] **Step 3: Rename Ambiguous "Support" Navigation Item**:
  - In `apps/web/src/i18n/locales/en.json`: Change `"homepage.nav.support"` from `"Support"` to `"Services"`.
  - In `apps/web/src/i18n/locales/id.json`: Change `"homepage.nav.support"` from `"Dukungan"` to `"Layanan"`.
- [x] **Step 4: Redesign Navigation Area (`SiteHeader.tsx`)**:
  - Modernize desktop nav items: clean typography (`text-sm font-medium`), subtle hover pill background.
  - Upgrade `LanguageToggle`: Replace boxy square button with sleek `EN / ID` segmented pill while maintaining exact `aria-label` for tests and accessibility.
  - Harmonize CTA hierarchy: Rounded-full gold button for consultation intake + refined ghost/outline pill for psychologist directory.
  - Polish mobile menu drawer: Clean structured layout, smooth spring animations, accessible Escape key handler.
- [x] **Step 5: Full Verification & Atomic Push**:
  - Run `apps/web` linter and full vitest suite (56 tests).
  - Run `./scripts/ci/verify-runtime-config.sh` and `./scripts/ci/verify.sh && bun run verify:shared-content`.
  - Commit atomic changes and push to `origin/master`.



