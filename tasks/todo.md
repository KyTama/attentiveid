# Task: Dynamic Hero Metrics & Testimonial Management System with Auto-Moving Carousel

> **Status:** COMPLETED  
> **Directives:** DO NOT PUSH to remote yet (local commits are permitted).  
> **Goals:**
> 1. Make dynamic count of psychologists and sessions delivered easily updatable in dashboard by admin & superadmin (with 1-click DB sync button).
> 2. Create new dashboard menu & page for Testimonials CRUD (`/dashboard/testimonials`).
> 3. Display testimonials on the homepage with an auto-moving carousel (like bicarakan.id) with pause on hover and Emil Kowalski spring polish.

---

## Action Items
- [x] **1. Dynamic Trust Metrics in Dashboard**:
  - In `LandingCmsPage.tsx`: Enhance Hero trust metrics editor with 1-click DB sync button `[🔄 Sinkronkan Jumlah Psikolog Aktif dari DB]` and quick session milestone presets.
  - In `DashboardOverviewPage.tsx`: Show live trust metrics with quick jump to update them.
- [x] **2. Testimonial Management Dashboard (`/dashboard/testimonials`)**:
  - Add `Testimonials` item to `DashboardLayout.tsx` navigation sidebar for admin/superadmin.
  - Create `TestimonialsCmsPage.tsx` with full CRUD: Add, Edit, Delete, Reorder, and Preview testimonial cards.
  - Register `/dashboard/testimonials` route in `App.tsx`.
- [x] **3. Auto-Moving Testimonials Carousel on Homepage**:
  - Redesign `ClientStories.tsx` into an elegant, infinite auto-moving marquee carousel (concept inspired by bicarakan.id).
  - Include pause-on-hover, 5-star ratings, verified client badge, counseling format pill, and smooth Framer Motion spring physics.
- [x] **4. Build, Test & Verify Locally**:
  - Run `bun test apps/api` and `cd apps/web && bun run test --run`.
  - Run `bun run build:web`.
  - Commit locally (WITHOUT PUSHING).
