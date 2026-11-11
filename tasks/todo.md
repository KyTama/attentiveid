# Task: Fix Hero Trust Metrics Content Mismatch

> **Status:** COMPLETED  
> **Goal:**
> 1. Restore the 4 canonical trust metrics for Hero section in `defaultLandingData` (`LandingCmsPage.tsx`):
>    - Metric 1: Value `3.000+` | Label `Sesi terlaksana` (Sessions delivered)
>    - Metric 2: Value `18` | Label `Psikolog` (Psychologists)
>    - Metric 3: Value `5,0` | Label `Rating Google` (Google rating)
>    - Metric 4: Value `53` | Label `Ulasan Google` (Google reviews)
> 2. Improve Hero item repeater UX in `LandingCmsPage.tsx`:
>    - Clearly label inputs as "Label Metrik" and "Angka / Nilai Metrik" when editing Hero section.
>    - Add a 1-click "Reset ke 4 Metrik Bawaan" button for Hero section.
> 3. Update the live database revision on the VPS to restore the 4 metrics counter.
> 4. Verify all tests, build, deploy, and verify live.

---

## Action Items
- [x] **1. Fix `defaultLandingData` in `apps/web/src/pages/dashboard/LandingCmsPage.tsx`**:
  - Update `hero.items` with the 4 canonical trust metric items (title = label, description = value).
- [x] **2. Enhance Hero Item Repeater Editor UX in `LandingCmsPage.tsx`**:
  - Distinguish Hero items as Trust Metrics (show "Label Metrik" and "Angka / Nilai" placeholders).
  - Add "Kembalikan 4 Angka Metrik Resmi" quick button.
- [x] **3. Update Live Database on VPS**:
  - Re-publish clean revision with 4 canonical trust metrics on staging database.
- [x] **4. Build, Test, Deploy to VPS & Verify**:
  - Run web & API tests (`bun test apps/api`, `cd apps/web && bun run test --run`).
  - Commit, push, monitor CI/CD deploy.
