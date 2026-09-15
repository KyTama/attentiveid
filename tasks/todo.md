# Active Task Checklist: Phase 1.12 — Psychologist Bios Implementation & Dropdown UX Density

> **Status:** IN_PROGRESS  
> **Milestone:** Milestone 1.5 (Content Refinement & Psychologist Presentation)  
> **Active Focus:** Implement dual-tier psychologist biographies (long-form for profiles, short-form for dropdowns/selectors), update DB schema & seed fixtures for Ella, Nichi, and Domi, wire up web components (profile details & intake/dropdown previews), and deliver UI length analysis.

---

## Task Checklist
- [x] **Step 1: Schema & Data Model Evolution**:
  - Add `short_bio` / `shortBio` to `psychologistProfileTranslations` in `schema.ts`, shared schemas in `packages/shared`, repository projections, and web types.
  - Update `seed-psychologists.ts` with user-supplied long & short bios for Gisella (Ella), Nichi (Dwi), and Dominika (Domi).
  - Update `apps/web/src/data/psychologists.ts` with corresponding short & long bio fields.
- [x] **Step 2: Profile Page Long-Form Bio Implementation**:
  - Update `PsychologistProfileDetails.tsx` to render multi-paragraph personal biographies (`psychologist.biography`) with fallback to default copy.
  - Enhance quote / personal philosophy presentation to balance the grid layout.
- [x] **Step 3: Dropdown & Compact Selector Short-Form Bio Implementation**:
  - Wire short bio into `ConsultationIntakeModal.tsx` psychologist selection cards.
  - Provide psychologist dropdown preview / select representation with short bio support.
  - Add optional short bio preview in directory cards (`PsychologistDirectoryCard.tsx`).
- [x] **Step 4: Verification & Automated Tests**:
  - Run shared tests, API tests, and web tests (`bun test`).
  - Verify typecheck and build pass cleanly.
- [x] **Step 5: UX Copy & Length Analysis (Kepanjangan/Kependekan Review)**:
  - Provide in-depth analysis on word counts, line-lengths (typographic 45-75 CPL rule), cognitive load in dropdowns vs modal cards, and actionable recommendations.

---

## Previous Milestones
- [x] Phase 1.11: Admin Dashboard Refinement, Pure Light Theme & Schema Alignment
- [x] Phase 1.10.2: Footer Linked Titles & Ultra-Slim Footprint
- [x] Phase 1.10.0: Clinic Locations Section (#locations) & Multi-Branch Architecture
- [x] Phase 1.9.9: Infinite Loop Carousel on Highlight Section
- [x] Phase 1.9.8: Prioritize Dr. Haykal & Seed Order Idempotency
- [x] Phase 1.9.7: Psychologist Portrait Orientation, Uniform Sizing & Brand Placeholder
- [x] Phase 1.9.6: Psychologist Schema Evolution & Data Center Alignment
- [x] Phase 1.9: Dynamic Intake Survey & Screening UI/API
- [x] Phase 1.8: Bilingual Articles System & CMS Editorial Review
- [ ] Phase 1.13: Deployment Hardening & Tencent VPS Go-Live (Deferred)
  - [x] **Staging Unblock**: Temporary `NOPASSWD: ALL` granted for `assessment_platform` via `/etc/sudoers.d/99-temp-assessment-platform` (`chmod 0440`, `visudo -cf`).
  - [ ] **Post-Staging Audit**: Extract actual executed commands from `/var/log/auth.log` (`sudo grep 'COMMAND='`).
  - [ ] **File Ownership Cleanup**: Inspect and remediate any `root:root` polluted files in application directory (`find <path> -user root`).
  - [ ] **Staging Hardening**: Transition `/etc/sudoers.d/99-temp-assessment-platform` to strict whitelisted commands (or `docker` group).
  - [ ] **Production Guard**: Enforce zero-unrestricted sudo for CI/CD user in production VPS; verify runbook in `.docs/guides/ci-cd-sudo-and-prod-hardening.md`.

