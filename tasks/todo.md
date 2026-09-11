# Active Task Checklist: Phase 1.10.2 — Footer Linked Titles & Ultra-Slim Footprint

> **Status:** IN PROGRESS  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** Streamline `SiteFooter.tsx` locations into lightweight "Linked Titles" only (no multi-line addresses), reducing vertical footprint to an ultra-clean, modern 4-column balanced layout.

---

## Task Checklist
- [x] **Step 1: Refactor `SiteFooter.tsx` to Linked Titles Only**:
  - Convert locations to compact clickable titles (linking to Google Maps or `/#locations`) without raw street address paragraphs
  - Balance the footer into a clean, compact 4-column grid (Brand, Jelajahi, Lokasi Praktik, Kontak)
  - Tighten vertical spacing (`py-8 lg:py-10`, `mt-8` for copyright)
- [x] **Step 2: Verification & Automated Tests**:
  - Run web test suite (`bun --cwd apps/web test`)
  - Run monorepo build (`bun run build`)
- [x] **Step 3: Atomic Git Commit & Weekly Reporting**:
  - Commit changes atomically (`refactor(web): reduce footer height with linked title locations and balanced 4-column layout`)
  - Update weekly activities in `.docs/recent-updates/weekly-activities-2026-w37.md`

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
