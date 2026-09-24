# Active Task Checklist: Wording Alignment (Option B: Consultation & Care Narrative)

> **Status:** COMPLETED (Committed locally, NOT pushed)  
> **Milestone:** Milestone 1.9 (Stakeholder Review & Brand Architecture Convergence)  
> **Active Focus:** Aligned CTA wording and modal titles across Header, Hero, and Intake Modal according to Option B (Care & Consultation Narrative).

---

## Task Checklist
- [x] **Step 1: Check Current Usage & Blast Radius**:
  - Found `intakeDialog.title` in `id.json` and `en.json`.
  - Identified usage in `SiteHeader.tsx`, `Navbar.tsx`, `HomepageHero.tsx`, and `ConsultationIntakeModal.tsx`.
- [x] **Step 2: Update Locales (EN & ID)**:
  - Header CTA: "Plan a session" (EN) / "Konsultasi sekarang" (ID) via `homepage.nav.headerCta` & `nav.headerCta`.
  - Intake Dialog title: "Plan Your Consultation" (EN) / "Atur Sesi Konseling" (ID).
  - Hero primaryAction: "Plan your session" (EN) / "Rencanakan sesi konseling" (ID).
  - Hero secondaryAction: "Find your psychologist" (EN) / "Temukan psikologmu" (ID).
- [x] **Step 3: Update Header & Navbar Call-To-Action**:
  - In `SiteHeader.tsx` & `Navbar.tsx`: use dedicated header CTA translation (`t('homepage.nav.headerCta')` & `t('nav.headerCta')`).
- [x] **Step 4: Verify Tests & Build**:
  - Ran `bun run test:web` (57/57 tests passing).
  - Ran `cd apps/web && bun run build` (Clean build with zero TS errors).
- [x] **Step 5: Local Commit (NO PUSH) & Knowledge Graph Update**:
  - Commit locally with descriptive commit message.
  - Update knowledge graph index with `build_or_update_graph_tool`.
