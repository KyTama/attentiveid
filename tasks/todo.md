# Active Task Checklist: Phase 1.9.8 — Prioritize Dr. Haykal & Seed Order Idempotency

> **Status:** COMPLETED  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** Dr. Haykal Hafizul Arifin promoted to primary featured order (`featuredOrder: 0`, position #1 across master data registry, spreadsheets, homepage showcase, and database fixtures). Implemented `resetFeaturedOrders()` transaction step to prevent unique constraint collisions during sequence re-ordering in PostgreSQL.

---

## Task Checklist
- [x] **Step 1: Reorder Dr. Haykal in Registry & Master Data Center**:
  - Update `scripts/build_psychologists_data_center.py` to position Dr. Haykal as item #1 (`no: 1`)
  - Regenerate `.docs/domain/psychologists-registry.json`, `psychologists-data-center.md`, `Attentive_Psychologist_Master_Database_Audit_2026.xlsx`, and `Attentive_Psychologist_Master_Database_Audit_2026.csv`
- [x] **Step 2: Reorder Database Fixtures & Handle Unique Constraint**:
  - Position Dr. Haykal at index 0 with `featuredOrder: 0` in `apps/api/src/db/seed-psychologists.ts`
  - Implement `resetFeaturedOrders()` inside Drizzle seed transaction to avoid PostgreSQL unique index collision on `featured_order`
  - Update unit test assertions in `apps/api/src/db/seed-psychologists.test.ts`
- [x] **Step 3: Verification & Database Re-seed**:
  - Run database re-seed against PostgreSQL (`seeded 24 psychologist records`)
  - Run full monorepo test suite (shared: 17 pass, API: 93 pass, Web: 56 pass)
  - Run monorepo build (`bun run build` successful)
- [x] **Step 4: Atomic Git Commit & Weekly Reporting**:
  - Atomically commit code and test changes
  - Update weekly activity logs in `.docs/recent-updates/weekly-activities-2026-w37.md`

---

## Previous Milestones
- [x] Phase 1.9.7: Psychologist Portrait Orientation, Uniform Sizing & Brand Placeholder
- [x] Phase 1.9.6: Psychologist Schema Evolution & Data Center Alignment
- [x] Phase 1.9.5: Central Psychologist Data Center & Raw Asset Ingestion
- [x] Phase 1.9: Dynamic Intake Survey & Screening UI/API
- [x] Phase 1.8: Bilingual Articles System & CMS Editorial Review
- [ ] Phase 1.10: Deployment Hardening & Tencent VPS Go-Live
