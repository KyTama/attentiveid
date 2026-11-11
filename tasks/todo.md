# Task: Update Attentive Malang Location Maps Link

> **Status:** COMPLETED  
> **Goal:**
> Update Google Maps URL for Attentive Malang branch to `https://maps.app.goo.gl/p8NG5KWG2nJipPnn6` across `apps/web/src/data/contact.ts` and i18n locale files (`id.json` & `en.json`).

---

## Action Items
- [x] **1. Update `apps/web/src/data/contact.ts`**:
  - Replace old Malang maps link with `https://maps.app.goo.gl/p8NG5KWG2nJipPnn6`.
- [x] **2. Update `apps/web/src/i18n/locales/id.json` and `en.json`**:
  - Add/update Attentive Malang entry in `clinics_locations.locations` with `maps_link: "https://maps.app.goo.gl/p8NG5KWG2nJipPnn6"`.
- [x] **3. Build & Test**:
  - Run `cd apps/web && bun run test --run` and `bun run build:web`.
- [x] **4. Commit, Push & Deploy to Server**:
  - Push to master and verify live on server.
