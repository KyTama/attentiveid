# Active Task Checklist: Stakeholder Feedback Execution (Hero, Locations, Services, Footer)

> **Status:** COMPLETED (Committed locally, NOT pushed)  
> **Milestone:** Milestone 1.9 (Stakeholder Review & Brand Architecture Convergence)  
> **Active Focus:** Implemented Hero CTA reorder, animated tabular numbers, Location cards with dual buttons (Maps + Plan Offline Session), complete social links in Footer including LinkedIn, and created `/services` content guidance document. (Commit locally, DO NOT PUSH per user request).

---

## Task Checklist
- [x] **Step 1: Hero Section (Buttons & Animated Numbers)**:
  - Reordered Hero CTA: Left primary "Plan your session" (`openIntake()`) + Right secondary "Find your Psychologist" (`/psychologists`).
  - Added smooth in-view animated counter for trust metrics with `framer-motion` (`useInView`), `tabular-nums`, and zero CLS.
  - Updated locales (`id.json` & `en.json`) with "Plan your session" translations and updated count to 23 psikolog.
- [x] **Step 2: Location Section Dual Buttons**:
  - In `OurLocations.tsx`: Provided 2 distinct buttons on active cards:
    - Button 1: "Plan Offline Session" (opens intake modal prefilled with offline format & location).
    - Button 2: "Buka di Google Maps" (external link to Google Maps).
  - Replaced `<Sparkles>` with clean semantic icon (`CalendarClock`).
- [x] **Step 3: Footer Social Links Expansion**:
  - Added LinkedIn, Instagram, WhatsApp, and email in `SiteFooter.tsx` with accessible touch targets and proper aria-labels.
  - Updated `contact.social` in `apps/web/src/data/contact.ts`.
- [x] **Step 4: Services Section Guidance Document**:
  - Created `.docs/specifications/services-page-guidance.md` for Tama & Ditto outlining architecture, clinical categories, what to expect, and CTA evolution.
  - In `SupportExplorer.tsx` / locales: Updated secondary action copy from "Explore psychologists" to "Learn more" / "Pelajari Layanan".
- [x] **Step 5: Verification, Local Commit (No Push) & Graph Sync**:
  - Ran `bun run test:web` (56/56 tests passing).
  - Ran `./scripts/ci/verify.sh` (build + linter + contract tests clean).
  - Committed locally with descriptive message (NOT pushed).
  - Updated knowledge graph index.
