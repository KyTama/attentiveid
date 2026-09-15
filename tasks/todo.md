# Active Task Checklist: Phase 1.19 — Navigation Hierarchy, Mobile Photo Positioning & Brand Theme Evaluation

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.9 (IA Streamlining, Mobile Framing & Brand Cohesion)  
> **Active Focus:** Fix fragmented navigation link order and page ping-pong, fix mobile photo collision and positioning in the homepage carousel, provide architectural trade-off evaluation for brand navy navigator & footer, and execute verified implementation.

---

## Task Checklist
- [x] **Step 1: Streamline Header Navigation Flow & Eliminate Page Ping-Pong**:
  - Reorder navigation items into cohesive user journey: Layanan (`/#support`), Psikolog Kami (`/#psychologists`), Lokasi (`/#locations`), FAQ (`/#faq`), Artikel (`/articles`).
  - Implement smooth on-page anchor scroll on homepage so clicking menu items scrolls natively instead of reloading or jumping jarringly.
  - Update mobile drawer so selecting an anchor smoothly scrolls and closes the drawer cleanly.
- [x] **Step 2: Fix Homepage Psychologist Mobile Photo Positioning & Card Collision**:
  - In `FeaturedPsychologists.tsx`: remove the redundant floating badge (`absolute top-4 left-4`) that was blocking the psychologist's forehead/face.
  - Improve image framing: calibrate object-position (`object-[center_12%]`) and headroom so portraits are never cropped by top arches.
  - Fix mobile card collisions: enforce proper slide spacing (`-ml-3 sm:-ml-4` and `pl-3 sm:pl-4`), max-width constraints (`max-w-[260px] sm:max-w-sm`), and `overflow-hidden` on card container so slides never overlap or bump adjacent cards during swipe.
- [x] **Step 3: Brand Identity Sparring & Architectural Guidance (Navy Navigator vs Footer)**:
  - Deliver deep comparative analysis (Option 1: Navy Footer only [Recommended], Option 2: Navy Header + Footer [Bookends], Option 3: Navy Header only).
  - Implement Option 1 (Deep Navy Brand Footer with gold logo and high-contrast typography) to ground the page seamlessly after `ClosingInvitation`.
- [x] **Step 4: Verification & Autonomous Push**:
  - Run `apps/web` linter (0 errors) and full vitest suite (56 tests passed).
  - Verify CI contracts and runtime configurations (100% passed).
  - Stage and commit atomically, then push to `origin/master`.

---

## Review & Sparring Summary
- **Navigation Flow**:
  - Eliminated the zig-zag page reload pattern where clicking between Layanan and Lokasi kicked the user to a separate `/psychologists` page.
  - 1 through 4 now correspond directly to on-page sections that smooth-scroll natively without hash jumps.
- **Mobile Photo Framing & Collision Prevention**:
  - Photo container given mobile width constraint `max-w-[260px]` and softened top arch (`rounded-t-[2.5rem]`).
  - Added `overflow-hidden` on card and normalized Embla margin offsets to eliminate slide collision.
  - Removed redundant floating badge that was covering Nichi's and other psychologists' foreheads.
- **Navy Brand Footer**:
  - Footer converted from light beige to `bg-secondary text-white` with gold headers (`text-primary`) and gold logo, perfectly continuing `ClosingInvitation`.






