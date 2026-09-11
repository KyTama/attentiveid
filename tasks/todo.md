# Active Task Checklist: Phase 1.9.7 — Psychologist Portrait Orientation, Uniform Sizing & Brand Placeholder

> **Status:** COMPLETED  
> **Milestone:** Milestone 1 (Web & Domain Go-Live)  
> **Active Focus:** All reported visual bugs resolved: rotated sideways portraits 90° CCW, standardized all practitioner photos to exact 600x750 (4:5) without distortion, unified carousel thumbnails to aspect-[4/5], replaced Nuzul's screenshot and fallbacks with custom brand illustration profpic.

---

## Task Checklist
- [x] **Step 1: Inspect & Fix Photo Orientations (90° CCW)**:
  - Rotate sideways portraits (Andri, Jessica, Valencia) 90° CCW
  - Re-crop to true 4:5 ratio without stretching or distortion
  - Standardize all 24 psychologist images in `apps/web/public/media/psychologists/` to 600x750 WebP
- [x] **Step 2: Brand-Aligned Avatar Placeholder Illustration**:
  - Generate serene, minimalist editorial vector profpic matching Attentive colorway (sage green, warm cream, soft terracotta)
  - Replace `default.webp`, Nuzul's screenshot (`nuzul.webp`), and all pending studio photos with this custom placeholder
- [x] **Step 3: Standardize Photo Dimensions in Highlight Section**:
  - Refine `FeaturedPsychologists.tsx` carousel thumbnails from landscape `aspect-[4/3]` to uniform portrait `aspect-[4/5]`
  - Lock container dimensions so all cards and images have consistent height and visual weight
- [x] **Step 4: Update Seeds & Master Data Center**:
  - Update `scripts/build_psychologists_data_center.py` and `apps/api/src/db/seed-psychologists.ts` to reflect Nuzul's `NEED_PHOTO` status
  - Re-run database seed and verify persistence
- [x] **Step 5: Verification & Delivery**:
  - Verify build (`bun run build`) and test suites (`bun test`)
  - Harvest lessons to `tasks/lessons.md` and present results to user

---

## Previous Milestones
- [x] Phase 1.9.6: Psychologist Schema Evolution & Data Center Alignment
- [x] Phase 1.9.5: Central Psychologist Data Center & Raw Asset Ingestion
- [x] Phase 1.9: Dynamic Intake Survey & Screening UI/API
- [ ] Phase 1.10: Deployment Hardening & Tencent VPS Go-Live
