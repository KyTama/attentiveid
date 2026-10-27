# Task: Set Landing Page Default Language to Indonesian (id)

> **Status:** COMPLETED  
> **Goal:** Set default language of the landing page (`apps/web`) to Indonesian (`id`), prioritizing it over browser defaults while respecting explicit user language selection in `localStorage`.

---

## Action Items
- [x] **1. Update i18n Configuration**:
  - Update `apps/web/src/i18n/index.ts`:
    - Set `fallbackLng: 'id'`
    - Adjust `LanguageDetector` options (`detection: { order: ['localStorage', 'cookie'], caches: ['localStorage', 'cookie'] }`) so first-time visitors default to Indonesian (`id`) regardless of browser locale, while retaining user toggle in `localStorage`.
- [x] **2. Verify Test Suite & Build**:
  - Run `bun run test:web` (58/58 passed)
  - Run `bun run build:web` (Vite production build passed cleanly)
- [x] **3. Graph Rebuild & Harvest**:
  - Update knowledge graph (synced with HEAD commit)
  - Complete checklist
