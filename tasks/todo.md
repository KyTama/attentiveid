# Task: Port "Attend — Let there be light" to `/let-there-be-light`

> **Branch:** `feat/let-there-be-light`
> **Workspace:** `/Users/kytama/Projects/Neo-Attentive/attentiveid-let-there-be-light`
> **Approach:** Option A — Hybrid Native React Route (`/let-there-be-light`) with Scoped CSS & Modular TypeScript Engine

---

## Action Items
- [x] **1. Analyze source & inspect assets:** Audit `Attend - Let there be light.html`, verify `Caddyfile` routing constraints, and stage `96x96` gold mark asset at `apps/web/public/images/brand/attend-mark.png`.
- [x] **2. Extract data, copy & types (`script.ts`):** Port bilingual clinical ladders (`TASKS`, `PATH`, `CHECK_AFTER`, `NODES`, `PRAYER`, `WISH`, `UI`, `DEEP`, state/storage helpers) with strict TypeScript types.
- [x] **3. Extract WebGL, Particle & Audio engines (`sky.ts`, `dust.ts`, `sound.ts`):** Port the 5-octave `fbm` WebGL shader, 2D dust/ember/firefly canvas renderer (with null-context safety), and Web Audio pentatonic chimes with full cleanup/dispose support.
- [x] **4. Build scoped CSS & imperative stage engine (`let-there-be-light.css`, `engine.ts`):** Scope all theme tokens/animations to `.attend-root` and `.attend-root.lit`, preserve 600ms press-and-hold physics, fit-scaling, word blur reveal, crisis triage, and `#tablet*` kiosk auto-reset with zero global leaks on unmount.
- [x] **5. Wire React page & route (`LetThereBeLightPage.tsx`, `App.tsx`):** Mount the controller cleanly under `<Route path="let-there-be-light" element={<LetThereBeLightPage />} />` in `PublicLayout`, inject `Cormorant Garamond` + `Instrument Sans` stylesheet on mount, manage `document.title`/`lang`, and clean up on unmount.
- [x] **6. Verify (`vitest`, `lint`, `build:web`, knowledge graph):** Add comprehensive unit + route integration tests (`apps/web/tests/let-there-be-light.test.tsx`), run full web tests, lint, production build, and update `code-review-graph`.
