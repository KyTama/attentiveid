# Active Task Checklist: Phase 1.10.1 — Footer Refinement & Visual Slim-Down

> **Status:** IN PROGRESS  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** Refactor `SiteFooter.tsx` to remove heavy boxed cards and bloated containers. Streamline into a sleek, minimal, and elegant 3-column layout where TBI (Jakarta), BSD, and Malang (Opening Soon) are presented as clean typography links.

---

## Task Checklist
- [x] **Step 1: Simplify `SiteFooter.tsx` Structure**:
  - Remove bulky `bg-white/60` nested cards and thick borders
  - Integrate TBI (Jakarta), BSD, and Malang (Opening Soon) as clean, compact list items with Google Maps links
  - Place WhatsApp hotline and Instagram as clean inline contact links
- [x] **Step 2: Verification & Automated Tests**:
  - Run web test suite (`bun --cwd apps/web test`)
  - Run monorepo build (`bun run build`)
- [x] **Step 3: Atomic Git Commit & Weekly Reporting**:
  - Commit changes atomically (`refactor(web): slim down footer to minimal typography layout without bulky cards`)
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
