# Active Task Checklist: Phase 1.9.9 — Infinite Loop Carousel on Highlight Section

> **Status:** COMPLETED  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** Enabled seamless infinite loop cycling on `FeaturedPsychologists` carousel (`opts={{ align: 'start', loop: true }}`), eliminated left/right boundaries ("biar gk mentok kiri atau kanan"), connected `setApi` with smooth scrollTo navigation on card selection, and verified monorepo builds and test suites.

---

## Task Checklist
- [x] **Step 1: Configure Infinite Loop in Carousel Options**:
  - Update `FeaturedPsychologists.tsx` to set `opts={{ align: 'start', loop: true }}`
  - Remove `containScroll: 'trimSnaps'` to allow unobstructed boundary-free cycling in both directions
- [x] **Step 2: Connect Carousel API & Interaction Polish**:
  - Connect `setApi` to carousel instance for active index tracking and smooth scrolling on card selection
  - Ensure previous/next buttons remain interactive and boundary-free across all viewport widths
- [x] **Step 3: Verification & Automated Tests**:
  - Verify web test suite (`bun --cwd apps/web test`)
  - Verify monorepo build (`bun run build`)
- [x] **Step 4: Atomic Git Commit & Weekly Reporting**:
  - Commit changes atomically (`feat(web): enable infinite loop cycling on psychologist highlight carousel`)
  - Update weekly activities in `.docs/recent-updates/weekly-activities-2026-w37.md`

---

## Previous Milestones
- [x] Phase 1.9.8: Prioritize Dr. Haykal & Seed Order Idempotency
- [x] Phase 1.9.7: Psychologist Portrait Orientation, Uniform Sizing & Brand Placeholder
- [x] Phase 1.9.6: Psychologist Schema Evolution & Data Center Alignment
- [x] Phase 1.9.5: Central Psychologist Data Center & Raw Asset Ingestion
- [x] Phase 1.9: Dynamic Intake Survey & Screening UI/API
- [x] Phase 1.8: Bilingual Articles System & CMS Editorial Review
- [ ] Phase 1.10: Deployment Hardening & Tencent VPS Go-Live
