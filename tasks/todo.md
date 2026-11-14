# Task: Split Products Menu & Fix Hero Slider Timer Animation

> **Branch:** `feat/navbar-menu-split`
> **Workspace:** `/Users/kytama/Projects/Neo-Attentive/attentiveid-free-session`

---

## Action Items
- [x] **1. Update navigation i18n keys (`en.json` & `id.json`)** for `ourServices`, `ourScience`, `academicArticles`, `scientificBrief`, `laboratory`, and `comingSoon`.
- [x] **2. Refactor `SiteHeader.tsx` (desktop + mobile) and `map-data.ts`**:
  - Replace `Products` dropdown with:
    - `Our Services` (inert/non-navigating placeholder while new pages are in design, `aria-disabled="true"`).
    - `Our Science` dropdown linking to `Academic Articles` (`/articles`), `Scientific Brief` (`/sci-brief`), and `Laboratory` (`Coming Soon`, `aria-disabled="true"`).
- [x] **3. Fix hero tab timer animation in `HomepageHero.tsx`**:
  - Drive active tab progress (`scaleX`) and autoplay transition with a single `requestAnimationFrame` + `useMotionValue` clock (`elapsedMsRef`), preserving progress on stage hover instead of snapping to `45%`.
  - Scope mouse hover pause to the main stage card only and focus pause to `:focus-visible` so clicking tabs `01`/`02`/`03` never traps `isPaused = true`.
- [x] **4. Verify (`test:web`, `lint`, `build:web`)** and synchronize the knowledge graph.
