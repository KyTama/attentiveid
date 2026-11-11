# Task: Dedicated CMS Hero Architecture & Command Strip / Trust Metrics Sub-Section Editors

> **Status:** COMPLETED (LOCAL-ONLY COMMIT)  
> **Rule:** STRICTLY LOCAL FIRST. NEVER PUSH TO GITHUB BEFORE EXPLICIT INSTRUCTION.

---

## Action Items
- [x] **1. Schema & Type Extensions (`packages/shared/src/content.ts`)**:
  - Add `HeroCampaignItemSchema` and `HeroCampaignsSchema` with `badge`, `title`, `description`, `cta`, and destination `url`.
  - Add `primaryCtaUrl`, `secondaryCtaUrl`, and optional `campaigns` to `HeroSectionSchema`.
- [x] **2. Frontend Dynamic Binding (`HomepageHero.tsx`)**:
  - Bind Slide 1 and Slide 2 CTA buttons to `primaryCtaUrl` and `secondaryCtaUrl` (handles internal `#anchors`, `/routes`, and external URLs).
  - Dynamically read `campaigns` from CMS draft/published content with i18n fallbacks.
- [x] **3. Unified CMS 3-Sub-Section Editor (`LandingCmsPage.tsx`)**:
  - Remove confusing legacy 10-slide generic carousel manager.
  - Sub-Section 1: **Highlight Card (2 Slide)** — Photo upload/preview, kicker tag, dual-color headline (`**gold**`), description, Primary & Secondary CTA button labels AND target URLs.
  - Sub-Section 2: **Program & Layanan Unggulan (Command Strip)** — Eyebrow, description, and 3 dedicated card editors (Promo Khusus, Jadwal Langsung, Tes Online) with badge, title, description, CTA text, and destination URL.
  - Sub-Section 3: **Trust Metrics Counter Bar (4 Item)** — Live DB active psychologists sync button, 4 official metrics reset button, session milestone presets (`3.000+` .. `5.000+`), and 4 counter cards.
- [x] **4. Live Simulator Reactive Highlighting**:
  - Active sub-section is visually highlighted with amber ring in the live simulator preview.
  - Command strip and Trust Metrics dynamically reflect edits in real time.
- [x] **5. Verification & Tests**:
  - All 14 test suites (73 tests) in `apps/web` pass.
  - All 122 tests in `apps/api` pass.
  - Production build `bun run build:web` succeeds with 0 errors.
