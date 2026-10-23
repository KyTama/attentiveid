# Task: Update Campaign Redirect URLs for Free Session and Assessment

> **Status:** COMPLETED  
> **Goal:** Update outbound campaign URLs for `free-session` and `assessment` (test centre) across landing components and tests.

---

## Action Items
- [x] **1. Landing Components Update**:
  - Update `apps/web/src/components/landing/CampaignFloatingDock.tsx`:
    - `free-session` -> `https://free-session.attentiveid.com`
    - `assessment` / `test-centre` -> `https://assessment.attentiveid.com/`
  - Update `apps/web/src/components/landing/CampaignSection.tsx`:
    - `free-session` -> `https://free-session.attentiveid.com`
    - `test-centre` -> `https://assessment.attentiveid.com/`
  - Update `apps/web/src/components/landing/HomepageHero.tsx`:
    - `free-session` -> `https://free-session.attentiveid.com`
    - `test-centre` -> `https://assessment.attentiveid.com/`
- [x] **2. Test Suite Update**:
  - Update `apps/web/tests/homepage.test.tsx` assertions for new URLs.
- [x] **3. Verification & Knowledge Graph Sync**:
  - Run `bun --filter web test` (58/58 tests passed).
  - Run `bun --filter web build` (production build passed, zero TypeScript/Vite errors).
  - Synchronize knowledge graph index.
