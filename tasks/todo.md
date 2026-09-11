# Active Task Checklist: Phase 1.10.0 — Clinic Locations Section & Footer Architecture

> **Status:** COMPLETED  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** Created high-polish `OurLocations` landing page section (`#locations`) with 3 branches (Jakarta TBI, BSD, Malang Opening Soon), updated contact data structures, enhanced `SiteFooter` with 3-branch addresses and maps links, added bilingual i18n keys, and verified monorepo test suites.

---

## Task Checklist
- [x] **Step 1: Contact Data Architecture & Bilingual Translations**:
  - Update `apps/web/src/data/contact.ts` with structured `locations` (TBI Jakarta, BSD, Malang Opening Soon)
  - Add bilingual i18n keys to `apps/web/src/i18n/locales/id.json` and `en.json`
- [x] **Step 2: Build `OurLocations.tsx` Landing Section**:
  - Design premium 3-card location grid matching 2025 Impeccable & Emil Kowalski standards
  - Include verified Google Maps links, branch badges, amenities, and Opening Soon badge for Malang
  - Integrate into `Homepage.tsx` and add `#locations` anchor
- [x] **Step 3: Update `SiteFooter.tsx` & Navigation**:
  - Redesign footer location block to present all 3 branches clearly with maps links
  - Add "Lokasi" navigation link in `SiteHeader.tsx`
- [x] **Step 4: Verification & Automated Tests**:
  - Run web test suite (`bun --cwd apps/web test`)
  - Run monorepo build (`bun run build`)
- [x] **Step 5: Atomic Git Commit & Weekly Reporting**:
  - Atomically commit changes (`feat(web): add clinic locations section and update footer for TBI, BSD, and Malang`)
  - Update weekly activity logs in `.docs/recent-updates/weekly-activities-2026-w37.md`

---

## Previous Milestones
- [x] Phase 1.9.9: Infinite Loop Carousel on Highlight Section
- [x] Phase 1.9.8: Prioritize Dr. Haykal & Seed Order Idempotency
- [x] Phase 1.9.7: Psychologist Portrait Orientation, Uniform Sizing & Brand Placeholder
- [x] Phase 1.9.6: Psychologist Schema Evolution & Data Center Alignment
- [x] Phase 1.9.5: Central Psychologist Data Center & Raw Asset Ingestion
- [x] Phase 1.9: Dynamic Intake Survey & Screening UI/API
- [x] Phase 1.8: Bilingual Articles System & CMS Editorial Review
- [ ] Phase 1.10: Deployment Hardening & Tencent VPS Go-Live
