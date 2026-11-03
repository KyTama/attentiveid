# Task: Add New Psychologist Diptya Ratri P. (Ratri)

> **Status:** COMPLETED  
> **Goal:** Crop and deploy calibrated portrait asset for Diptya Ratri P., M.Psi., Psikolog (600x750 WebP) and integrate into database seed fixtures and web catalog per clinical governance.

---

## Action Items
- [x] **1. Crop & Deploy Ratri Portrait Asset**:
  - Calibrate facial midline ($x=1889$) and 4:5 bust crop from `docs/Ratri/DR5.jpeg` per `dual-aspect-portrait-framing.md`.
  - Output optimized 600x750 WebP to `apps/web/public/media/psychologists/ratri.webp` and `apps/web/public/images/psychologists/Ratri.webp`.
- [x] **2. Register Canonical Seed Fixture in Backend**:
  - Add `ratri` fixture in `apps/api/src/db/seed-psychologists.ts` with SIPP `20220002-2024-02-3561`, TBI branch, adultClinical, 4 years experience, localized specializations, and booking URLs.
  - Update `apps/api/src/db/seed-psychologists.test.ts` or related contract tests.
- [x] **3. Update Web Data & Manifests**:
  - Add Ratri to `apps/web/src/data/psychologists.ts` and `apps/web/src/assets/images.ts`.
- [x] **4. Seed Local Database & Verify in Local**:
  - Run `bun run db:seed:psychologists --force` against local database.
  - Run test suite: `bun run test:web` and API seed tests (`bun test apps/api/src/db/seed-psychologists.test.ts`).
- [x] **5. Graph Rebuild & Verification**:
  - Rebuild knowledge graph with `build_or_update_graph_tool`.
  - Verify all items complete and provide report.
